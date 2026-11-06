import * as React from 'react'
import {
  DownloadIcon,
  FilterIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Badge } from '@/components/ui/badge'
import type { TriageQueueQuery } from '@/lib/schema/moderator'

interface TriageFilterBarProps {
  query: TriageQueueQuery
  onQueryChange: (updates: Partial<TriageQueueQuery>) => void
  onReset: () => void
  onOpenExport?: () => void
}

export function TriageFilterBar({
  query,
  onQueryChange,
  onReset,
  onOpenExport,
}: TriageFilterBarProps) {
  const [searchTerm, setSearchTerm] = React.useState(query.search || '')

  // Debounce input pencarian 300ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (query.search || '')) {
        onQueryChange({ search: searchTerm, offset: 0 })
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm, query.search, onQueryChange])

  const priorityOptions: Array<{
    value: TriageQueueQuery['priority']
    label: string
  }> = [
    { value: 'all', label: 'Semua Prioritas' },
    { value: 'high', label: 'Mendesak' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Rendah' },
  ]

  const statusOptions: Array<{
    value: TriageQueueQuery['status']
    label: string
  }> = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'needs_review', label: 'Perlu Tinjauan' },
    { value: 'verified', label: 'Terverifikasi' },
    { value: 'insufficient_evidence', label: 'Bukti Kurang' },
    { value: 'rejected', label: 'Ditolak' },
  ]

  const isFiltered =
    query.priority !== 'all' ||
    query.status !== 'all' ||
    query.incidentType !== 'all' ||
    Boolean(query.search && query.search.trim().length > 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Baris 1: Kolom Pencarian & Tombol Reset */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode lacak, alamat, atau deskripsi insiden..."
          />
          {searchTerm ? (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  onQueryChange({ search: '', offset: 0 })
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        <div className="flex items-center gap-2">
          {onOpenExport ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenExport}
            >
              <DownloadIcon className="size-3.5" />
              <span>Ekspor Data</span>
            </Button>
          ) : null}

          {isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                onReset()
              }}
            >
              <RotateCcwIcon className="size-3.5" />
              <span>Reset Filter</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Baris 2: Filter Tingkat Prioritas */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <FilterIcon className="size-3.5" />
          <span>Prioritas:</span>
        </div>
        {priorityOptions.map((opt) => {
          const isActive = query.priority === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onQueryChange({ priority: opt.value, offset: 0 })
              }
              className="cursor-pointer transition-colors focus-visible:outline-none"
            >
              <Badge variant={isActive ? 'default' : 'outline'}>
                {opt.label}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Baris 3: Filter Status Verifikasi */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <span>Status:</span>
        </div>
        {statusOptions.map((opt) => {
          const isActive = query.status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onQueryChange({ status: opt.value, offset: 0 })}
              className="cursor-pointer transition-colors focus-visible:outline-none"
            >
              <Badge variant={isActive ? 'secondary' : 'outline'}>
                {opt.label}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
