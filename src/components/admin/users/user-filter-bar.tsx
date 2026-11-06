import * as React from 'react'
import { FilterIcon, RotateCcwIcon, SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Badge } from '@/components/ui/badge'
import type { AdminUsersQuery } from '@/lib/schema/admin-users'

interface UserFilterBarProps {
  query: AdminUsersQuery
  onQueryChange: (updates: Partial<AdminUsersQuery>) => void
  onReset: () => void
}

export function UserFilterBar({
  query,
  onQueryChange,
  onReset,
}: UserFilterBarProps) {
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

  const roleOptions: Array<{
    value: AdminUsersQuery['role']
    label: string
  }> = [
    { value: 'all', label: 'Semua Peran' },
    { value: 'citizen', label: 'Warga Pelapor' },
    { value: 'moderator', label: 'Petugas Verifikator' },
    { value: 'superadmin', label: 'Administrator Utama' },
  ]

  const isFiltered =
    query.role !== 'all' ||
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
            placeholder="Cari nama pengguna, surel Google, atau ID..."
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

      {/* Baris 2: Filter Peran Pengguna */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <FilterIcon className="size-3.5" />
          <span>Peran Akun:</span>
        </div>
        {roleOptions.map((opt) => {
          const isActive = query.role === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onQueryChange({ role: opt.value, offset: 0 })}
              className="rounded-full focus:outline-none"
            >
              <Badge variant={isActive ? 'default' : 'outline'}>
                {opt.label}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
