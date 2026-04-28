'use client'

import { useEffect, useRef } from 'react'

type DotGridProps = {
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
  shockRadius?: number
  shockStrength?: number
  resistance?: number
  returnDuration?: number
}

type Dot = {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
}

export default function DotGrid({
  dotSize = 5,
  gap = 15,
  baseColor = '#2F293A',
  activeColor = '#5227FF',
  proximity = 120,
  shockRadius = 250,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dots: Dot[] = []
    const pointer = { x: -9999, y: -9999, movedAt: 0 }
    let raf = 0

    const setup = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      dots.length = 0
      for (let y = gap / 2; y < rect.height; y += gap) {
        for (let x = gap / 2; x < rect.width; x += gap) {
          dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 })
        }
      }
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.movedAt = performance.now()
    }

    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    const tick = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const dt = 1 / 60
      const spring = 14 / Math.max(0.25, returnDuration)
      const damping = Math.min(0.98, Math.max(0.7, 1 - dt * 4))

      for (const d of dots) {
        const dx = d.x - pointer.x
        const dy = d.y - pointer.y
        const dist = Math.hypot(dx, dy)

        if (dist < shockRadius) {
          const t = 1 - dist / shockRadius
          const force = shockStrength * t * t
          const inv = dist > 0.0001 ? 1 / dist : 0
          d.vx += dx * inv * force
          d.vy += dy * inv * force
        }

        d.vx += (d.ox - d.x) * spring * dt
        d.vy += (d.oy - d.y) * spring * dt

        const resist = Math.max(1, resistance)
        d.vx *= damping * (1 - 0.12 / resist)
        d.vy *= damping * (1 - 0.12 / resist)

        d.x += d.vx
        d.y += d.vy

        const dmx = d.x - pointer.x
        const dmy = d.y - pointer.y
        const mouseDist = Math.hypot(dmx, dmy)
        const intensity = Math.max(0, 1 - mouseDist / proximity)

        ctx.fillStyle = intensity > 0.01 ? activeColor : baseColor
        ctx.globalAlpha = 0.28 + intensity * 0.72
        ctx.beginPath()
        ctx.arc(d.x, d.y, dotSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    setup()
    tick()

    window.addEventListener('resize', setup)
    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setup)
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [
    activeColor,
    baseColor,
    dotSize,
    gap,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
  ])

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
}

