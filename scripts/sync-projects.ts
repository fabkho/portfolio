import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const ROOT = resolve(import.meta.dirname, '..')
const CONFIG_PATH = resolve(ROOT, 'scripts/github-sync.config.yml')
const PROJECTS_DIR = resolve(ROOT, 'content/projects')

interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  topics: string[]
  language: string | null
  stargazers_count: number
  fork: boolean
  archived: boolean
}

interface ProjectOverride {
  order?: number
  featured?: boolean
  tag?: string
  label?: string
  title?: string
  description?: string
  specs?: string[]
  url?: string
  private?: boolean
}

interface Config {
  projects: {
    exclude: string[]
    overrides: Record<string, ProjectOverride>
  }
}

const MAX_RETRIES = 3
const RETRY_BASE_MS = 1000

function isTransient(status: number): boolean {
  return status === 429 || status >= 500
}

async function fetchWithRetry(url: string, headers: Record<string, string>): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok || !isTransient(res.status)) return res
      console.warn(`  ⚠ Transient error ${res.status}, retry ${attempt + 1}/${MAX_RETRIES}...`)
    } catch (err) {
      if (attempt === MAX_RETRIES - 1) throw err
      console.warn(`  ⚠ Network error, retry ${attempt + 1}/${MAX_RETRIES}...`)
    }
    await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** attempt))
  }
  throw new Error(`Failed after ${MAX_RETRIES} retries: ${url}`)
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` })
  }
  let page = 1
  while (true) {
    const res = await fetchWithRetry(
      `https://api.github.com/users/fabkho/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      headers
    )
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${await res.text()}`)
    const data = await res.json() as GitHubRepo[]
    if (data.length === 0) break
    repos.push(...data)
    if (data.length < 100) break
    page++
  }
  return repos
}

function repoToProject(repo: GitHubRepo, override?: ProjectOverride) {
  const tag = override?.tag || (repo.language?.toUpperCase() || 'PROJECT')
  const label = override?.label || repo.name.toUpperCase().replace(/-/g, ' ')
  const description = override?.description || repo.description || `${repo.name} — open source project.`
  const specs = override?.specs || [
    ...(repo.language ? [repo.language.toUpperCase()] : []),
    ...repo.topics.slice(0, 3).map(t => t.toUpperCase())
  ].slice(0, 4)

  return {
    tag,
    label,
    title: override?.title || formatTitle(repo.name),
    description,
    specs,
    url: repo.html_url,
    featured: override?.featured ?? false,
    order: override?.order ?? 99,
    stars: repo.stargazers_count
  }
}

const ACRONYMS = new Set(['cli', 'api', 'ui', 'esm', 'cjs', 'sdk', 'mcp', 'ai'])

function formatTitle(name: string): string {
  return name
    .split(/[-_]/)
    .map(w => ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('🔄 Syncing projects from GitHub...')

  const raw = parseYaml(readFileSync(CONFIG_PATH, 'utf-8'))
  if (!raw?.projects || !Array.isArray(raw.projects.exclude)) {
    throw new Error('Malformed config: missing projects.exclude')
  }
  const config = raw as Config
  const excludeSet = new Set(config.projects.exclude.map(e => e.toLowerCase()))

  const repos = await fetchRepos()
  const filtered = repos.filter(r =>
    !r.fork
    && !r.archived
    && !excludeSet.has(r.full_name.toLowerCase())
  )

  console.log(`  Found ${filtered.length} repos (excluded ${repos.length - filtered.length})`)

  // Stage all outputs in memory first — fail early before any deletes
  const staged: Array<{ slug: string, content: string, order: number }> = []

  for (const repo of filtered) {
    const override = config.projects.overrides[repo.name]
    const project = repoToProject(repo, override)
    const slug = slugify(repo.name)
    staged.push({ slug, content: stringifyYaml(project, { lineWidth: 120 }), order: project.order })
  }

  // Manual/private projects from overrides not in API results
  const syncedNames = new Set(filtered.map(r => r.name))
  for (const [name, override] of Object.entries(config.projects.overrides)) {
    if (syncedNames.has(name)) continue
    if (!override.private) continue
    const slug = slugify(name)
    const project = {
      tag: override.tag || 'PROJECT',
      label: override.label || name.toUpperCase(),
      title: override.title || formatTitle(name),
      description: override.description || `${name} — open source project.`,
      specs: override.specs || [],
      url: override.url || `https://github.com/fabkho/${name}`,
      featured: override.featured ?? false,
      order: override.order ?? 99
    }
    staged.push({ slug, content: stringifyYaml(project, { lineWidth: 120 }), order: project.order })
  }

  // Only delete stale files — keep files that will be rewritten
  const desiredSlugs = new Set(staged.map(s => `${s.slug}.yml`))
  const existingFiles = readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.yml'))
  for (const file of existingFiles) {
    if (!desiredSlugs.has(file)) {
      unlinkSync(resolve(PROJECTS_DIR, file))
      console.log(`  ✗ ${file} (removed)`)
    }
  }

  // Write all staged files
  for (const { slug, content, order } of staged) {
    writeFileSync(resolve(PROJECTS_DIR, `${slug}.yml`), content)
    console.log(`  ✓ ${slug}.yml (order: ${order})`)
  }

  console.log(`\n✅ Synced ${staged.length} projects`)
}

main().catch((err) => {
  console.error('❌ Sync failed:', err)
  process.exit(1)
})
