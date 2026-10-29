import { createServerFn } from '@tanstack/react-start'
import { getNewsFeedInputSchema } from '@/lib/schema/news'
import { fetchPublicNewsFeed } from '@/server/services/news'

/**
 * Server Function untuk mengambil feed kabar laporan warga.
 * Dipanggil oleh SSR loader dan TanStack Query di sisi peramban.
 */
export const getPublicNewsFeed = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getNewsFeedInputSchema.parse(data))
  .handler(async ({ data }) => {
    return fetchPublicNewsFeed(data)
  })
