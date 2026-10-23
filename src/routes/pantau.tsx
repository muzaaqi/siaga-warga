import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pantau')({
  component: PantauPage,
})

function PantauPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold">Pantau Peta Insiden</h1>
      <p className="mt-2 text-muted-foreground">
        Peta interaktif insiden kebakaran dan data satelit NASA FIRMS.
      </p>
    </div>
  )
}
