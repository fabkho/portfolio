import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const ROOT = resolve(import.meta.dirname, '..')
const CONFIG_PATH = resolve(ROOT, 'scripts/github-sync.config.yml')
const CONTRIBUTIONS_DIR = resolve(ROOT, 'content/contributions')

interface Config {
  contributions: {
    track: string[]
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

async function fetchMergedPRs(repos: string[]): Promise<Array<{ project: string, pr: string, url: string, date: string }>> {
  const results: Array<{ project: string, pr: string, url: string, date: string }> = []

  // Search in batches per repo to stay within query limits
  for (const repo of repos) {
    const query = encodeURIComponent(`author:fabkho type:pr is:merged repo:${repo}`)
    const res = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=100&sort=created&order=desc`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` })
        }
      }
    )

    if (!res.ok) {
      console.warn(`  ⚠ Failed to fetch PRs for ${repo}: ${res.status}`)
      continue
    }

    const data = await res.json() as SearchResult
    for (const item of data.items) {
      results.push({
        project: repo,
        pr: item.title,
        url: item.html_url,
        date: item.pull_request?.merged_at || ''
      })
    }

    // Rate limit courtesy
    await new Promise(r => setTimeout(r, 500))
  }

  return results
}

function slugify(url: string): string {
  // e.g. https://github.com/nuxt/nuxt/pull/34318 → nuxt-nuxt-34318
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`
  return url.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

async function main() {
  console.log('🔄 Syncing contributions from GitHub...')

  const config: Config = parseYaml(readFileSync(CONFIG_PATH, 'utf-8'))
  const excludeSet = new Set(config.contributions.exclude_prs)

  const prs = await fetchMergedPRs(config.contributions.track)
  const filtered = prs.filter(pr => !excludeSet.has(pr.url))

  console.log(`  Found ${filtered.length} merged PRs across ${config.contributions.track.length} repos`)

  // Remove old contribution files
  const existingFiles = readdirSync(CONTRIBUTIONS_DIR).filter(f => f.endsWith('.yml'))
  for (const file of existingFiles) {
    unlinkSync(resolve(CONTRIBUTIONS_DIR, file))
  }

  // Write new contribution files
  for (const pr of filtered) {
    const slug = slugify(pr.url)
    const filePath = resolve(CONTRIBUTIONS_DIR, `${slug}.yml`)

    const data = {
      project: pr.project,
      pr: pr.pr,
      url: pr.url
    }

    writeFileSync(filePath, stringifyYaml(data, { lineWidth: 120 }))
    console.log(`  ✓ ${slug}.yml`)
  }

  console.log(`\n✅ Synced ${filtered.length} contributions`)
}

main().catch((err) => {
  console.error('❌ Sync failed:', err)
  process.exit(1)
})
