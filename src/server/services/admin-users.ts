import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { reports } from '@/server/db/schema/reports'
import { reportStatusHistory } from '@/server/db/schema/moderators'
import type {
  AdminUserItem,
  AdminUsersQuery,
  AdminUsersResponse,
  UpdateUserRoleInput,
  UserRole,
  UserRoleStats,
} from '@/lib/schema/admin-users'

/**
 * Validasi aturan bisnis mutasi peran pengguna.
 * Mencegah superadmin mencopot peran superadmin miliknya sendiri (Lockout Protection).
 */
export function validateRoleMutation(
  currentSuperadminId: string,
  targetUserId: string,
  currentRole: string,
  newRole: string,
): void {
  if (
    currentSuperadminId === targetUserId &&
    currentRole === 'superadmin' &&
    newRole !== 'superadmin'
  ) {
    throw new Error(
      'Anda tidak dapat mencopot peran superadmin Anda sendiri demi keamanan sistem.',
    )
  }
}

/**
 * Menghitung ringkasan statistik kuota peran pengguna dari daftar entri peran.
 */
export function calculateUserRoleStats(
  users: Array<{ role: string }>,
): UserRoleStats {
  let citizenCount = 0
  let moderatorCount = 0
  let superadminCount = 0

  for (const u of users) {
    if (u.role === 'superadmin') {
      superadminCount++
    } else if (u.role === 'moderator') {
      moderatorCount++
    } else {
      citizenCount++
    }
  }

  return {
    totalUsers: users.length,
    citizenCount,
    moderatorCount,
    superadminCount,
  }
}

/**
 * Mengambil daftar pengguna terdaftar lengkap dengan statistik agregat peran
 * dan jumlah kontribusi pelaporan maupun moderasi.
 */
export async function fetchAdminUsersList(
  query: AdminUsersQuery,
): Promise<AdminUsersResponse> {
  // 1. Ambil seluruh pengguna untuk menghitung statistik peran
  const allUsersRoles = await db
    .select({
      id: user.id,
      role: user.role,
    })
    .from(user)

  const stats = calculateUserRoleStats(allUsersRoles)

  // 2. Susun kondisi filter
  const conditions = []

  if (query.role !== 'all') {
    conditions.push(eq(user.role, query.role))
  }

  if (query.search && query.search.trim()) {
    const term = `%${query.search.trim()}%`
    conditions.push(
      or(
        ilike(user.name, term),
        ilike(user.email, term),
        eq(user.id, query.search.trim()),
      ),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // 3. Kueri pengguna dengan paginasi
  const matchedUsers = await db
    .select()
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(query.limit)
    .offset(query.offset)

  // 4. Kueri laporan dan tindakan moderasi secara batch (Optimasi Kueri N+1)
  let userItems: Array<AdminUserItem> = []

  if (matchedUsers.length > 0) {
    const userIds = matchedUsers.map((u) => u.id)
    const userNames = matchedUsers.map((u) => u.name)

    // Agregasi jumlah laporan per pengguna dalam 1 kueri
    const reportCountsMap = new Map<string, number>()
    const reportCountsRes = await db
      .select({
        userId: reports.reporterUserId,
        count: sql<number>`count(*)::int`,
      })
      .from(reports)
      .where(inArray(reports.reporterUserId, userIds))
      .groupBy(reports.reporterUserId)

    for (const r of reportCountsRes) {
      if (r.userId) {
        reportCountsMap.set(r.userId, r.count)
      }
    }

    // Agregasi jumlah tindakan moderasi per pengguna dalam 1 kueri
    const modCountsMap = new Map<string, number>()
    const modCountsRes = await db
      .select({
        changedBy: reportStatusHistory.changedBy,
        count: sql<number>`count(*)::int`,
      })
      .from(reportStatusHistory)
      .where(
        or(
          inArray(reportStatusHistory.changedBy, userIds),
          inArray(reportStatusHistory.changedBy, userNames),
        ),
      )
      .groupBy(reportStatusHistory.changedBy)

    for (const m of modCountsRes) {
      modCountsMap.set(m.changedBy, m.count)
    }

    userItems = matchedUsers.map((u) => {
      const reportCount = reportCountsMap.get(u.id) ?? 0
      const modCount =
        (modCountsMap.get(u.id) ?? 0) + (modCountsMap.get(u.name) ?? 0)

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role as UserRole,
        createdAt: u.createdAt,
        reportsCount: reportCount,
        moderationActionsCount: modCount,
      }
    })
  }

  // 5. Total count pengguna yang cocok dengan kueri
  const totalCountRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(whereClause)

  const totalCount = totalCountRes[0]?.count ?? 0

  return {
    users: userItems,
    totalCount,
    stats,
  }
}

/**
 * Mengubah peran akun pengguna di basis data dengan proteksi lockout mandiri.
 */
export async function executeUserRoleChange(
  currentSuperadminId: string,
  input: UpdateUserRoleInput,
): Promise<{ success: boolean; updatedUser: AdminUserItem }> {
  // 1. Cari pengguna target
  const targetUsers = await db
    .select()
    .from(user)
    .where(eq(user.id, input.targetUserId))
    .limit(1)

  if (targetUsers.length === 0) {
    throw new Error('Pengguna target tidak ditemukan.')
  }

  const target = targetUsers[0]

  // 2. Validasi mutasi peran (termasuk proteksi lockout self-demotion)
  validateRoleMutation(
    currentSuperadminId,
    target.id,
    target.role,
    input.newRole,
  )

  // 3. Perbarui peran di basis data
  const updatedList = await db
    .update(user)
    .set({
      role: input.newRole,
      updatedAt: new Date(),
    })
    .where(eq(user.id, target.id))
    .returning()

  const updated = updatedList[0]

  // Catat riwayat audit mutasi peran ke log sistem peladen (Rule 8)
  console.info(
    `[ROLE_CHANGE_AUDIT] Waktu: ${new Date().toISOString()} | Aktor Superadmin: ${currentSuperadminId} | Target: ${target.id} (${target.email}) | Peran: '${target.role}' -> '${input.newRole}' | Alasan: "${input.reasonNote}"`,
  )

  const reportCountRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(eq(reports.reporterUserId, updated.id))

  const modCountRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reportStatusHistory)
    .where(
      or(
        eq(reportStatusHistory.changedBy, updated.id),
        eq(reportStatusHistory.changedBy, updated.name),
        ilike(reportStatusHistory.changedBy, `%${updated.name}%`),
      ),
    )

  return {
    success: true,
    updatedUser: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
      role: updated.role as UserRole,
      createdAt: updated.createdAt,
      reportsCount: reportCountRes[0]?.count ?? 0,
      moderationActionsCount: modCountRes[0]?.count ?? 0,
    },
  }
}
