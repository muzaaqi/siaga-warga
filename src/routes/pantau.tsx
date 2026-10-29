import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pantau')({
  component: PantauPage,
})

function PantauPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Pantau Peta Insiden
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Peta interaktif insiden kebakaran dan data satelit NASA FIRMS.
        </p>
      </header>
    </div>
  )
}
