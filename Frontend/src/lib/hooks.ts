'use client'

import { useCallback, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import api from './api'
import { User, Battle, WalletInfo } from './api'

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

    const fetchUser = async () => {
      try {
        const data = await api.get<{ data: User }>('/users/me')
        setUser(data.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isSignedIn])

  return { user, loading, error }
}

export function useOpenBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const data = await api.get<{ data: Battle[] }>('/battles/open')
        setBattles(data.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch battles')
      } finally {
        setLoading(false)
      }
    }

    fetchBattles()
    const interval = setInterval(fetchBattles, 5000)
    return () => clearInterval(interval)
  }, [])

  return { battles, loading, error }
}

export function useWalletInfo() {
  const { isSignedIn } = useUser()
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    const fetchWallet = async () => {
      try {
        const data = await api.get<{ data: WalletInfo }>('/wallet/me')
        setWallet(data.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wallet')
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [isSignedIn])

  return { wallet, loading, error }
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.get<{ data: User[] }>('/users/leaderboard')
        setLeaderboard(data.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return { leaderboard, loading, error }
}
