'use client'

import GridScan from '@/components/GridScan'

export function WarpBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#2F293A"
        gridScale={0.1}
        scanColor="#FF9FFC"
        scanOpacity={0.4}
        enablePost
        bloomIntensity={0.6}
        chromaticAberration={0.002}
        noiseIntensity={0.01}
      />
    </div>
  )
}
