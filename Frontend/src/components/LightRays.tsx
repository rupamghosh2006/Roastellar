'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

type RaysOrigin = 'top-center' | 'top-left' | 'top-right'

interface LightRaysProps {
  raysOrigin?: RaysOrigin
  raysColor?: string
  raysSpeed?: number
  lightSpread?: number
  rayLength?: number
  followMouse?: boolean
  mouseInfluence?: number
  noiseAmount?: number
  distortion?: number
  className?: string
  pulsating?: boolean
  fadeDistance?: number
  saturation?: number
}

export default function LightRays({
  raysOrigin = 'top-center',
  raysColor = '#ffffff',
  raysSpeed = 1.3,
  lightSpread = 0.5,
  rayLength = 3,
  followMouse = true,
  mouseInfluence = 0.2,
  noiseAmount = 0.38,
  distortion = 0,
  className,
  pulsating = true,
  fadeDistance = 1.8,
  saturation = 1.1,
}: LightRaysProps) {
  const [mouse, setMouse] = useState({ x: 50, y: 0 })

  useEffect(() => {
    if (!followMouse) return
    const onMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [followMouse])

  const originPosition = useMemo(() => {
    if (raysOrigin === 'top-left') return '12% 0%'
    if (raysOrigin === 'top-right') return '88% 0%'
    return '50% 0%'
  }, [raysOrigin])

  const xShift = followMouse ? (mouse.x - 50) * mouseInfluence : 0
  const fade = Math.max(0.45, Math.min(1, 1 / Math.max(1, fadeDistance)))
  const solidOpacity = Math.min(fade, Math.min(1, rayLength / 3)) * Math.max(0.4, Math.min(1, lightSpread))

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={
        {
          '--lr-color': raysColor,
          '--lr-x': `${xShift}%`,
          '--lr-speed': `${Math.max(0.2, raysSpeed) * 8}s`,
          '--lr-sat': saturation,
          '--lr-opacity': fade,
          '--lr-blur': `${Math.max(0, distortion) * 8}px`,
          '--lr-noise': Math.max(0.04, Math.min(0.45, noiseAmount)),
          backgroundPosition: originPosition,
        } as CSSProperties
      }
    >
      <div
        className={cn(
          'absolute inset-[-40%_-10%_0_-10%] will-change-transform',
          pulsating && 'animate-[pulse_5s_ease-in-out_infinite]'
        )}
        style={{
          transform: `translateX(var(--lr-x))`,
          opacity: solidOpacity,
          filter: 'blur(var(--lr-blur)) saturate(var(--lr-sat))',
          background: 'color-mix(in oklab, var(--lr-color) 12%, transparent)',
          animationDuration: 'var(--lr-speed)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          background: 'rgba(255,255,255,var(--lr-noise))',
        }}
      />
    </div>
  )
}
