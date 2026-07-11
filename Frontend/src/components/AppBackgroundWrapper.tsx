'use client'

import dynamic from 'next/dynamic'

const AppBackgroundInner = dynamic(() => import('@/components/AppBackground').then(mod => mod.AppBackground), { ssr: false })

export default function AppBackground() {
  return <AppBackgroundInner />
}
