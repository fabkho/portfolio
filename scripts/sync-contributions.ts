import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const ROOT = resolve(import.meta.dirname, '..')
const CONFIG_PATH = resolve(ROOT, 'scripts/github-sync.config.yml')
const CONTRIBUTIONS_DIR = resolve(ROOT, 'content/contributions')

interface Config {
  contributions: {
    track_orgs: string[]
    track_repos: string[]
    exclude_prs: string[]
  }
}

interface SearchResult {
  items: Array<{
    title: string
    html_url: string
    repository_url: string
    pull_request?: { merged_at: string | null }
  }>
  total_count: number
}

type PR = { project: string, pr: string, url: string, date: string }

async function searchPRs(queryFragment: string, headers: Record<string, string>): Promise<PR[]> {
  const results: PR[] = []
  const query = encodeURIComponent(`author:fabkho type:pr is:merged ${queryFragment}`)
  let page = 1
  let fetched = 0

  while (true) {
    const res = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=100&page=${page}&sort=created&order=desc`,
      { headers }
    )

    if (!res.ok) {
      throw new Error(`GitHub search failed for "${queryFragment}": HTTP ${res.status}`)
    }

    const data = await res.json() as SearchResult
    for (const item of data.items) {
      const repoPath = item.repository_url.split('/').slice(-2).join('/')
      results.push({
        project: repoPath,
        pr: item.title,
        url: item.html_url,
        date: item.pull_request?.merged_at || ''
      })
    }

    fetched += data.items.length
    if (fetched >= data.total_count || data.items.length < 100 || fetched >= 1000) break
    page++
    await new Promise(r => setTimeout(r, 500))
  }

  return results
}

async function fetchAllPRs(config: Config): Promise<PR[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` })
  }

  const all: PR[] = []
  const failures: string[] = []

  // Search by org (covers ALL repos in org with one query)
  for (const org of config.contributions.track_orgs) {
    try {
      const prs = await searchPRs(`org:${org}`, headers)
      console.log(`  ${org}/ — ${prs.length} merged PRs`)
      all.push(...prs)
    } catch (err) {
      failures.push(`org:${org} (${(err as Error).message})`)
    }
    await new Promise(r => setTimeout(r, 500))
  }

  // Search individual repos
  for (const repo of config.contributions.track_repos) {
    try {
      const prs = await searchPRs(`repo:${repo}`, headers)
      console.log(`  ${repo} — ${prs.length} merged PRs`)
      all.push(...prs)
    } catch (err) {
      failures.push(`repo:${repo} (${(err as Error).message})`)
    }
    await new Promise(r => setTimeout(r, 500))
  }

  if (failures.length > 0) {
    throw new Error(`Failed to fetch: ${failures.join(', ')}. Aborting to preserve existing data.`)
  }

  // Deduplicate by URL (in case a repo appears in both org and individual tracking)
  const seen = new Set<string>()
  return all.filter((pr) => {
    if (seen.has(pr.url)) return false
    seen.add(pr.url)
    return true
  })
}

function slugify(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`
  return url.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

async function main() {
  console.log('🔄 Syncing contributions from GitHub...')

  const config: Config = parseYaml(readFileSync(CONFIG_PATH, 'utf-8'))
  const excludeSet = new Set(config.contributions.exclude_prs)

  const prs = await fetchAllPRs(config)
  const filtered = prs.filter(pr => !excludeSet.has(pr.url))

  console.log(`  Total: ${filtered.length} merged PRs`)

  // Stage all outputs first
  const staged: Array<{ slug: string, content: string }> = []
  for (const pr of filtered) {
    const slug = slugify(pr.url)
    const data = {
      project: pr.project,
      pr: pr.pr,
      url: pr.url
    }
    staged.push({ slug, content: stringifyYaml(data, { lineWidth: 120 }) })
  }

  // Only delete stale files
  const desiredSlugs = new Set(staged.map(s => `${s.slug}.yml`))
  const existingFiles = readdirSync(CONTRIBUTIONS_DIR).filter(f => f.endsWith('.yml'))
  for (const file of existingFiles) {
    if (!desiredSlugs.has(file)) {
      unlinkSync(resolve(CONTRIBUTIONS_DIR, file))
      console.log(`  ✗ ${file} (removed)`)
    }
  }

  // Write all staged files
  for (const { slug, content } of staged) {
    writeFileSync(resolve(CONTRIBUTIONS_DIR, `${slug}.yml`), content)
    console.log(`  ✓ ${slug}.yml`)
  }

  console.log(`\n✅ Synced ${staged.length} contributions`)
}

main().catch((err) => {
  console.error('❌ Sync failed:', err)
  process.exit(1)
})
