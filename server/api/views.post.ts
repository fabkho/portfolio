import { eq, lt, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { viewPaths } from '#view-paths'

/**
 * Records a view of `path` and returns its count plus the site-wide total.
 *
 * Called from the client after each page navigation (see
 * `app/plugins/page-views.client.ts`), never during SSR or prerender, so
 * prerendered pages still count real visits.
 *
 * Each visitor counts once per page per UTC day, identified by a salted hash
 * of IP + user agent + path. The salt rotates daily and the old one is
 * deleted, along with the old hashes; the IP is never stored. No cookies,
 * nothing stored in the visitor's browser.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ path?: unknown, count?: unknown }>(event).catch(() => null)
  const path = normalizeViewPath(body?.path)

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a page path' })
  }
  if (!viewPaths.has(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not a counted page' })
  }

  setResponseHeader(event, 'cache-control', 'no-store')

  const userAgent = getRequestHeader(event, 'user-agent')
  const countable = body?.count !== false // `false`: the site owner's opt-out
    && shouldCountView({
      userAgent,
      secFetchSite: getRequestHeader(event, 'sec-fetch-site'),
      signatureAgent: getRequestHeader(event, 'signature-agent')
    })

  if (countable && await isFirstVisitToday(event, path, userAgent ?? '')) {
    await db.insert(schema.pageViews)
      .values({ path, views: 1 })
      .onConflictDoUpdate({
        target: schema.pageViews.path,
        set: { views: sql`${schema.pageViews.views} + 1` }
      })
  }

  return readCounts(path)
})

async function isFirstVisitToday(event: Parameters<typeof getRequestIP>[0], path: string, userAgent: string) {
  const day = viewDay()
  const salt = await saltFor(day)
  // Cloudflare overwrites cf-connecting-ip, so clients can't forge it.
  // X-Forwarded-For is deliberately not trusted.
  const ip = getRequestHeader(event, 'cf-connecting-ip') ?? getRequestIP(event) ?? ''
  const hash = await visitorHash({ salt, ip, userAgent, path })

  const inserted = await db.insert(schema.viewVisits)
    .values({ hash, day })
    .onConflictDoNothing()
    .returning({ hash: schema.viewVisits.hash })

  return inserted.length > 0
}

/**
 * Today's salt, created on the first view of the day. Creating it also
 * deletes every earlier salt and visitor hash.
 */
async function saltFor(day: string) {
  const { viewSalts, viewVisits } = schema
  const [existing] = await db.select({ salt: viewSalts.salt }).from(viewSalts).where(eq(viewSalts.day, day))
  if (existing) return existing.salt

  const created = await db.insert(viewSalts)
    .values({ day, salt: createViewSalt() })
    .onConflictDoNothing()
    .returning({ salt: viewSalts.salt })

  if (created.length) {
    await db.delete(viewSalts).where(lt(viewSalts.day, day))
    await db.delete(viewVisits).where(lt(viewVisits.day, day))
    return created[0]!.salt
  }

  // Another request created today's salt in between; use theirs.
  const [winner] = await db.select({ salt: viewSalts.salt }).from(viewSalts).where(eq(viewSalts.day, day))
  return winner!.salt
}

async function readCounts(path: string) {
  const { pageViews } = schema
  const [row] = await db.select({ views: pageViews.views }).from(pageViews).where(eq(pageViews.path, path))
  const [sum] = await db
    .select({ total: sql<number>`coalesce(sum(${pageViews.views}), 0)` })
    .from(pageViews)

  return {
    path,
    views: row?.views ?? 0,
    total: Number(sum?.total ?? 0)
  }
}
