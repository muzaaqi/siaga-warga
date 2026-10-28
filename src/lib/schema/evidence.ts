import { z } from 'zod'

export const getUploadUrlInputSchema = z.object({
  filename: z.string().min(1, 'Nama berkas wajib diisi'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'Format foto harus berupa JPEG, PNG, atau WebP',
  }),
  checksum: z
    .string()
    .length(64, 'SHA-256 checksum foto tidak valid')
    .optional(),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, 'Ukuran foto maksimal 5 MB setelah kompresi'),
})

export const getUploadUrlOutputSchema = z.object({
  uploadUrl: z.string().url(),
  r2ObjectKey: z.string(),
  publicUrl: z.string().url().optional(),
})

export type GetUploadUrlInput = z.infer<typeof getUploadUrlInputSchema>
export type GetUploadUrlOutput = z.infer<typeof getUploadUrlOutputSchema>
