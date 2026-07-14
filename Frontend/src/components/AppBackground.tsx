'use client'

import { useMemo } from 'react'
import FaultyTerminal from '@/components/FaultyTerminal'

export function AppBackground() {
  const ftProps = useMemo(() => ({
    className: 'h-full w-full',
    scale: 1.2,
    gridMul: [2, 1] as [number, number],
    digitSize: 1.2,
    timeScale: 0.3,
    pause: false,
    scanlineIntensity: 0.4,
    glitchAmount: 1,
    flickerAmount: 1,
    noiseAmp: 1,
    chromaticAberration: 0,
    dither: 0,
    curvature: 0.1,
    tint: '#A7EF9E',
    mouseReact: false,
    mouseStrength: 0.5,
    pageLoadAnimation: true,
    brightness: 0.6,
  }), [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-20">
      <FaultyTerminal {...ftProps} />
    </div>
  )
}
