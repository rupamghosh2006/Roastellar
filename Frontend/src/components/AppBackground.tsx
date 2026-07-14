'use client'

import { useMemo } from 'react'
import FaultyTerminal from '@/components/FaultyTerminal'
import { useDeviceCapability } from '@/lib/hooks'

export function AppBackground() {
  const { dprCap, shouldReduceQuality, qualityLevel } = useDeviceCapability()

  const ftProps = useMemo(() => {
    const scale = qualityLevel === 'low' ? 0.8 : qualityLevel === 'medium' ? 1 : 1.2
    return {
      className: 'h-full w-full',
      scale,
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
      dpr: dprCap,
      brightness: 0.6,
    }
  }, [dprCap, qualityLevel])

  return (
    <div className="pointer-events-none fixed inset-0 -z-20">
      <FaultyTerminal {...ftProps} />
    </div>
  )
}
