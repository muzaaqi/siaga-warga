import {
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface IncidentReporterCardProps {
  isAnonymous: boolean
  reporterName: string | null
  reporterPhone: string | null
  reporterEmail: string | null
}

export function IncidentReporterCard({
  isAnonymous,
  reporterName,
  reporterPhone,
  reporterEmail,
}: IncidentReporterCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            {isAnonymous ? (
              <ShieldCheckIcon className="size-4 text-amber-500" />
            ) : (
              <UserCheckIcon className="size-4 text-primary" />
            )}
            <span>Identitas Pelapor</span>
          </span>
        </CardTitle>
        <CardAction>
          <Badge variant={isAnonymous ? 'outline' : 'secondary'} size="xs">
            {isAnonymous ? 'Anonim' : 'Terverifikasi Akun'}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-xs sm:text-sm">
          {isAnonymous ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Pelapor memilih opsi anonim. Data nomor telepon dan identitas
              pribadi tidak disimpan atau dilindungi sepenuhnya demi keselamatan
              saksi warga.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium text-foreground">
                  {reporterName || 'Warga Siaga'}
                </span>
              </div>

              {reporterPhone ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Telepon / WA:</span>
                  <a
                    href={`tel:${reporterPhone}`}
                    className="flex items-center gap-1 font-mono text-primary hover:underline"
                  >
                    <PhoneIcon className="size-3" />
                    <span>{reporterPhone}</span>
                  </a>
                </div>
              ) : null}

              {reporterEmail ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <a
                    href={`mailto:${reporterEmail}`}
                    className="flex items-center gap-1 font-mono text-primary hover:underline"
                  >
                    <MailIcon className="size-3" />
                    <span>{reporterEmail}</span>
                  </a>
                </div>
              ) : null}

              <p className="mt-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                Khusus petugas penanganan darurat BPBD dan Damkar untuk
                konfirmasi lapangan.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
