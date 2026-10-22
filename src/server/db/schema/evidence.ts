import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { reports } from './reports'

export const reportEvidence = pgTable('report_evidence', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  r2ObjectKey: text('r2_object_key').notNull(),
  mediaUrl: text('media_url').notNull(),
  fileHashSha256: varchar('file_hash_sha256', { length: 64 }).notNull(),
  exifCaptureTime: timestamp('exif_capture_time', { withTimezone: true }),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(), // 'image/jpeg' | 'image/png' | 'image/webp'
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type ReportEvidence = typeof reportEvidence.$inferSelect
export type NewReportEvidence = typeof reportEvidence.$inferInsert
