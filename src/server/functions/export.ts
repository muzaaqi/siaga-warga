import { createServerFn } from '@tanstack/react-start'
import type { ExportDataResponse } from '@/lib/schema/export'
import { exportReportsQuerySchema } from '@/lib/schema/export'
import { requireModeratorSession } from '@/server/functions/auth'
import { fetchExportData } from '@/server/services/export'

/**
 * Server Function: Mengekspor rekapitulasi data insiden kebakaran dalam format CSV atau GeoJSON.
 * Diamankan oleh guard sesi moderator (khusus verifikator dan administrator).
 */
export const exportIncidentData = createServerFn({ method: 'POST' })
  .validator((data: unknown) => exportReportsQuerySchema.parse(data))
  .handler(async ({ data }): Promise<ExportDataResponse> => {
    await requireModeratorSession()
    return fetchExportData(data)
  })
