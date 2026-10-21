import { z } from 'zod'

export const getUploadUrlInputSchema = z.object({
  filename: z.string().min(1, 'Nama berkas wajib diisi'),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'Format foto harus berupa JPEG, PNG, atau WebP',
  }),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, 'Ukuran foto maksimal 5 MB setelah kompresi'),
})

export type GetUploadUrlInput = z.infer<typeof getUploadUrlInputSchema>
