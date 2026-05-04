export interface Project {
  tag: string
  title: string
  description: string
  specs: string[]
  url?: string
  featured?: boolean
  order?: number
}

export interface Book {
  id: string
  title: string
  author: string
  status: 'reading' | 'done' | 'dnf' | 'want-to-read'
  rating: number | null
  series?: string
  cover?: string
  started?: string
  finished?: string
  pageCount?: number
  currentPage?: number
}

export interface BookStats {
  total: number
  reading: number
  done: number
  dnf: number
  currentlyReading: Book[]
  topAuthors: { name: string; count: number }[]
}

export interface TocItem {
  id: string
  text: string
  depth: number
}
