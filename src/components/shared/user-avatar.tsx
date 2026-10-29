import * as React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface UserAvatarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  } | null
  name?: string | null
  image?: string | null
  /**
   * Menampilkan pita status peran ala LinkedIn #OPENTOWORK.
   * Mendukung boolean (true/false) atau string ("true"/"false" atau nama role).
   */
  role?:
    | boolean
    | 'true'
    | 'false'
    | 'citizen'
    | 'moderator'
    | 'superadmin'
    | string
    | null
  /** Flag eksplisit untuk menyalakan/mematikan tampilan role */
  showRole?: boolean
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl'
  className?: string
  avatarClassName?: string
  children?: React.ReactNode
}

interface RoleStyleConfig {
  label: string
  color: string
  fontSize: number
}

const ROLE_CONFIG: Record<string, RoleStyleConfig> = {
  moderator: {
    label: '#PETUGAS',
    color: 'var(--color-pine)',
    fontSize: 7.5,
  },
  superadmin: {
    label: '#SUPERADMIN',
    color: 'var(--color-ember)',
    fontSize: 6.2,
  },
  citizen: {
    label: '#WARGA',
    color: 'var(--color-forest)',
    fontSize: 8,
  },
}

export function UserAvatar({
  user,
  name: propName,
  image: propImage,
  role: propRole,
  showRole,
  size = 'default',
  className,
  avatarClassName,
  children,
}: UserAvatarProps) {
  const reactId = React.useId()
  const pathId = `role-arc-${reactId.replace(/:/g, '')}`

  const resolvedName = propName ?? user?.name ?? 'Pengguna'
  const resolvedImage = propImage !== undefined ? propImage : user?.image
  const initial = resolvedName ? resolvedName.charAt(0).toUpperCase() : 'U'

  // Menentukan apakah overlay role ditampilkan (dukungan role={true}, role="true", showRole={true})
  const shouldShowRole = React.useMemo(() => {
    if (showRole !== undefined) return Boolean(showRole)
    if (typeof propRole === 'boolean') return propRole
    if (propRole === 'true') return true
    if (propRole === 'false') return false
    if (typeof propRole === 'string' && propRole.length > 0) return true
    return false
  }, [showRole, propRole])

  // Menentukan role string yang digunakan
  const activeRole = React.useMemo(() => {
    if (
      typeof propRole === 'string' &&
      propRole !== 'true' &&
      propRole !== 'false'
    ) {
      return propRole
    }
    return user?.role ?? 'citizen'
  }, [propRole, user?.role])

  const roleStyle = ROLE_CONFIG[activeRole] ?? ROLE_CONFIG.citizen

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
    >
      <Avatar size={size} className={avatarClassName}>
        {resolvedImage && (
          <AvatarImage src={resolvedImage} alt={resolvedName} />
        )}
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>

      {/* Overlay pita melengkung ala LinkedIn #OPENTOWORK */}
      {shouldShowRole && (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-xs"
          aria-label={`Peran akun: ${roleStyle.label}`}
        >
          <defs>
            <clipPath id={`${pathId}-clip`}>
              <circle cx="50" cy="50" r="49" />
            </clipPath>
            {/* Busur lengkung 150 derajat di bagian bawah lingkaran */}
            <path
              id={pathId}
              d="M 9.4 60.9 A 42 42 0 0 0 90.6 60.9"
              fill="none"
            />
          </defs>

          {/* Pita latar melengkung */}
          <g clipPath={`url(#${pathId}-clip)`}>
            <path
              d="M 9.4 60.9 A 42 42 0 0 0 90.6 60.9"
              fill="none"
              stroke={roleStyle.color}
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Garis batas tipis pemisah */}
            <path
              d="M 9.4 60.9 A 42 42 0 0 0 90.6 60.9"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.2"
            />
          </g>

          {/* Teks melengkung sepanjang busur (hanya untuk ukuran non-sm agar tetap terbaca jelas) */}
          {size !== 'sm' && (
            <text
              fill="#ffffff"
              fontSize={roleStyle.fontSize}
              fontWeight="800"
              letterSpacing="1.2"
              className="font-extrabold uppercase select-none"
            >
              <textPath
                href={`#${pathId}`}
                startOffset="50%"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {roleStyle.label}
              </textPath>
            </text>
          )}
        </svg>
      )}

      {children}
    </div>
  )
}
