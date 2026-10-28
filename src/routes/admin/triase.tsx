import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/triase')({
  component: AdminTriasePage,
})

function AdminTriasePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold">Dasbor Triase Moderator</h1>
      <p className="mt-2 text-muted-foreground">
        Pusat kendali triase laporan dan verifikasi insiden kebakaran.
      </p>
    </div>
  )
}
