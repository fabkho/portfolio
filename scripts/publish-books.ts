/**
 * Publishes the /books data to the R2 bucket behind https://books.fabkho.dev:
 * runs books:sync (Regal's built asset set → public/books-data/, private fields
 * stripped) and uploads every file with wrangler. The site reads it from there,
 * so updating the books needs no commit or deploy.
 *
 * Usage: pnpm books:publish            (needs `wrangler login` once)
 *        BOOKS_BUCKET=other pnpm books:publish
 */
import { execFile } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const BUCKET = process.env.BOOKS_BUCKET || 'portfolio-books'
const DATA = resolve(import.meta.dirname, '../public/books-data')
const PARALLEL = 8

/** JSON changes with every build; images rarely (same file names, so not immutable). */
const CACHE: Record<string, string> = {
  '.json': 'public, max-age=60',
  '.webp': 'public, max-age=86400'
}
const TYPES: Record<string, string> = {
  '.json': 'application/json',
  '.webp': 'image/webp'
}

async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(join(dir, entry.name))
    : Promise.resolve([join(dir, entry.name)])))
  return nested.flat()
}

async function upload(file: string) {
  const key = relative(DATA, file)
  const ext = key.slice(key.lastIndexOf('.'))
  if (!TYPES[ext]) return
  await run('pnpm', [
    'exec', 'wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`,
    '--file', file, '--remote',
    '--content-type', TYPES[ext]!,
    '--cache-control', CACHE[ext]!
  ])
}

async function main() {
  await run('pnpm', ['books:sync'], { cwd: resolve(import.meta.dirname, '..') })
  const all = await files(DATA)
  // Images first, the JSON last: a visitor never gets a manifest naming
  // images that aren't uploaded yet.
  const json = all.filter(file => file.endsWith('.json'))
  const images = all.filter(file => !file.endsWith('.json'))
  for (let index = 0; index < images.length; index += PARALLEL) {
    await Promise.all(images.slice(index, index + PARALLEL).map(upload))
    process.stdout.write(`\r${Math.min(index + PARALLEL, images.length)}/${images.length} images`)
  }
  for (const file of json) await upload(file)
  console.log(`\nPublished ${images.length} images + ${json.length} JSON files to r2://${BUCKET}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
