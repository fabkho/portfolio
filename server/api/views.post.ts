import { eq, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { viewPaths } from '#view-paths'

/**
 * Counts one view of `path` and returns its count plus the site-wide total.
 *
 * Called from the client after each page navigation (see
 * `app/plugins/page-views.client.ts`), never during SSR or prerender, so
 * prerendered pages still count real visits. No cookies, no IPs, no
 * per-visitor state: a reload is a new view.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ path?: unknown }>(event).catch(() => null)
  const path = normalizeViewPath(body?.path)

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a page path' })
  }
  if (!viewPaths.has(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not a counted page' })
  }

  setResponseHeader(event, 'cache-control', 'no-store')

  const { pageViews } = schema
  const counted = shouldCountView({
    userAgent: getRequestHeader(event, 'user-agent'),
    secFetchSite: getRequestHeader(event, 'sec-fetch-site'),
    signatureAgent: getRequestHeader(event, 'signature-agent')
  })

  const [row] = counted
    ? await db.insert(pageViews)
        .values({ path, views: 1 })
        .onConflictDoUpdate({
          target: pageViews.path,
          set: { views: sql`${pageViews.views} + 1` }
        })
        .returning({ views: pageViews.views })
    : await db.select({ views: pageViews.views })
        .from(pageViews)
        .where(eq(pageViews.path, path))

  const [sum] = await db
    .select({ total: sql<number>`coalesce(sum(${pageViews.views}), 0)` })
    .from(pageViews)

  return {
    path,
    views: row?.views ?? 0,
    total: Number(sum?.total ?? 0)
  }
})
