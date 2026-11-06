import { RotateCcwIcon, UsersIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UserEmptyStateProps {
  onReset?: () => void
}

export function UserEmptyState({ onReset }: UserEmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-14">
            <UsersIcon className="size-6 sm:size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
            Tidak Ada Pengguna Ditemukan
          </h3>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Tidak ada akun pengguna yang sesuai dengan kriteria filter saat ini.
            Coba periksa kembali ejaan nama atau ubah filter peran akun.
          </p>
          {onReset ? (
            <div className="mt-6">
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcwIcon className="size-3.5" />
                <span>Reset Filter Pencarian</span>
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
