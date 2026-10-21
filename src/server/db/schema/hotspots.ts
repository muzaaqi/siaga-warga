import {
  doublePrecision,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const hotspots = pgTable('satellite_hotspots', {
  id: serial('id').primaryKey(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  brightness: doublePrecision('brightness'),
  confidence: varchar('confidence', { length: 20 }),
  satellite: varchar('satellite', { length: 20 }).notNull(), // 'VIIRS' | 'MODIS'
  acqDate: varchar('acq_date', { length: 20 }).notNull(),
  acqTime: varchar('acq_time', { length: 10 }).notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type Hotspot = typeof hotspots.$inferSelect
export type NewHotspot = typeof hotspots.$inferInsert
