import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  trackingCode: varchar('tracking_code', { length: 10 }).notNull().unique(),
  fireType: varchar('fire_type', { length: 30 }).notNull(), // 'karhutla' | 'residential' | 'waste' | 'industrial'
  description: text('description').notNull(),
  landmarkNotes: text('landmark_notes'),
  reporterName: varchar('reporter_name', { length: 100 }),
  reporterPhone: varchar('reporter_phone', { length: 20 }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  clusterId: uuid('cluster_id'),
  verificationStatus: varchar('verification_status', { length: 30 })
    .notNull()
    .default('unverified'), // 'unverified' | 'needs_review' | 'verified' | 'rejected'
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // 'low' | 'medium' | 'high' | 'critical'
  handlingStatus: varchar('handling_status', { length: 30 })
    .notNull()
    .default('reported'), // 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'monitoring'
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
