import { z } from 'zod'
import {
  incidentTypeEnum,
  verificationStatusEnum,
  handlingStatusEnum,
} from './reports'

/**
 * Daftar avatar taktis preset yang disediakan oleh SiagaWarga.
 */
export const PRESET_AVATARS = [
  {
    id: 'siaga-warga',
    name: 'Warga Siaga',
    path: '/avatars/preset-siaga.svg',
    description: 'Warga tanggap bencana lingkungan',
  },
  {
    id: 'relawan-hijau',
    name: 'Relawan Hijau',
    path: '/avatars/preset-relawan.svg',
    description: 'Relawan aksi mitigasi karhutla',
  },
  {
    id: 'pengawas-lahan',
    name: 'Pengawas Lahan',
    path: '/avatars/preset-pengawas.svg',
    description: 'Pemerhati kelestarian gambut & hutan',
  },
  {
    id: 'satgas-bencana',
    name: 'Satgas Tanggap',
    path: '/avatars/preset-satgas.svg',
    description: 'Kesiapsiagaan penanganan kedaruratan',
  },
  {
    id: 'penjaga-permukiman',
    name: 'Penjaga Wilayah',
    path: '/avatars/preset-penjaga.svg',
    description: 'Pemantau keamanan permukiman warga',
  },
  {
    id: 'patroli-udara',
    name: 'Pengamat Titik Panas',
    path: '/avatars/preset-patroli.svg',
    description: 'Pemantau citra satelit dan sebaran asap',
  },
] as const

export const updateProfileInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  image: z
    .string()
    .url('Tautan foto profil tidak valid')
    .or(
      z
        .string()
        .regex(
          /^\/avatars\/preset-[a-z-]+\.svg$/,
          'Pilihan avatar tidak valid',
        ),
    )
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>

/**
 * Kontrak data ringkas laporan untuk daftar "Laporan Saya".
 */
export const myReportItemSchema = z.object({
  id: z.string().uuid(),
  trackingCode: z.string(),
  incidentType: incidentTypeEnum,
  description: z.string(),
  submittedAtIso: z.string().datetime(),
  addressDisplay: z.string().nullable(),
  verificationStatus: verificationStatusEnum,
  handlingStatus: handlingStatusEnum,
  isPotentialDuplicate: z.boolean(),
})

export type MyReportItem = z.infer<typeof myReportItemSchema>

export const myProfileAndReportsSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().nullable(),
    role: z.enum(['citizen', 'moderator', 'superadmin']),
    createdAtIso: z.string().datetime(),
  }),
  reports: z.array(myReportItemSchema),
})

export type MyProfileAndReports = z.infer<typeof myProfileAndReportsSchema>
