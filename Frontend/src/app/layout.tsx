import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@/components/ClerkProvider'
import { Navbar } from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roastellar - Roast. Battle. Earn.',
  description: 'A gamified social battle platform powered by Stellar where users join roast battles, vote, predict winners, and earn rewards.',
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="font-inter antialiased">
        <ClerkProvider>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
