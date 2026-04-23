'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { api, type Battle, type User, type Wallet } from './api'

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
