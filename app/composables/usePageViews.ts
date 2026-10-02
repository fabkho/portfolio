export interface PageViewsResponse {
  path: string
  views: number
  total: number
}

export interface PageViewsState {
  /** Site-wide views, or `null` until the first count comes back. */
  total: number | null
  /** Per-page views, keyed by normalized path (`/blog/foo`). */
  byPath: Record<string, number>
}

/**
 * View counts filled in on the client by `plugins/page-views.client.ts`.
 * Always empty during SSR/prerender — counts are never baked into HTML.
 */
export function usePageViews() {
  return useState<PageViewsState>('page-views', () => ({ total: null, byPath: {} }))
}

export function formatViewCount(count: number) {
  return count.toLocaleString('en-US')
}
