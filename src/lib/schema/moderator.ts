import { z } from 'zod'

export const moderatorLoginInputSchema = z.object({
  passcode: z.string().min(1, 'Passcode verifikator wajib diisi'),
})

export const updateReportStatusInputSchema = z.object({
  reportId: z.string().uuid('ID laporan tidak valid'),
  statusType: z.enum(['verification', 'handling', 'priority'], {
    message:
      'Tipe status harus salah satu dari: verification, handling, atau priority',
  }),
  newValue: z.string().min(1, 'Nilai status baru wajib diisi'),
  reasonNote: z
    .string()
    .min(5, 'Alasan perubahan status minimal 5 karakter wajib disertakan'),
})

export type ModeratorLoginInput = z.infer<typeof moderatorLoginInputSchema>
export type UpdateReportStatusInput = z.infer<
  typeof updateReportStatusInputSchema
>
