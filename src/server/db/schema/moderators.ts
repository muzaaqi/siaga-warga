import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { reports } from './reports'

export const reportStatusHistory = pgTable('report_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  statusType: varchar('status_type', { length: 30 }).notNull(), // 'verification' | 'handling' | 'priority'
  previousValue: varchar('previous_value', { length: 50 }),
  newValue: varchar('new_value', { length: 50 }).notNull(),
  changedBy: varchar('changed_by', { length: 100 }).notNull(), // ID / Nama Moderator
  reasonNote: text('reason_note').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type ReportStatusHistory = typeof reportStatusHistory.$inferSelect
export type NewReportStatusHistory = typeof reportStatusHistory.$inferInsert
