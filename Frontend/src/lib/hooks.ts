'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { api, type Battle, type User, type Wallet } from './api'

export function useVisibilityPause() {
  const hiddenRef = useRef(document.hidden)

  useEffect(() => {
    const handler = () => { hiddenRef.current = document.hidden }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  return hiddenRef
}

export type QualityLevel = 'low' | 'medium' | 'high'

export type DeviceCapability = {
  isTouchDevice: boolean
  dprCap: number
  preferReducedMotion: boolean
  shouldReduceQuality: boolean
  qualityLevel: QualityLevel
}

export function useDeviceCapability(): DeviceCapability {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { isTouchDevice: false, dprCap: 2, preferReducedMotion: false, shouldReduceQuality: false, qualityLevel: 'high' }
    }
    const dpr = window.devicePixelRatio || 1
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion)').matches
    const cpuCores = navigator.hardwareConcurrency || 8
    const memory = (navigator as any).deviceMemory || 8

    const isLowEnd = isTouch && (dpr >= 3 || cpuCores <= 4 || memory <= 4)
    const isMidEnd = isTouch && !isLowEnd

    let qualityLevel: QualityLevel = 'high'
    let dprCap = 2
    if (reducedMotion) {
      qualityLevel = 'low'
      dprCap = 1
    } else if (isLowEnd) {
      qualityLevel = 'low'
      dprCap = 1
    } else if (isMidEnd) {
      qualityLevel = 'medium'
      dprCap = 1.5
    }

    return {
      isTouchDevice: isTouch,
      dprCap,
      preferReducedMotion: reducedMotion,
      shouldReduceQuality: qualityLevel !== 'high',
      qualityLevel,
    }
  }, [])
}

export function useSkipFrame(shouldReduce: boolean): () => boolean {
  const frameRef = useRef(0)
  return () => {
    frameRef.current++
    return shouldReduce && frameRef.current % 2 !== 0
  }
}

export function useUserProfile() {
  const { isSignedIn } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    api.get<User>('/api/users/me')
      .then((response) => setUser(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch user'))
      .finally(() => setLoading(false))
  }, [isSignedIn])

  return { user, loading, error }
}

export function useOpenBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBattles = () => {
      api.get<Battle[]>('/api/battles/open')
        .then((response) => setBattles(response.data))
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch battles'))
        .finally(() => setLoading(false))
    }

    fetchBattles()
    const interval = window.setInterval(fetchBattles, 12000)
    return () => window.clearInterval(interval)
  }, [])

  return { battles, loading, error }
}

export function useWalletInfo() {
  const { isSignedIn } = useUser()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    api.get<Wallet>('/api/wallet/me')
      .then((response) => setWallet(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch wallet'))
      .finally(() => setLoading(false))
  }, [isSignedIn])

  return { wallet, loading, error }
}
