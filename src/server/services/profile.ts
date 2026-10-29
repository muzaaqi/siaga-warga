import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { reports } from '@/server/db/schema/reports'
import { eq, desc } from 'drizzle-orm'
import type { MyProfileAndReports } from '@/lib/schema'

/**
 * Mengambil profil pengguna yang terautentikasi beserta daftar laporan mereka.
 */
export async function fetchMyProfileAndReports(
  userId: string,
): Promise<MyProfileAndReports> {
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
 */
export async function fetchUpdateMyProfile(
  userId: string,
  input: { name?: string; image?: string | null },
): Promise<{
  id: string
  name: string
  email: string
  image: string | null
  role: string
  createdAtIso: string
}> {
  const updateData: Partial<{
    name: string
    image: string | null
    updatedAt: Date
  }> = {
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
