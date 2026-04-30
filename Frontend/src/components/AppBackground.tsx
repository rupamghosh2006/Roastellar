'use client'

import FaultyTerminal from '@/components/FaultyTerminal'

export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20">
      <FaultyTerminal
        className="h-full w-full"
        scale={1.5}
        gridMul={[2, 1]}
        digitSize={1.2}
        timeScale={0.5}
        pause={false}
        scanlineIntensity={0.5}
        glitchAmount={1}
        flickerAmount={1}
        noiseAmp={1}
        chromaticAberration={0}
        dither={0}
        curvature={0.1}
        tint="#A7EF9E"
        mouseReact
        mouseStrength={0.5}
        pageLoadAnimation
        brightness={0.6}
      />
    </div>
  )
}
