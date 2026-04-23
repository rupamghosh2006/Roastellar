'use client'

import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs'
import { Toaster } from 'sonner'

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProviderBase>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'glass border-white/10',
          style: {
            background: 'hsl(220 20% 6%)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
          },
        }}
      />
    </ClerkProviderBase>
  )
}