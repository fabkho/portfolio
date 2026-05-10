export interface NavItem {
  to: string
  label: string
  subtitle: string
}

export const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    subtitle: 'Full-Stack Developer // Vue · Nuxt · TypeScript'
  },
  {
    to: '/projects',
    label: 'Projects',
    subtitle: 'Projects & Open Source'
  },
  {
    to: '/blog',
    label: 'Blog',
    subtitle: 'Technical Memos & Articles'
  }
] as const satisfies readonly NavItem[]

const fallbackSubtitle = NAV_ITEMS[0].subtitle

export function getRouteSubtitle(path: string) {
  const normalizedPath = normalizePath(path)
  const exactMatch = NAV_ITEMS.find(item => item.to === normalizedPath)

  if (exactMatch) return exactMatch.subtitle
  if (normalizedPath.startsWith('/blog/')) return 'Technical Memo'

  return fallbackSubtitle
}

export function isRouteActive(currentPath: string, itemPath: string) {
  const normalizedCurrent = normalizePath(currentPath)
  const normalizedItem = normalizePath(itemPath)

  if (normalizedItem === '/') return normalizedCurrent === '/'

  return normalizedCurrent === normalizedItem || normalizedCurrent.startsWith(`${normalizedItem}/`)
}

function normalizePath(path: string) {
  if (path === '/') return path
  return path.replace(/\/$/, '')
}
