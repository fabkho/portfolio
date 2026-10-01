/**
 * Copies Regal's built Book asset set into public/books-data/ for /books.
 *
 * Source: $REGAL_ASSETS, else ~/code/regal/public/book-assets (written by
 * Regal's `pnpm assets:build`). Copies library.json, manifest.json and each
 * Book's front/spine/back webp; skips jackets and build reports.
 *
 * Usage: pnpm books:sync
 */
import { copyFile, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const SOURCE = resolve(process.env.REGAL_ASSETS || join(homedir(), 'code/regal/public/book-assets'))
const TARGET = resolve(import.meta.dirname, '../public/books-data')

const ROOT_FILES = ['library.json', 'manifest.json']
const BOOK_FILES = ['front.webp', 'spine.webp', 'back.webp']

async function exists(path: string) {
  return stat(path).then(() => true, () => false)
}

async function main() {
  for (const file of ROOT_FILES) {
    if (!(await exists(join(SOURCE, file)))) {
      throw new Error(`Missing ${file} in ${SOURCE} (set REGAL_ASSETS or run Regal's \`pnpm assets:build\`)`)
    }
  }

  await rm(TARGET, { recursive: true, force: true })
  await mkdir(TARGET, { recursive: true })

  for (const file of ROOT_FILES) {
    await copyFile(join(SOURCE, file), join(TARGET, file))
  }

  const manifest = JSON.parse(await readFile(join(SOURCE, 'manifest.json'), 'utf8')) as Record<string, unknown>
  const entries = await readdir(SOURCE, { withFileTypes: true })
  let books = 0
  let images = 0

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const copied = []
    for (const file of BOOK_FILES) {
      const from = join(SOURCE, entry.name, file)
      if (!(await exists(from))) continue
      await mkdir(join(TARGET, entry.name), { recursive: true })
      await copyFile(from, join(TARGET, entry.name, file))
      copied.push(file)
    }
    if (copied.length) {
      books++
      images += copied.length
    }
  }

  const library = JSON.parse(await readFile(join(SOURCE, 'library.json'), 'utf8')) as { books?: unknown[] }
  console.log(`Synced ${library.books?.length ?? 0} library books, ${Object.keys(manifest).length} manifest entries, ${images} images (${books} asset folders)`)
  console.log(`${SOURCE} -> ${TARGET}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
