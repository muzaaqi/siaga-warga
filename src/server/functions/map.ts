import { createServerFn } from '@tanstack/react-start'
import type { PublicMapDataResponse } from '@/lib/schema/map'
import { publicMapQuerySchema } from '@/lib/schema/map'
import { fetchPublicMapData } from '@/server/services/map'

/**
 * Server Function untuk mengambil data sebaran insiden terverifikasi dan titik panas satelit
 * untuk peta publik /pantau.
 * Menegakkan Rule 1 (Zero direct DB on client) dan Rule 7 (Zero PII leakage).
 */
export const getPublicMapData = createServerFn({ method: 'GET' })
  .validator((input: unknown) => publicMapQuerySchema.parse(input))
  .handler(async ({ data }): Promise<PublicMapDataResponse> => {
    return fetchPublicMapData(data)
  })
