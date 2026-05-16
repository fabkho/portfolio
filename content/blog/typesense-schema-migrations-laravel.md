---
title: Typesense Schema Migrations in Laravel
author: Fabian Kirchhoff
date: 2026-05-10
description: How to patch Typesense collections at deploy time using Laravel migrations instead of flushing and re-indexing.
featured: false
specs:
  - LARAVEL
  - TYPESENSE
  - SCOUT
status: published
tag: BACKEND
---

# Typesense Schema Migrations in Laravel

Adding a field to a Typesense collection usually means: flush the collection, recreate it with the new schema, re-import every document. For a collection with hundreds of thousands of documents, that means minutes of downtime where search doesn't work.

I needed a better way. My order search index has hundreds of thousands of documents. Flushing and re-indexing takes time, and during that window, users can't search. So I built a migration-based approach that patches the live Typesense collection in place — no downtime, no data loss.

## How Laravel Scout Indexes Data

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

The data flow:

1. **Model saved** → Scout's `ModelObserver` fires
2. `shouldBeSearchable()` → decides if the model belongs in the index
3. `toSearchableArray()` → serializes the model into a flat document
4. `TypesenseEngine::update()` → bulk upserts documents via Typesense's JSONL import API

For bulk imports, `php artisan scout:import "App\Models\Order"` processes records in chunks of 500, calling `toSearchableArray()` on each and upserting them.

## The Problem: Schema Changes

Typesense collections have a strict schema. Every field needs a name, type, and configuration before documents can include it. When I wanted to add a `tags` field to orders, I had two options:

### Option A: Flush and Recreate

```bash
php artisan scout:flush "App\Models\Order"
php artisan scout:import "App\Models\Order"
```

This works, but:

- `scout:flush` deletes the entire Typesense collection — not just documents, the collection itself
- During re-import, search returns no results
- Re-indexing 500k orders takes several minutes
- If the import fails halfway, you're left with a partial index

`scout:import` alone (without flush) upserts documents into the existing collection — it doesn't require a flush. The flush here is only needed because the collection schema itself needs to change.

### Option B: Patch the Schema

Typesense's [Collection API](https://typesense.org/docs/27.1/api/collections.html#update-or-alter-a-collection) supports PATCH requests to add or remove fields from an existing collection without touching the documents already in it.

## TypesenseSchemaService

I built a service that wraps the Typesense PHP client with idempotent field-level operations:

```php
class TypesenseSchemaService
{
    public static function isEnabled(): bool
    {
        return config('scout.driver') === 'typesense';
    }

    public function addField(string $collection, array $fieldDefinition): void
    {
        if ($this->fieldExists($collection, $fieldDefinition['name'])) {
            return;
        }

        $this->client->collections[$this->prefixed($collection)]->update([
            'fields' => [$fieldDefinition],
        ]);
    }

    public function dropField(string $collection, string $fieldName): void
    {
        if (!$this->fieldExists($collection, $fieldName)) {
            return;
        }

        $this->client->collections[$this->prefixed($collection)]->update([
            'fields' => [['name' => $fieldName, 'drop' => true]],
        ]);
    }

    private function fieldExists(string $collection, string $fieldName): bool
    {
        $schema = $this->client->collections[$this->prefixed($collection)]->retrieve();
        return in_array($fieldName, array_column($schema['fields'], 'name'), true);
    }

    private function prefixed(string $collection): string
    {
        return config('scout.prefix') . $collection;
    }
}
```

Two things matter:

1. **Idempotent** — `addField` checks if the field exists before adding. Running the same migration twice doesn't fail.
2. **Reversible** — `dropField` removes a field cleanly. Standard migration rollback.

## The Migration

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
            'name' => 'tags',
            'type' => 'string[]',
            'optional' => true,
        ]);
    }

    public function down(): void
    {
        if (!TypesenseSchemaService::isEnabled()) {
            return;
        }

        TypesenseSchemaService::make()->dropField('orders', 'tags');
    }
};
```

The `isEnabled()` guard is important — in test environments or local setups without Typesense, the migration is a no-op.

This deploys with `php artisan migrate`, right alongside your database migrations. No separate deployment step, no manual commands.

The model's `toSearchableArray()` needs to include the new field:

```php
public function toSearchableArray(): array
{
    return [
        'id' => (string) $this->id,
        'number' => $this->number,
        'customer_name' => $this->customer?->name,
        'status' => $this->status->value,
        'total' => $this->total,
        'created_at' => $this->created_at?->timestamp,
        'tags' => $this->tags->pluck('name')->all(),
    ];
}
```

And if the new field should be searchable, update the Scout config:

```php
// config/scout.php → typesense.model-settings
Order::class => [
    'search-parameters' => [
        'query_by' => 'number,customer_name,tags',
    ],
],
```

## What Happens After the Migration

The schema PATCH is a [synchronous blocking operation](https://typesense.org/docs/27.1/api/collections.html#update-or-alter-a-collection) — incoming writes to the collection wait until it completes, but **search queries continue without interruption**. For adding an optional field, this completes in milliseconds.

After the migration, the `tags` field exists in the Typesense schema but no documents have values for it yet. Because the field is `optional: true`, existing documents remain valid and searchable.

Documents get the new field naturally through Scout's model observer — whenever an order is updated for any reason, Scout calls `toSearchableArray()` and the new field is included. Over time, the index fills in without any bulk operation.

If you need the field populated faster for a subset of records, you can use Scout's `searchable()` method, which re-indexes models by calling `toSearchableArray()` and upserting the result to Typesense:

```php
Order::whereHas('tags')->searchable();
```

This re-indexes only the orders that actually have tags — not the entire collection.

## Comparison

| Approach                           | Downtime                            | Data Loss Risk                      | Deployment            | Rollback                       |
| ---------------------------------- | ----------------------------------- | ----------------------------------- | --------------------- | ------------------------------ |
| `scout:flush` + `scout:import`     | Minutes (proportional to data size) | High (partial re-index)             | Manual commands       | Re-run flush + import          |
| Schema migration + scoped re-index | Zero                                | None (existing documents untouched) | `php artisan migrate` | `php artisan migrate:rollback` |

## When to Use Each Approach

**Schema migration** works when you're:

- Adding optional fields
- Removing fields
- Changing field configuration (e.g., facet or index flags)

**Flush and recreate** is still necessary when you:

- Change a field's type (e.g., `string` → `int32`)
- Rename a field (Typesense doesn't support renames — add new, backfill, drop old)
- Restructure the entire schema

For most day-to-day feature work — adding a new searchable field, making something filterable, indexing a new relationship — the migration approach keeps search running while you deploy.

## Resources

- [Typesense: Update or Alter a Collection](https://typesense.org/docs/27.1/api/collections.html#update-or-alter-a-collection)
- [Laravel Scout Documentation](https://laravel.com/docs/scout)
- [Typesense PHP Client](https://github.com/typesense/typesense-php)
