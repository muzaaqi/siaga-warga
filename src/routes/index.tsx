import { createFileRoute } from '@tanstack/react-router'
import { getLandingStats } from '@/server/functions/reports'
import { LandingSkeleton } from '@/components/report/landing-skeleton'
import { LandingErrorBoundary } from '@/components/report/landing-error-boundary'
import { LandingView } from '@/components/report/landing-view'

export const Route = createFileRoute('/')({
  loader: async () => await getLandingStats(),
  component: LandingPage,
  pendingComponent: LandingSkeleton,
  errorComponent: LandingErrorBoundary,
  head: () => ({
    meta: [
      {
        title: 'SiagaWarga - Platform Pelaporan & Tracking Kebakaran Terbuka',
      },
      {
        name: 'description',
        content:
          'Platform pemantauan dan verifikasi pelaporan kebakaran hutan, lahan, dan permukiman di Indonesia dengan validasi silang data satelit aktif NASA FIRMS.',
      },
      {
        property: 'og:title',
        content: 'SiagaWarga - Platform Pelaporan & Tracking Kebakaran Terbuka',
      },
      {
        property: 'og:description',
        content:
          'Sistem pemantauan kebakaran transparan dengan validasi bertingkat, deduplikasi spasial PostGIS, dan perlindungan privasi pelapor.',
      },
    ],
  }),
})

function LandingPage() {
  const stats = Route.useLoaderData()
  return <LandingView stats={stats} />
}
