import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { EmergencyBanner } from '@/components/shared/emergency-banner'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { HeaderNav } from '@/components/shared/header-nav'
import { Footer } from '@/components/shared/footer'
import { NotFound } from '@/components/shared/not-found'
import { GlobalErrorFallback } from '@/components/shared/global-error-fallback'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SiagaWarga - Platform Pelaporan & Tracking Kebakaran Terbuka',
      },
      {
        name: 'theme-color',
        content: '#1b4d3e',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'SiagaWarga',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: 'any',
      },
      {
        rel: 'icon',
        href: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        href: '/icon.svg',
      },
      {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => <NotFound />,
  errorComponent: (props) => <GlobalErrorFallback {...props} />,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <div className="relative flex min-h-screen flex-col">
          <EmergencyBanner />
          <OfflineIndicator />
          <HeaderNav />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer />
        </div>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
