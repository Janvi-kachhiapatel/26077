import type { Metadata, Viewport } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import { Sidebar, Topbar } from '@/components/chrome'

export const metadata: Metadata = {
  title: 'VajraNow | Probabilistic 0–6 h Hazard → Alert Platform',
  description:
    'SIH26077 prototype: probabilistic nowcast engine, impact-based CAP 1.2 alert chain with human approval, verification against baselines, data-health degradation, drill mode. Replay data only.',
  generator: 'VajraNow prototype',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (e.g. Bing/Copilot) inject
          attributes like bis_skin_checked before React hydrates; ignore that noise. */}
      <body className="antialiased" suppressHydrationWarning>
        <StoreProvider>
          <div className="mobile-menu-slot" />
          <Sidebar />
          <Topbar />
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
