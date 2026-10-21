import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { reports } from './reports'

export const evidence = pgTable('evidence', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  mediaType: varchar('media_type', { length: 20 }).notNull().default('photo'), // 'photo' | 'video'
  storageKey: text('storage_key').notNull(),
  sha256Hash: varchar('sha256_hash', { length: 64 }),
  exifTimestamp: timestamp('exif_timestamp', { withTimezone: true }),
  exifLat: doublePrecision('exif_lat'),
  exifLng: doublePrecision('exif_lng'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type Evidence = typeof evidence.$inferSelect
export type NewEvidence = typeof evidence.$inferInsert
