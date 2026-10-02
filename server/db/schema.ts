import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * One row per counted page. `total` across the site is `SUM(views)`.
 */
export const pageViews = sqliteTable('page_views', {
  path: text('path').primaryKey(),
  views: integer('views').notNull().default(0)
})

/**
 * One random salt per UTC day. Yesterday's is deleted as soon as today's is
 * created, so visitor hashes can't be recomputed or linked across days.
 */
export const viewSalts = sqliteTable('view_salts', {
  day: text('day').primaryKey(),
  salt: text('salt').notNull()
})

/**
 * Who has already been counted today, per page. `hash` is
 * SHA-256(salt + IP + user agent + path); the IP itself is never stored.
 * Rows from earlier days are deleted with their salt.
 */
export const viewVisits = sqliteTable('view_visits', {
  hash: text('hash').primaryKey(),
  day: text('day').notNull()
}, table => [index('view_visits_day_idx').on(table.day)])
