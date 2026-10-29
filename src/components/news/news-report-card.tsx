import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  HelpCircleIcon,
  MapPinIcon,
  Share2Icon,
  ShieldAlertIcon,
  XCircleIcon,
} from 'lucide-react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { NewsFeedItem } from '@/lib/schema/news'
import { cn, formatRelativeTime } from '@/lib/utils'

interface NewsReportCardProps {
  item: NewsFeedItem
}

function getVerificationStatusConfig(
  status: NewsFeedItem['verificationStatus'],
) {
  switch (status) {
    case 'verified':
      return {
        label: 'Terverifikasi',
        colorClass: 'text-[var(--color-pine)]',
        icon: CheckCircle2Icon,
      }
    case 'needs_review':
      return {
        label: 'Perlu Review',
        colorClass: 'text-[var(--warning)]',
        icon: AlertCircleIcon,
      }
    case 'rejected':
      return {
        label: 'Ditolak',
        colorClass: 'text-destructive',
        icon: XCircleIcon,
      }
    case 'insufficient_evidence':
      return {
        label: 'Bukti Kurang',
        colorClass: 'text-muted-foreground',
        icon: HelpCircleIcon,
      }
    case 'pending':
    default:
      return {
        label: 'Menunggu Triase',
        colorClass: 'text-muted-foreground',
        icon: ClockIcon,
      }
  }
}

const handlingStatusConfig: Record<
  NewsFeedItem['handlingStatus'],
  {
    label: string
    variant: 'secondary' | 'success' | 'warning' | 'info'
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  not_forwarded: { label: 'Menunggu', variant: 'secondary', icon: ClockIcon },
  forwarded: { label: 'Diteruskan', variant: 'info', icon: ShieldAlertIcon },
  acknowledged: { label: 'Dikonfirmasi', variant: 'info', icon: CheckIcon },
  in_progress: { label: 'Ditangani', variant: 'warning', icon: FlameIcon },
  resolved: { label: 'Selesai', variant: 'success', icon: CheckCircle2Icon },
  unknown: { label: 'Dipantau', variant: 'secondary', icon: ClockIcon },
}

export function NewsReportCard({ item }: NewsReportCardProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  const verificationConfig = getVerificationStatusConfig(
    item.verificationStatus,
  )
  const VerificationIcon = verificationConfig.icon

  const handlingBadge = handlingStatusConfig[item.handlingStatus]
  const HandlingIcon = handlingBadge.icon

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const shareUrl = `${window.location.origin}/lacak/${item.trackingCode}`
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Fallback diam
    }
  }

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null
    if (
      target?.closest(
        'button, a, input, select, textarea, [role="button"], [data-interactive]',
      )
    ) {
      return
    }
    navigate({
      to: '/lacak/$code',
      params: { code: item.trackingCode },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement | null
      if (
        target?.closest(
          'button, a, input, select, textarea, [role="button"], [data-interactive]',
        )
      ) {
        return
      }
      e.preventDefault()
      navigate({
        to: '/lacak/$code',
        params: { code: item.trackingCode },
      })
    }
  }

  const isLongDescription = item.description.length > 140
  const displayedDescription =
    isLongDescription && !isExpanded
      ? `${item.description.slice(0, 140)}...`
      : item.description

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.latitude},${item.longitude}`)}`

  return (
    <Card
      variant="canvas"
      size="sm"
      tabIndex={0}
      role="article"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer overflow-hidden"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '500px',
      }}
    >
      {/* 1. Header Kartu Ala Instagram */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            user={item.reporter}
            role="true"
            size="default"
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <CardTitle>
              <span className="truncate text-sm font-bold">
                {item.reporter.name}
              </span>
            </CardTitle>
            <CardDescription>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPinIcon className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {item.addressDisplay || 'Lokasi Terverifikasi'}
                </span>
              </span>
            </CardDescription>
          </div>
        </div>

        <CardAction
          title={`Status Validitas: ${verificationConfig.label}`}
          aria-label={`Status Validitas: ${verificationConfig.label}`}
        >
          <VerificationIcon
            className={cn('size-4 shrink-0', verificationConfig.colorClass)}
            aria-hidden="true"
          />
        </CardAction>
      </CardHeader>

      {/* 2. Media Foto Bukti (Aspect 4:3 Berbingkai) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.primaryImageUrl ? (
          <img
            src={item.primaryImageUrl}
            alt={`Bukti kejadian ${item.incidentType}: ${item.description.slice(0, 50)}`}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/60 p-6 text-center text-muted-foreground">
            <ShieldAlertIcon className="size-10 text-muted-foreground/60" />
            <p className="text-xs font-medium">
              Dokumentasi Terverifikasi Petugas
            </p>
          </div>
        )}
      </div>

      {/* 3. Bar Aksi Ikon & Caption di dalam CardContent */}
      <CardContent>
        <div className="space-y-2.5">
          {/* Bar Aksi Ikon & Status Penanganan */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Buka lokasi di Google Maps"
                    title="Buka lokasi di Google Maps"
                  />
                }
              >
                <MapPinIcon className="size-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleShare}
                aria-label="Salin tautan laporan"
                title={
                  isCopied ? 'Tautan berhasil disalin' : 'Salin tautan laporan'
                }
              >
                {isCopied ? (
                  <CheckIcon
                    className="size-4 text-[var(--color-pine)]"
                    aria-hidden="true"
                  />
                ) : (
                  <Share2Icon className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>

            {/* Status Penanganan Lapangan */}
            <Badge variant={handlingBadge.variant} size="xs">
              <HandlingIcon className="size-3" aria-hidden="true" />
              <span>{handlingBadge.label}</span>
            </Badge>
          </div>

          {/* Waktu Laporan (di atas deskripsi, di bawah foto ala Instagram) */}
          <time
            dateTime={item.submittedAtIso}
            className="block text-[11px] text-muted-foreground"
          >
            {formatRelativeTime(item.submittedAtIso)}
          </time>

          {/* Deskripsi & Caption Ala Feed */}
          <p className="text-sm leading-relaxed text-foreground">
            <span className="mr-1.5 font-bold text-foreground">
              {item.reporter.name}
            </span>
            {displayedDescription}
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 cursor-pointer font-semibold text-muted-foreground hover:text-foreground hover:underline"
              >
                {isExpanded ? 'lebih sedikit' : 'selengkapnya'}
              </button>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
