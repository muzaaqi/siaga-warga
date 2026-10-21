import { z } from 'zod'

export const fireTypeEnum = z.enum([
  'karhutla',
  'residential',
  'waste',
  'industrial',
])

export const verificationStatusEnum = z.enum([
  'unverified',
  'needs_review',
  'verified',
  'rejected',
])

export const priorityEnum = z.enum(['low', 'medium', 'high', 'critical'])

export const handlingStatusEnum = z.enum([
  'reported',
  'assigned',
  'in_progress',
  'resolved',
  'monitoring',
])

export const createReportInputSchema = z.object({
  fireType: fireTypeEnum,
  description: z
    .string()
    .min(10, 'Deskripsi kejadian minimal 10 karakter')
    .max(1000, 'Deskripsi kejadian maksimal 1000 karakter'),
  landmarkNotes: z.string().max(255).optional(),
  reporterName: z.string().max(100).optional(),
  reporterPhone: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  latitude: z
    .number()
    .min(-11, 'Koordinat lintang di luar wilayah Indonesia')
    .max(6, 'Koordinat lintang di luar wilayah Indonesia'),
  longitude: z
    .number()
    .min(95, 'Koordinat bujur di luar wilayah Indonesia')
    .max(141, 'Koordinat bujur di luar wilayah Indonesia'),
  storageKey: z.string().min(1, 'Foto bukti wajib diunggah'),
  photoHash: z.string().length(64).optional(),
  exifTimestamp: z.string().optional(),
})

export type CreateReportInput = z.infer<typeof createReportInputSchema>
export type FireType = z.infer<typeof fireTypeEnum>
export type VerificationStatus = z.infer<typeof verificationStatusEnum>
export type Priority = z.infer<typeof priorityEnum>
export type HandlingStatus = z.infer<typeof handlingStatusEnum>
