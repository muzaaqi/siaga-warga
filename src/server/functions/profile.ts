import { createServerFn } from '@tanstack/react-start'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { reports } from '@/server/db/schema/reports'
import { eq, desc } from 'drizzle-orm'
import type { MyProfileAndReports } from '@/lib/schema'
import { updateProfileInputSchema } from '@/lib/schema/profile'

/**
 * Mengambil profil pengguna yang terautentikasi beserta daftar laporan mereka.
 *
 * Logika:
 * 1. Memverifikasi sesi pengguna via Better Auth.
 * 2. Mengambil data user (id, name, email, image, role, createdAt).
 * 3. Mengambil laporan yang dikirim oleh user (reporterUserId = user.id).
 * 4. Memformat data sesuai kontrak MyProfileAndReports (Zod schema).
 *
 * Diekspor terpisah agar dapat diuji secara independen tanpa Vite SSR runtime.
 */
export async function fetchMyProfileAndReports(): Promise<MyProfileAndReports> {
  const session = await auth.api.getSession({ headers: new Headers() })

  if (!session?.user) {
    throw new Error('Tidak terautentikasi')
  }

  const userId = session.user.id

  // Ambil data user
  const currentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (currentUsers.length === 0) {
    throw new Error('Pengguna tidak ditemukan')
  }
  const currentUser = currentUsers[0]

  // Ambil laporan user
  const userReports = await db
    .select({
      id: reports.id,
      trackingCode: reports.trackingCode,
      incidentType: reports.incidentType,
      description: reports.description,
      submittedAt: reports.submittedAt,
      addressDisplay: reports.addressDisplay,
      verificationStatus: reports.verificationStatus,
      handlingStatus: reports.handlingStatus,
      isPotentialDuplicate: reports.isPotentialDuplicate,
    })
    .from(reports)
    .where(eq(reports.reporterUserId, userId))
    .orderBy(desc(reports.submittedAt))

  // Transform ke format MyProfileAndReports
  return {
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      image: currentUser.image,
      role: currentUser.role as 'citizen' | 'moderator' | 'superadmin',
      createdAtIso: currentUser.createdAt.toISOString(),
    },
    reports: userReports.map((r) => ({
      id: r.id,
      trackingCode: r.trackingCode,
      incidentType: r.incidentType,
      description: r.description,
      submittedAtIso: r.submittedAt.toISOString(),
      addressDisplay: r.addressDisplay,
      verificationStatus: r.verificationStatus,
      handlingStatus: r.handlingStatus,
      isPotentialDuplicate: r.isPotentialDuplicate,
    })),
  }
}

/**
 * Memperbarui profil pengguna yang terautentikasi.
 *
 * Hanya memperbolehkan update nama dan image (avatar preset atau URL).
 * Validasi input sudah dilakukan oleh Zod schema di sisi klien & server function validator.
 */
export async function fetchUpdateMyProfile(
  input: { name?: string; image?: string | null },
): Promise<{ id: string; name: string; email: string; image: string | null; role: string; createdAtIso: string }> {
  const session = await auth.api.getSession({ headers: new Headers() })

  if (!session?.user) {
    throw new Error('Tidak terautentikasi')
  }

  const userId = session.user.id

  // Bangun object update secara dinamis (hanya field yang disediakan)
  const updateData: Partial<{ name: string; image: string | null; updatedAt: Date }> = {
    updatedAt: new Date(),
  }

  if (input.name !== undefined) {
    updateData.name = input.name
  }
  if (input.image !== undefined) {
    updateData.image = input.image
  }

  const updatedUsers = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    })

  if (updatedUsers.length === 0) {
    throw new Error('Gagal memperbarui profil')
  }
  const updatedUser = updatedUsers[0]

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    image: updatedUser.image,
    role: updatedUser.role,
    createdAtIso: updatedUser.createdAt.toISOString(),
  }
}

/**
 * Server Function GET untuk mengambil profil & laporan saya.
 * Dipanggil oleh SSR Loader di rute '/profil'.
 */
export const getMyProfileAndReports = createServerFn({ method: 'GET' }).handler(
  fetchMyProfileAndReports,
)

/**
 * Server Function POST untuk memperbarui profil saya.
 * Dipanggil oleh form edit profil.
 */
export const updateMyProfile = createServerFn({ method: 'POST' })
  .validator((input: unknown) => updateProfileInputSchema.parse(input))
  .handler(({ data }) => fetchUpdateMyProfile(data))