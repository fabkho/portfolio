import { queryCollection } from '@nuxt/content/server'
import type { BlogCollectionItem } from '@nuxt/content'

export default defineEventHandler(async (event) => {
  const siteUrl = 'https://fabkho.dev'
  const siteName = 'Fabian Kirchhoff'

  const posts = await queryCollection(event, 'blog')
    .where('status', '=', 'published')
    .all() as BlogCollectionItem[]

  const sorted = posts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const items = sorted.map((post) => {
    const link = `${siteUrl}${post.path}`
    const pubDate = new Date(post.date).toUTCString()

    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author}</author>
    </item>`
  }).join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>Blog posts by ${siteName} about Vue, Nuxt, TypeScript, and developer tools.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return feed
})
