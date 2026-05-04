const subtitleMap: Record<string, string> = {
  '/': 'Architectural Schematics // Full-Stack Development',
  '/projects': 'Index of Constructed Mechanisms',
  '/blog': 'Technical Memos & Transmission Logs',
  '/books': 'Data Extract // Literary Archive'
}

export const useRouteSubtitle = () => {
  const route = useRoute()
  return computed(() => subtitleMap[route.path] ?? subtitleMap['/'])
}
