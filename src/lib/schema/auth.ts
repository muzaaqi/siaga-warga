import { z } from 'zod'

export const userRoleEnum = z.enum(['citizen', 'moderator', 'superadmin'])
export type UserRole = z.infer<typeof userRoleEnum>

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().url().nullable().optional(),
  role: userRoleEnum.default('citizen'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type AuthUser = z.infer<typeof authUserSchema>

export const authSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  token: z.string().min(1),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
})
export type AuthSession = z.infer<typeof authSessionSchema>

export const sessionResponseSchema = z
  .object({
    user: authUserSchema,
    session: authSessionSchema,
  })
  .nullable()
export type SessionResponse = z.infer<typeof sessionResponseSchema>
