import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * One row per counted page. `total` across the site is `SUM(views)`.
 */
export const pageViews = sqliteTable('page_views', {
  path: text('path').primaryKey(),
  views: integer('views').notNull().default(0)
})
