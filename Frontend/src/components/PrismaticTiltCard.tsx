'use client'

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useDeviceCapability } from '@/lib/hooks'

const KEYFRAMES_ID = 'pc-keyframes'

function clamp(v: number, min = 0, max = 100) {
  return Math.min(Math.max(v, min), max)
}

export default function PrismaticTiltCard({
  children,
  className = '',
  radius = 24,
}: {
  children: ReactNode
  className?: string
  radius?: number
}) {
  const { isTouchDevice } = useDeviceCapability()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(KEYFRAMES_ID)) return
    const style = document.createElement('style')
    style.id = KEYFRAMES_ID
    style.textContent = `
      @keyframes pc-holo-bg {
        0% { background-position: 0 var(--background-y), 0 0, center; }
        100% { background-position: 0 var(--background-y), 90% 90%, center; }
      }
    `
    document.head.appendChild(style)
  }, [])

  const rafRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0, moved: false })

  const setVarsFromXY = useCallback((x: number, y: number) => {
    const shell = shellRef.current
    const wrap = wrapRef.current
    if (!shell || !wrap) return
    const width = shell.clientWidth || 1
    const height = shell.clientHeight || 1
    const px = clamp((100 / width) * x)
    const py = clamp((100 / height) * y)
    const cx = px - 50
    const cy = py - 50

    wrap.style.setProperty('--pointer-x', `${px}%`)
    wrap.style.setProperty('--pointer-y', `${py}%`)
    wrap.style.setProperty('--background-x', `${35 + (px / 100) * 30}%`)
    wrap.style.setProperty('--background-y', `${35 + (py / 100) * 30}%`)
    wrap.style.setProperty('--rotate-x', `${-(cx / 6)}deg`)
    wrap.style.setProperty('--rotate-y', `${cy / 5}deg`)
    shell.style.transform = 'translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x))'
  }, [])

  const applyPointer = useCallback(() => {
    pointerRef.current.moved = false
    const shell = shellRef.current
    if (!shell) return
    const rect = shell.getBoundingClientRect()
    setVarsFromXY(pointerRef.current.x - rect.left, pointerRef.current.y - rect.top)
  }, [setVarsFromXY])

  useEffect(() => {
    const shell = shellRef.current
    if (!shell || isTouchDevice) return

    const handleMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX
      pointerRef.current.y = event.clientY
      if (!pointerRef.current.moved) {
        pointerRef.current.moved = true
        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(applyPointer)
      }
    }

    const handleEnter = () => {
      shell.style.transition = 'none'
      shell.classList.add('active')
    }

    const handleLeave = () => {
      shell.style.transition = 'transform 280ms ease'
      shell.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)'
      shell.classList.remove('active')
      const cx = (shell.clientWidth || 0) / 2
      const cy = (shell.clientHeight || 0) / 2
      setVarsFromXY(cx, cy)
    }

    const cx = (shell.clientWidth || 0) / 2
    const cy = (shell.clientHeight || 0) / 2
    setVarsFromXY(cx, cy)

    shell.addEventListener('pointerenter', handleEnter)
    shell.addEventListener('pointermove', handleMove)
    shell.addEventListener('pointerleave', handleLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      shell.removeEventListener('pointerenter', handleEnter)
      shell.removeEventListener('pointermove', handleMove)
      shell.removeEventListener('pointerleave', handleLeave)
    }
  }, [setVarsFromXY, applyPointer, isTouchDevice])

  const style = useMemo(
    () =>
      ({
        '--pointer-x': '50%',
        '--pointer-y': '50%',
        '--background-x': '50%',
        '--background-y': '50%',
        '--rotate-x': '0deg',
        '--rotate-y': '0deg',
      } as React.CSSProperties),
    []
  )

  return (
    <div ref={wrapRef} className={className} style={{ perspective: '500px', ...style }}>
      <div
        ref={shellRef}
        className="group relative h-full overflow-hidden"
        style={{ borderRadius: `${radius}px`, transition: 'transform 280ms ease', transform: 'translateZ(0)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: 'rgba(10,14,24,0.34)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background: 'rgba(184,197,255,0.14)',
            mixBlendMode: 'overlay',
          }}
        />
        <div className="relative z-[4] h-full">{children}</div>
      </div>
    </div>
  )
}
