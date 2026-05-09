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
  description?: string
  specs?: string[]
}

interface Config {
  projects: {
    exclude: string[]
    overrides: Record<string, ProjectOverride>
  }
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  let page = 1
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/fabkho/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` })
        }
      }
    )
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${await res.text()}`)
    const data = await res.json() as GitHubRepo[]
    if (data.length === 0) break
    repos.push(...data)
    page++
  }
  return repos
}

function repoToProject(repo: GitHubRepo, override?: ProjectOverride) {
  const tag = override?.tag || (repo.language?.toUpperCase() || 'PROJECT')
  const label = override?.label || repo.name.toUpperCase().replace(/-/g, '-')
  const description = override?.description || repo.description || `${repo.name} — open source project.`
  const specs = override?.specs || [
    ...(repo.language ? [repo.language.toUpperCase()] : []),
    ...repo.topics.slice(0, 3).map(t => t.toUpperCase())
  ].slice(0, 4)

  return {
    tag,
    label,
    title: override?.label
      ? formatTitle(repo.name)
      : formatTitle(repo.name),
    description,
    specs,
    url: repo.html_url,
    featured: override?.featured ?? false,
    order: override?.order ?? 99
  }
}

function formatTitle(name: string): string {
  return name
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('🔄 Syncing projects from GitHub...')

  const config: Config = parseYaml(readFileSync(CONFIG_PATH, 'utf-8'))
  const excludeSet = new Set(config.projects.exclude.map(e => e.toLowerCase()))

  const repos = await fetchRepos()
  const filtered = repos.filter(r =>
    !r.fork
    && !r.archived
    && !excludeSet.has(r.full_name.toLowerCase())
  )

  console.log(`  Found ${filtered.length} repos (excluded ${repos.length - filtered.length})`)

  // Remove old auto-generated project files
  const existingFiles = readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.yml'))
  for (const file of existingFiles) {
    unlinkSync(resolve(PROJECTS_DIR, file))
  }

  // Write new project files
  for (const repo of filtered) {
    const override = config.projects.overrides[repo.name]
    const project = repoToProject(repo, override)
    const slug = slugify(repo.name)
    const filePath = resolve(PROJECTS_DIR, `${slug}.yml`)

    writeFileSync(filePath, stringifyYaml(project, { lineWidth: 120 }))
    console.log(`  ✓ ${slug}.yml (order: ${project.order})`)
  }

  // Write manual/private projects from overrides that weren't in API results
  const syncedNames = new Set(filtered.map(r => r.name))
  for (const [name, override] of Object.entries(config.projects.overrides)) {
    if (syncedNames.has(name)) continue
    if (!(override as Record<string, unknown>).private) continue
    const slug = slugify(name)
    const project = {
      tag: override.tag || 'PROJECT',
      label: override.label || name.toUpperCase(),
      title: (override as Record<string, unknown>).title as string || formatTitle(name),
      description: override.description || `${name} — open source project.`,
      specs: override.specs || [],
      url: (override as Record<string, unknown>).url as string || `https://github.com/fabkho/${name}`,
      featured: override.featured ?? false,
      order: override.order ?? 99
    }
    const filePath = resolve(PROJECTS_DIR, `${slug}.yml`)
    writeFileSync(filePath, stringifyYaml(project, { lineWidth: 120 }))
    console.log(`  ✓ ${slug}.yml (manual, order: ${project.order})`)
  }

  console.log(`\n✅ Synced ${filtered.length} projects + manual entries`)
}

main().catch((err) => {
  console.error('❌ Sync failed:', err)
  process.exit(1)
})
