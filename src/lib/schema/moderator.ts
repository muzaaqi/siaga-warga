import { z } from 'zod'
import {
  handlingStatusEnum,
  priorityEnum,
  verificationStatusEnum,
} from './reports'

export const moderatorLoginInputSchema = z.object({
  passcode: z.string().min(1, 'Passcode wajib diisi'),
})

export const updateReportStatusInputSchema = z.object({
  reportId: z.string().uuid('ID laporan tidak valid'),
  verificationStatus: verificationStatusEnum.optional(),
  priority: priorityEnum.optional(),
  handlingStatus: handlingStatusEnum.optional(),
  reasonNote: z
    .string()
    .min(5, 'Alasan perubahan status minimal 5 karakter wajib disertakan'),
})

export type ModeratorLoginInput = z.infer<typeof moderatorLoginInputSchema>
export type UpdateReportStatusInput = z.infer<
  typeof updateReportStatusInputSchema
>
