import { z } from 'zod'

/**
 * Skema validasi environment variable server (Rule 18).
 * Mencegah kebocoran rahasia ke browser dan memastikan variabel kritis terisi saat runtime.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).default('siagawarga-evidence'),
  R2_PUBLIC_URL: z.string().url().optional(),
  NASA_FIRMS_MAP_KEY: z.string().min(1).optional(),
  ADMIN_PASSCODE: z.string().min(6).optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16)
    .default('siagawarga-super-secret-dev-key-must-be-32-chars'),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

/**
 * Helper untuk memvalidasi dan mengambil env server secara aman.
 */
export function getServerEnv(
  envObj: Record<string, unknown> = process.env,
): ServerEnv {
  const result = serverEnvSchema.safeParse(envObj)
  if (!result.success) {
    console.error(
      'Konfigurasi environment server tidak valid:',
      result.error.format(),
    )
    throw new Error(
      'Environment variable server tidak valid atau tidak lengkap.',
    )
  }
  return result.data
}
