import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  FlameIcon,
  SearchIcon,
  SearchXIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TrackingNotFoundProps {
  searchedCode: string
}

export function TrackingNotFound({ searchedCode }: TrackingNotFoundProps) {
  const [inputCode, setInputCode] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputCode.trim().toUpperCase()
    if (!trimmed) {
      setErrorMsg('Harap masukkan kode pelacakan.')
      return
    }

    if (!/^SW-\d{4}-[A-Z0-9]{4}$/.test(trimmed)) {
      setErrorMsg('Format kode tidak valid. Contoh: SW-2026-X89B')
      return
    }

    setErrorMsg('')
    navigate({ to: '/lacak/$code', params: { code: trimmed } })
  }

  return (
    <Card className="mx-auto w-full max-w-xl text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchXIcon className="size-6 text-destructive" />
        </div>
        <CardTitle>Laporan Tidak Ditemukan</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Kode tiket <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">{searchedCode}</code> tidak terdaftar di sistem SiagaWarga.
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Pastikan kembali format penulisan kode pelacakan yang tertera pada bukti laporan Anda (contoh: <strong>SW-2026-X89B</strong>).
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                variant="mono"
                placeholder="Cari kode tiket lain (misal: SW-2026-X89B)..."
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase())
                  setErrorMsg('')
                }}
              />
              <Button type="submit" size="sm">
                <SearchIcon className="size-3.5" />
                <span>Cari</span>
              </Button>
            </div>

            {errorMsg && (
              <p className="text-left text-xs text-destructive">{errorMsg}</p>
            )}
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/" />}
            >
              <ArrowLeftIcon className="size-3.5" />
              <span>Kembali ke Beranda</span>
            </Button>

            <Button
              size="sm"
              render={<Link to="/lapor" />}
            >
              <FlameIcon className="size-3.5" />
              <span>Buat Laporan Baru</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
