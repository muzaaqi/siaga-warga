import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  triageQueueQuerySchema,
  updateReportStatusInputSchema,
} from '@/lib/schema/moderator'
import { requireModeratorSession } from './auth'
import {
  fetchTriageQueue,
  fetchModeratorReportDetail,
  executeReportStatusChange,
} from '@/server/services/moderator'

/**
 * Server Function GET untuk mengambil daftar antrean triase dan statistik bagi moderator.
 */
export const getTriageQueue = createServerFn({ method: 'GET' })
  .validator((input: unknown) => triageQueueQuerySchema.parse(input))
  .handler(async ({ data }) => {
    await requireModeratorSession()
    return fetchTriageQueue(data)
  })

/**
 * Server Function GET untuk mengambil detail lengkap laporan insiden bagi verifikator.
 */
export const getModeratorReportDetail = createServerFn({ method: 'GET' })
  .validator((input: unknown) =>
    z.object({ reportId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireModeratorSession()
    return fetchModeratorReportDetail(data.reportId)
  })

/**
 * Server Function POST untuk memperbarui status verifikasi/penanganan/prioritas laporan.
 */
export const updateReportStatus = createServerFn({ method: 'POST' })
  .validator((input: unknown) => updateReportStatusInputSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await requireModeratorSession()
    const actorName =
      session.user.name || session.user.email || 'Moderator Resmi'
    return executeReportStatusChange(actorName, data)
  })
