import type { Metadata } from 'next'
import { Inter, Orbitron, Space_Grotesk } from 'next/font/google'
import { ClerkProvider } from '@/components/ClerkProvider'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
})

export const metadata: Metadata = {
  title: 'Roastellar - Roast. Battle. Earn.',
  description: 'A gamified social battle platform powered by Stellar where users join roast battles, vote, predict winners, and earn rewards.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} ${orbitron.variable} ${spaceGrotesk.variable} font-inter antialiased`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}