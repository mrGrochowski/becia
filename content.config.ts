import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    status: defineCollection({
      type: 'page',
      source: 'status.md',
      schema: z.object({
        isOnline: z.boolean().default(true)
      })
    })
  }
})