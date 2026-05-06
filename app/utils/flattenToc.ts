export interface TocTreeItem {
  id: string
  text: string
  children?: TocTreeItem[]
}

export interface TocLink {
  id: string
  text: string
  depth: number
}

export function flattenToc(links: readonly TocTreeItem[], depth = 2): TocLink[] {
  return links.flatMap((link) => {
    const item = { id: link.id, text: link.text, depth }
    const children = link.children ? flattenToc(link.children, depth + 1) : []

    return [item, ...children]
  })
}
