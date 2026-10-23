import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lacak/$code')({
  component: LacakPage,
})

function LacakPage() {
  const { code } = Route.useParams()
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold">Status Laporan: {code}</h1>
      <p className="mt-2 text-muted-foreground">
        Linimasa audit 4 fase pemantauan penanganan kebakaran.
      </p>
    </div>
  )
}
