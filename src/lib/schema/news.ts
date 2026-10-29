import { z } from 'zod'
import {
  handlingStatusEnum,
  incidentTypeEnum,
  verificationStatusEnum,
} from './reports'

export const newsFilterEnum = z.enum([
  'all',
  'verified',
  'in_progress',
  'resolved',
])
export type NewsFilter = z.infer<typeof newsFilterEnum>

export const getNewsFeedInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(30).default(10),
  filter: newsFilterEnum.default('all'),
})
export type GetNewsFeedInput = z.infer<typeof getNewsFeedInputSchema>

export const newsFeedItemSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  description: z.string(),
  submittedAtIso: z.string(),
  addressDisplay: z.string().nullable(),
  verificationStatus: verificationStatusEnum,
  handlingStatus: handlingStatusEnum,
  latitude: z.number(),
  longitude: z.number(),
  primaryImageUrl: z.string().nullable(),
  reporter: z.object({
    id: z.string().nullable(),
    name: z.string(),
    image: z.string().nullable(),
    role: z.string(),
  }),
})
export type NewsFeedItem = z.infer<typeof newsFeedItemSchema>

export const newsFeedResponseSchema = z.object({
  items: z.array(newsFeedItemSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})
export type NewsFeedResponse = z.infer<typeof newsFeedResponseSchema>
