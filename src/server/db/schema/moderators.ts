import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { reports } from './reports'

export const reportStatusHistory = pgTable('report_status_history', {
  id: serial('id').primaryKey(),
  reportId: uuid('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  fieldChanged: varchar('field_changed', { length: 50 }).notNull(), // 'verification_status' | 'priority' | 'handling_status'
  oldValue: varchar('old_value', { length: 50 }),
  newValue: varchar('new_value', { length: 50 }).notNull(),
  actor: varchar('actor', { length: 100 }).notNull(), // moderator identifier or system
  reasonNote: text('reason_note').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type ReportStatusHistory = typeof reportStatusHistory.$inferSelect
export type NewReportStatusHistory = typeof reportStatusHistory.$inferInsert
