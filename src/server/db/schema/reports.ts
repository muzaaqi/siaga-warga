import {
  boolean,
  doublePrecision,
  geometry,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const incidentTypeEnum = pgEnum('incident_type_enum', [
  'karhutla',
  'permukiman',
  'industri',
  'lainnya',
])

export const verificationStatusEnum = pgEnum('verification_status_enum', [
  'pending',
  'needs_review',
  'verified',
  'insufficient_evidence',
  'rejected',
])

export const priorityEnum = pgEnum('priority_enum', ['high', 'normal', 'low'])

export const handlingStatusEnum = pgEnum('handling_status_enum', [
  'not_forwarded',
  'forwarded',
  'acknowledged',
  'in_progress',
  'resolved',
  'unknown',
])

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    trackingCode: varchar('tracking_code', { length: 12 }).notNull().unique(), // Contoh: SW-2026-X89B
    incidentType: incidentTypeEnum('incident_type').notNull(),
    description: text('description').notNull(),
    observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Geospasial
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    locationGeom: geometry('location_geom', { type: 'point', srid: 4326 }),
    addressDisplay: text('address_display'),

    // Status multi-tier (System Honesty)
    verificationStatus: verificationStatusEnum('verification_status')
      .notNull()
      .default('pending'),
    priority: priorityEnum('priority').notNull().default('normal'),
    handlingStatus: handlingStatusEnum('handling_status')
      .notNull()
      .default('not_forwarded'),

    // Klastering & Korelasi
    clusterId: uuid('cluster_id'),
    isPotentialDuplicate: boolean('is_potential_duplicate')
      .default(false)
      .notNull(),
    satelliteHotspotMatched: boolean('satellite_hotspot_matched')
      .default(false)
      .notNull(),

    // Privasi & Anonimitas
    reporterName: varchar('reporter_name', { length: 100 }),
    reporterPhone: varchar('reporter_phone', { length: 20 }),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_reports_geom').using('gist', table.locationGeom),
    index('idx_reports_verification').on(
      table.verificationStatus,
      table.priority,
    ),
    index('idx_reports_tracking').on(table.trackingCode),
  ],
)

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
export type IncidentType = (typeof incidentTypeEnum.enumValues)[number]
export type VerificationStatus =
  (typeof verificationStatusEnum.enumValues)[number]
export type Priority = (typeof priorityEnum.enumValues)[number]
export type HandlingStatus = (typeof handlingStatusEnum.enumValues)[number]
