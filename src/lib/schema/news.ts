import { z } from 'zod'
import {
  handlingStatusEnum,
  incidentTypeEnum,
  verificationStatusEnum,
} from './reports'

export const newsCategoryFilterEnum = z.enum([
  'all',
  'karhutla',
  'permukiman',
  'industri',
  'lainnya',
])
export type NewsCategoryFilter = z.infer<typeof newsCategoryFilterEnum>

export const getNewsFeedInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(30).default(10),
  search: z.string().optional(),
  incidentType: newsCategoryFilterEnum.default('all'),
})
export type GetNewsFeedInput = z.input<typeof getNewsFeedInputSchema>
export type GetNewsFeedParsed = z.output<typeof getNewsFeedInputSchema>

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
