const MAX_PATH_LENGTH = 200

// Crawlers, link unfurlers, and headless tooling. Most of these never run the
// client-side tracker anyway; this catches the ones that do execute JS.
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|fetch|headless|lighthouse|pagespeed|monitor|curl|wget|python|scrapy/i

/**
 * Normalizes a client-reported path to the form used as the counter key:
 * no query or hash, no trailing slash (except the root). Returns `null` for
 * anything that isn't a plausible same-site path.
 */
export function normalizeViewPath(input: unknown): string | null {
  if (typeof input !== 'string') return null
  if (!input.startsWith('/') || input.startsWith('//')) return null
  if (input.length > MAX_PATH_LENGTH) return null

  const path = input.split(/[?#]/, 1)[0] ?? ''
  if (path === '/') return path
  return path.replace(/\/+$/, '') || '/'
}

/**
 * Whether a request should increment the counter. Bots and cross-site
 * requests still get the current counts back — they just don't add to them.
 */
export function shouldCountView(headers: {
  userAgent?: string | null
  secFetchSite?: string | null
}): boolean {
  if (!headers.userAgent || BOT_PATTERN.test(headers.userAgent)) return false
  // Another site's page POSTing here on its visitors' behalf.
  if (headers.secFetchSite === 'cross-site') return false
  return true
}
