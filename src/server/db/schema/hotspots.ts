import {
  doublePrecision,
  geometry,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const satelliteHotspots = pgTable(
  'satellite_hotspots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    source: varchar('source', { length: 20 }).notNull(), // 'VIIRS_SNPP', 'MODIS'
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    geom: geometry('geom', { type: 'point', srid: 4326 }),
    brightness: doublePrecision('brightness'),
    confidence: varchar('confidence', { length: 20 }),
    acquiredAt: timestamp('acquired_at', { withTimezone: true }).notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_hotspots_geom').using('gist', table.geom)],
)

export type SatelliteHotspot = typeof satelliteHotspots.$inferSelect
export type NewSatelliteHotspot = typeof satelliteHotspots.$inferInsert
