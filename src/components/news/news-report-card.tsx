import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  HelpCircleIcon,
  MapIcon,
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
import { formatRelativeTime } from '@/lib/utils'

interface NewsReportCardProps {
  item: NewsFeedItem
}

function getVerificationStatusBadge(
  status: NewsFeedItem['verificationStatus'],
) {
  switch (status) {
    case 'verified':
      return {
        label: 'Terverifikasi',
        variant: 'info' as const,
        icon: CheckCircle2Icon,
      }
    case 'needs_review':
      return {
        label: 'Perlu Review',
        variant: 'secondary' as const,
        icon: AlertCircleIcon,
      }
    case 'rejected':
      return {
        label: 'Ditolak',
        variant: 'destructive' as const,
        icon: XCircleIcon,
      }
    case 'insufficient_evidence':
      return {
        label: 'Bukti Kurang',
        variant: 'secondary' as const,
        icon: HelpCircleIcon,
      }
    case 'pending':
    default:
      return {
        label: 'Menunggu Triase',
        variant: 'secondary' as const,
        icon: ClockIcon,
      }
  }
}

export function NewsReportCard({ item }: NewsReportCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  const verificationBadge = getVerificationStatusBadge(item.verificationStatus)
  const VerificationIcon = verificationBadge.icon

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/lacak/${item.trackingCode}`
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Fallback diam
    }
  }

  const isLongDescription = item.description.length > 140
  const displayedDescription =
    isLongDescription && !isExpanded
      ? `${item.description.slice(0, 140)}...`
      : item.description

  return (
    <Card
      variant="canvas"
      size="sm"
      className="overflow-hidden"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '550px',
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
                <span className="shrink-0">•</span>
                <span className="shrink-0">
                  {formatRelativeTime(item.submittedAtIso)}
                </span>
              </span>
            </CardDescription>
          </div>
        </div>

        <CardAction>
          <Badge
            variant={verificationBadge.variant}
            size="default"
            className="shrink-0"
          >
            <VerificationIcon className="size-3" aria-hidden="true" />
            <span>{verificationBadge.label}</span>
          </Badge>
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

      {/* 3. Bar Aksi Cepat & Caption di dalam CardContent */}
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link
                    to="/lacak/$code"
                    params={{ code: item.trackingCode }}
                    aria-label={`Lacak status detail laporan ${item.trackingCode}`}
                  />
                }
              >
                <ExternalLinkIcon className="size-4" aria-hidden="true" />
                <span>Lacak</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link
                    to="/pantau"
                    search={{
                      lat: item.latitude,
                      lng: item.longitude,
                    }}
                    aria-label="Lihat lokasi kejadian di peta interaktif"
                  />
                }
              >
                <MapIcon className="size-4" aria-hidden="true" />
                <span>Peta</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleShare}
              aria-label="Salin tautan laporan"
            >
              {isCopied ? (
                <>
                  <CheckIcon
                    className="size-4 text-[var(--color-pine)]"
                    aria-hidden="true"
                  />
                  <span className="text-[var(--color-pine)]">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2Icon className="size-4" aria-hidden="true" />
                  <span>Bagikan</span>
                </>
              )}
            </Button>
          </div>

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
