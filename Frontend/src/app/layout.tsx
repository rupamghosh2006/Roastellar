import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata = {
  title: 'Roastellar - Roast. Battle. Earn.',
  description: 'A gamified social battle platform powered by Stellar where users sign in, complete onboarding, join roast battles, vote, predict winners, and earn rewards.',
  keywords: 'battle, roast, gaming, social, Stellar, crypto, rewards',
  openGraph: {
    title: 'Roastellar',
    description: 'Gamified social battle platform powered by Stellar',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="bg-background antialiased">
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  )
}
