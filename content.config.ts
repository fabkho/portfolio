import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      source: 'projects/*.yml',
      type: 'data',
      schema: z.object({
        tag: z.string(),
        label: z.string().optional(),
        title: z.string(),
        description: z.string(),
        specs: z.array(z.string()),
        url: z.string().url().optional(),
        featured: z.boolean().optional(),
        order: z.number().optional()
      })
    }),
    contributions: defineCollection({
      source: 'contributions/*.yml',
      type: 'data',
      schema: z.object({
        project: z.string(),
        pr: z.string(),
        url: z.string().url()
      })
    }),
    blog: defineCollection({
      source: 'blog/**/*.md',
      type: 'page',
      schema: z.object({
        tag: z.string(),
        title: z.string(),
        description: z.string(),
        date: z.string(),
        specs: z.array(z.string()).optional(),
        status: z.enum(['draft', 'published']).default('published')
      })
    })
  }
})
