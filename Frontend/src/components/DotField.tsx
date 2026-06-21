'use client'

import { memo, useEffect, useRef } from 'react'

const TWO_PI = Math.PI * 2

type DotFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  dotRadius?: number
  dotSpacing?: number
  cursorRadius?: number
  cursorForce?: number
  bulgeOnly?: boolean
  bulgeStrength?: number
  glowRadius?: number
  sparkle?: boolean
  waveAmplitude?: number
  dotColor?: string
  glowColor?: string
}

type Dot = {
  ax: number
  ay: number
  sx: number
  sy: number
  vx: number
  vy: number
  x: number
  y: number
}

const DotField = memo(({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  dotColor = 'rgba(184, 138, 53, 0.32)',
  glowColor = '#120F17',
  ...rest
}: DotFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const glowRef = useRef<SVGCircleElement | null>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 })
  const rafRef = useRef<number | null>(null)
  const sizeRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 })
  const glowOpacity = useRef(0)
  const engagement = useRef(0)
  const propsRef = useRef({})
  propsRef.current = { dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, dotColor }
  const rebuildRef = useRef<null | (() => void)>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const glowEl = glowRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const canvasEl = canvas
    const context = ctx
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let resizeTimer: ReturnType<typeof setTimeout>

    function resize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(doResize, 100)
    }

    function doResize() {
      if (!canvasEl.parentElement) return
      const rect = canvasEl.parentElement.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      canvasEl.width = w * dpr
      canvasEl.height = h * dpr
      canvasEl.style.width = `${w}px`
      canvasEl.style.height = `${h}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      sizeRef.current = {
        w,
        h,
        offsetX: rect.left + window.scrollX,
        offsetY: rect.top + window.scrollY,
      }

      buildDots(w, h)
    }

    function buildDots(w: number, h: number) {
      const p = propsRef.current as DotFieldProps
      const step = (p.dotRadius ?? 1.5) + (p.dotSpacing ?? 14)
      const cols = Math.floor(w / step)
      const rows = Math.floor(h / step)
      const padX = (w % step) / 2
      const padY = (h % step) / 2
      const dots = new Array(rows * cols)
      let idx = 0

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2
          const ay = padY + row * step + step / 2
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay }
        }
      }
      dotsRef.current = dots
    }

    function onMouseMove(e: MouseEvent) {
      const s = sizeRef.current
      mouseRef.current.x = e.pageX - s.offsetX
      mouseRef.current.y = e.pageY - s.offsetY
    }

    function updateMouseSpeed() {
      const m = mouseRef.current
      const dx = m.prevX - m.x
      const dy = m.prevY - m.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      m.speed += (dist - m.speed) * 0.5
      if (m.speed < 0.001) m.speed = 0
      m.prevX = m.x
      m.prevY = m.y
    }

    const speedInterval = setInterval(updateMouseSpeed, 20)

    let frameCount = 0

    function tick() {
      frameCount++
      const dots = dotsRef.current
      const m = mouseRef.current
      const { w, h } = sizeRef.current
      const p = propsRef.current as DotFieldProps
      const len = dots.length
      const t = frameCount * 0.02

      const targetEngagement = Math.min(m.speed / 5, 1)
      engagement.current += (targetEngagement - engagement.current) * 0.06
      if (engagement.current < 0.001) engagement.current = 0
      const eng = engagement.current

      glowOpacity.current += (eng - glowOpacity.current) * 0.08

      if (glowEl) {
        glowEl.setAttribute('cx', String(m.x))
        glowEl.setAttribute('cy', String(m.y))
        glowEl.style.opacity = String(glowOpacity.current)
      }

      context.clearRect(0, 0, w, h)

      context.fillStyle = p.dotColor ?? 'rgba(184, 138, 53, 0.32)'

      const cr = p.cursorRadius ?? 500
      const crSq = cr * cr
      const rad = (p.dotRadius ?? 1.5) / 2
      const isBulge = p.bulgeOnly ?? true

      context.beginPath()

      for (let i = 0; i < len; i++) {
        const d = dots[i]
        const dx = m.x - d.ax
        const dy = m.y - d.ay
        const distSq = dx * dx + dy * dy

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq)
          if (isBulge) {
            const t2 = 1 - dist / cr
            const push = t2 * t2 * (p.bulgeStrength ?? 67) * eng
            const angle = Math.atan2(dy, dx)
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15
          } else {
            const angle = Math.atan2(dy, dx)
            const move = (500 / dist) * (m.speed * (p.cursorForce ?? 0.1))
            d.vx += Math.cos(angle) * -move
            d.vy += Math.sin(angle) * -move
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1
          d.sy += (d.ay - d.sy) * 0.1
        }

        if (!isBulge) {
          d.vx *= 0.9
          d.vy *= 0.9
          d.x = d.ax + d.vx
          d.y = d.ay + d.vy
          d.sx += (d.x - d.sx) * 0.1
          d.sy += (d.y - d.sy) * 0.1
        }

        let drawX = d.sx
        let drawY = d.sy
        if ((p.waveAmplitude ?? 0) > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * (p.waveAmplitude ?? 0)
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * (p.waveAmplitude ?? 0) * 0.5
        }

        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0
          if ((hash % 100) < 3) {
            context.moveTo(drawX + rad * 1.8, drawY)
            context.arc(drawX, drawY, rad * 1.8, 0, TWO_PI)
          } else {
            context.moveTo(drawX + rad, drawY)
            context.arc(drawX, drawY, rad, 0, TWO_PI)
          }
        } else {
          context.moveTo(drawX + rad, drawY)
          context.arc(drawX, drawY, rad, 0, TWO_PI)
        }
      }

      context.fill()

      rafRef.current = requestAnimationFrame(tick)
    }

    doResize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    rebuildRef.current = () => {
      const { w, h } = sizeRef.current
      if (w > 0 && h > 0) buildDots(w, h)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearInterval(speedInterval)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  useEffect(() => {
    rebuildRef.current?.()
  }, [dotRadius, dotSpacing])

  return (
    <div className="relative h-full w-full" {...rest}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={glowColor}
          style={{ opacity: 0, willChange: 'opacity' }}
        />
      </svg>
    </div>
  )
})

DotField.displayName = 'DotField'

export default DotField
