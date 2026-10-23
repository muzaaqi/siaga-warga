import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lapor')({
  component: LaporPage,
})

function LaporPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold">Lapor Kebakaran</h1>
      <p className="mt-2 text-muted-foreground">
        Formulir pelaporan kebakaran warga dengan verifikasi foto wajib.
      </p>
    </div>
  )
}
