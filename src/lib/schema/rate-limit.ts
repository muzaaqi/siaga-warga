import { z } from 'zod'

export const rateLimitActionEnum = z.enum([
  'evidence_upload',
  'report_submission',
])

export type RateLimitAction = z.infer<typeof rateLimitActionEnum>

export const rateLimitResultSchema = z.object({
  allowed: z.boolean(),
  limit: z.number().int().positive(),
  remaining: z.number().int().nonnegative(),
  resetAtEpochMs: z.number().int().positive(),
  retryAfterSeconds: z.number().int().nonnegative(),
})

export type RateLimitResult = z.infer<typeof rateLimitResultSchema>
