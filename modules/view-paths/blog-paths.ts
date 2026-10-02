import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { parse as parseYaml } from 'yaml'

/**
 * Paths of every published article under `blogDir`, as Nuxt Content would
 * route them.
 */
export async function readPublishedBlogPaths(blogDir: string): Promise<string[]> {
  const files = await listMarkdownFiles(blogDir)
  const paths: string[] = []

  for (const file of files) {
    const frontmatter = parseFrontmatter(await readFile(file, 'utf8'))
    // Mirrors the `status` default in content.config.ts.
    if ((frontmatter.status ?? 'published') !== 'published') continue
    paths.push(toContentPath(relative(blogDir, file)))
  }

  return paths.sort()
}

/**
 * `foo.md` → `/blog/foo`, following Nuxt Content's path rules: numeric
 * ordering prefixes (`1.foo.md`) are dropped and `index` maps to its folder.
 */
export function toContentPath(relativeFile: string): string {
  const segments = relativeFile
    .replace(/\.md$/, '')
    .split(/[\\/]/)
    .map(segment => segment.replace(/^\d+\./, ''))

  if (segments.at(-1) === 'index') segments.pop()

  return ['/blog', ...segments].join('/')
}

function parseFrontmatter(source: string): Record<string, unknown> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match?.[1]) return {}
  const parsed = parseYaml(match[1])
  return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listMarkdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  }))
  return nested.flat()
}
