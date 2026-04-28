'use client'

import { usePathname } from 'next/navigation'
import DotField from '@/components/DotField'
import { WarpBackground } from '@/components/WarpBackground'

export function AppBackground() {
  const pathname = usePathname()

  if (pathname === '/') {
    return <WarpBackground />
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <DotField
        dotRadius={1.5}
        dotSpacing={14}
        cursorRadius={500}
        cursorForce={0.1}
        bulgeOnly
        bulgeStrength={67}
        glowRadius={160}
        sparkle={false}
        waveAmplitude={0}
        gradientFrom="rgba(168, 85, 247, 0.35)"
        gradientTo="rgba(180, 151, 207, 0.25)"
        glowColor="#120F17"
      />
    </div>
  )
}
