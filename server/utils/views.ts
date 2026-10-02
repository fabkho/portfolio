const MAX_PATH_LENGTH = 200

// Most crawlers never run the client-side tracker at all — AI crawlers fetch
// raw HTML without executing JavaScript. This catches the ones that do, plus
// anything POSTing to the endpoint directly.
const BOT_TOKENS = [
  // Crawlers, link unfurlers, headless browsers, and CLI/scripting clients.
  'bot', 'crawl', 'spider', 'slurp', 'preview', 'fetch', 'headless', 'lighthouse',
  'pagespeed', 'monitor', 'curl', 'wget', 'python', 'scrapy',
  // AI assistants and agents whose user agent doesn't say "bot":
  // ChatGPT-User, Claude-User, Perplexity-User, meta-externalagent,
  // Google-Agent, NovaAct, Gemini-Deep-Research, …
  '-user\\b', 'agent', 'anthropic', 'claude', 'openai', 'chatgpt', 'perplexity',
  'mistral', 'cohere', 'gemini', 'notebooklm', 'lightpanda', 'novaact', 'operator',
  'webindexer', 'kendra', 'qbusiness', 'deep-research'
]

const BOT_PATTERN = new RegExp(BOT_TOKENS.join('|'), 'i')

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
 * Whether a request should increment the counter. Bots, AI agents, and
 * cross-site requests still get the current counts back — they just don't
 * add to them.
 */
export function shouldCountView(headers: {
  userAgent?: string | null
  secFetchSite?: string | null
  signatureAgent?: string | null
}): boolean {
  if (!headers.userAgent || BOT_PATTERN.test(headers.userAgent)) return false
  // Browser-driving agents (ChatGPT Agent, …) send a real Chrome user agent but
  // sign their requests with Web Bot Auth (RFC 9421), announcing themselves in
  // `Signature-Agent`. Not verified: faking it only gets the sender uncounted.
  if (headers.signatureAgent) return false
  // Another site's page POSTing here on its visitors' behalf.
  if (headers.secFetchSite === 'cross-site') return false
  return true
}
