---
title: Typesense Schema Migrations in Laravel
author: Fabian Kirchhoff
date: 2026-05-10
description: How we patch Typesense collections at deploy time using Laravel migrations instead of flushing and re-indexing.
featured: false
specs:
  - LARAVEL
  - TYPESENSE
  - SCOUT
status: published
tag: BACKEND
---

# Typesense Schema Migrations in Laravel

Adding a field to a Typesense collection usually means: flush the collection, recreate it with the new schema, re-import every document. For a collection with millions of documents, that means minutes of downtime where search doesn't work.

We needed a better way. At [anny.co](https://anny.co), our order search index has hundreds of thousands of documents. Flushing and re-indexing takes time, and during that window, users can't search. So we built a migration-based approach that patches the live Typesense collection in place — no downtime, no data loss.

## How Laravel Scout Indexes Data

Before diving into the solution, here's how Scout's Typesense integration works. If you're already familiar, skip to [the problem](#the-problem-schema-changes).

Scout adds a `Searchable` trait to Eloquent models. The trait hooks into model lifecycle events — when a model is created, updated, or deleted, Scout automatically syncs it to Typesense.

```php
class Order extends Model
{
    use Searchable;

    public function toSearchableArray(): array
    {
        return [
            'id' => (string) $this->id,
            'number' => $this->number,
            'customer_name' => $this->customer?->name,
            'status' => $this->status->value,
            'total' => $this->total,
            'created_at' => $this->created_at?->timestamp,
        ];
    }
}
```

The data flow is straightforward:

1. **Model saved** → Scout's `ModelObserver` fires
2. `shouldBeSearchable()` → decides if the model belongs in the index
3. `toSearchableArray()` → serializes the model into a flat document
4. `TypesenseEngine::update()` → bulk upserts documents via Typesense's JSONL import API

For bulk imports, `php artisan scout:import "App\Models\Order"` processes records in chunks of 500, calling `toSearchableArray()` on each and upserting them.

## The Problem: Schema Changes

Typesense collections have a strict schema. Every field needs a name, type, and configuration before documents can include it. When you want to add a new searchable field — say, custom form entries attached to orders — you have two options:

### Option A: Flush and Recreate (The Blunt Approach)

```bash
php artisan scout:flush "App\Models\Order"    # deletes the entire collection
php artisan scout:import "App\Models\Order"    # recreates and re-indexes everything
```

This works, but:

- `scout:flush` **deletes the entire Typesense collection** — not just documents, the collection itself
- During re-import, search returns no results
- Re-indexing 500k orders takes several minutes
- If the import fails halfway, you're left with a partial index

### Option B: Patch the Schema (The Surgical Approach)

Typesense's Collection API supports PATCH requests to add or remove fields from an existing collection without touching the documents already in it. This is what we built.

## TypesenseSchemaService

We created a service that wraps the Typesense PHP client with idempotent field-level operations:

```php
class TypesenseSchemaService
{
    use Makeable;

    private Client $client;

    public function __construct()
    {
        $this->client = app(Client::class);
    }

    public static function isEnabled(): bool
    {
        return config('scout.driver') === 'typesense';
    }

    public function addField(string $collection, array $fieldDefinition): void
    {
        if (!isset($fieldDefinition['name'])) {
            throw new \InvalidArgumentException('Field definition must include a name.');
        }

        $existingFields = $this->getExistingFieldNames($collection);

        if (in_array($fieldDefinition['name'], $existingFields, true)) {
            Log::info("Field '{$fieldDefinition['name']}' already exists in '{$collection}'. Skipping.");
            return;
        }

        $collectionName = config('scout.prefix') . $collection;
        $this->client->collections[$collectionName]->update([
            'fields' => [$fieldDefinition],
        ]);
    }

    public function dropField(string $collection, string $fieldName): void
    {
        $existingFields = $this->getExistingFieldNames($collection);

        if (!in_array($fieldName, $existingFields, true)) {
            Log::info("Field '{$fieldName}' does not exist in '{$collection}'. Skipping.");
            return;
        }

        $collectionName = config('scout.prefix') . $collection;
        $this->client->collections[$collectionName]->update([
            'fields' => [['name' => $fieldName, 'drop' => true]],
        ]);
    }

    private function getExistingFieldNames(string $collection): array
    {
        $collectionName = config('scout.prefix') . $collection;
        $schema = $this->client->collections[$collectionName]->retrieve();
        return array_column($schema['fields'], 'name');
    }
}
```

Two things matter here:

1. **Idempotent** — `addField` checks if the field exists before adding. Running the same migration twice doesn't fail.
2. **Reversible** — `dropField` removes a field cleanly. Standard migration rollback.

## Migrations, Not Commands

The key insight: treat Typesense schema changes like database schema changes. Use Laravel migrations.

```php
return new class extends Migration
{
    public function up(): void
    {
        if (!TypesenseSchemaService::isEnabled()) {
            return;
        }

        TypesenseSchemaService::make()->addField('orders', [
            'name' => 'custom_entries_list',
            'type' => 'string[]',
            'optional' => true,
        ]);
    }

    public function down(): void
    {
        if (!TypesenseSchemaService::isEnabled()) {
            return;
        }

        TypesenseSchemaService::make()->dropField('orders', 'custom_entries_list');
    }
};
```

The `isEnabled()` guard is important — in test environments or local setups without Typesense, the migration is a no-op.

This deploys with `php artisan migrate`, right alongside your database migrations. No separate deployment step, no manual commands.

## The Full Feature: Searchable Custom Fields

Here's how we used this pattern to make order custom field entries searchable. Four files, 83 lines of changes.

### 1. Model Accessor

Custom field entries are a polymorphic relationship on Order. We flatten them into a string array:

```php
// Order.php
public function getCustomEntriesListAttribute(): array
{
    return $this->customEntries
        ->map(fn (CustomFieldEntry $entry) => $entry->text_value)
        ->all();
}
```

### 2. Search Index Definition

We use a `$searchIndex` property on searchable traits to declaratively define the Typesense schema. Adding the field here does two things: it includes the field in the collection schema, and marks it as queryable for search:

```php
// OrderSearchable.php
protected static array $searchIndex = [
    'properties' => [
        'number' => ['type' => 'string', 'searchable' => true],
        'customer_name' => ['type' => 'string', 'searchable' => true],
        // ... existing fields ...

        'custom_entries_list' => [
            'type' => 'string[]',
            'optional' => true,
            'searchable' => true,
        ],
    ],
];

public function searchableWith(): array
{
    return ['customer.address', 'bookings', 'invoices', 'organization', 'customEntries'];
}
```

The `searchableWith()` method ensures the `customEntries` relationship is eager-loaded during indexing — without it, each order would trigger a separate query for its custom entries.

### 3. Schema Migration

The migration shown above patches the live collection. After deployment, the `custom_entries_list` field exists in the Typesense schema but no documents have values for it yet.

### 4. Document Backfill

Since the field is `optional`, existing documents work fine without it — they just won't match on custom entry searches. Documents get the new field when:

- **Individually**: Any order that gets updated triggers Scout's observer, which re-indexes it with the new field included
- **In bulk**: `php artisan scout:import "App\Models\Order"` re-indexes everything

We ran the bulk import after deployment. But the critical difference from flush-and-recreate: **search kept working the entire time**. Existing documents were still searchable while new ones were being indexed with the additional field.

## Searchable Array Generation

Our `SearchHelperService` iterates over `$searchIndex['properties']` and reads each field from the model:

```php
public function buildSearchableArray(?Model $model, array $properties): ?array
{
    $result = [];

    foreach ($properties as $field => $config) {
        if (isset($config['properties'])) {
            // Nested relation — recurse
            $result[$field] = $this->buildSearchableArray(
                $model->{$field},
                $config['properties']
            );
        } else {
            // Direct field — read from model
            $result[$field] = $this->processField($model, $field, $config);
        }
    }

    return $result;
}
```

For `custom_entries_list`, `$model->custom_entries_list` hits the Eloquent accessor, which returns the flat `string[]`. Typesense indexes each string in the array individually, so searching "John" matches an order where one of the custom entries contains "John Doe".

## Query Integration

On the search side, `getQueryableFields()` collects all fields with `'searchable' => true` and joins them into Typesense's `query_by` parameter:

```php
public static function getQueryableFields(): string
{
    return collect(static::$searchIndex['properties'])
        ->filter(fn ($config) => $config['searchable'] ?? false)
        ->keys()
        ->implode(',');
}
```

After our change, `query_by` includes `custom_entries_list`, so user searches automatically match against custom field values — no changes to search controllers or API endpoints.

## Comparison

| Approach                             | Downtime                            | Data Loss Risk                      | Deployment            | Rollback                       |
| ------------------------------------ | ----------------------------------- | ----------------------------------- | --------------------- | ------------------------------ |
| `scout:flush` + `scout:import`       | Minutes (proportional to data size) | High (partial re-index)             | Manual commands       | Re-run flush + import          |
| Schema migration + targeted re-index | Zero                                | None (existing documents untouched) | `php artisan migrate` | `php artisan migrate:rollback` |

## When to Use Each Approach

**Schema migration** works when you're:

- Adding optional fields
- Removing fields
- Changing field configuration (e.g., `searchable` flag)

**Flush and recreate** is still necessary when you:

- Change a field's type (e.g., `string` → `int32`)
- Rename a field (Typesense doesn't support renames — you'd add new, backfill, drop old)
- Restructure the entire schema

For most day-to-day feature work — adding a new searchable field, making something filterable, indexing a new relationship — the migration approach keeps search running while you deploy.

## Resources

- [Typesense Collection Schema API](https://typesense.org/docs/latest/api/collections.html#update-a-collection)
- [Laravel Scout Documentation](https://laravel.com/docs/scout)
- [Typesense PHP Client](https://github.com/typesense/typesense-php)
