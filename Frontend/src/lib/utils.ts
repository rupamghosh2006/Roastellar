import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatXLM(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export const STELLAR_EXPLORER_URL = 'https://stellar.expert/explorer/testnet'
export const STELLAR_TESTNET_URL = 'https://horizon-testnet.stellar.org'

export function getExplorerUrl(address: string): string {
  return `${STELLAR_EXPLORER_URL}/account/${address}`
}

export const API_ROUTES = {
  users: {
    me: '/api/users/me',
    leaderboard: '/api/users/leaderboard',
  },
  battles: {
    open: '/api/battles/open',
    create: '/api/battles/create',
    join: (id: string) => `/api/battles/join/${id}`,
    vote: (id: string) => `/api/battles/vote/${id}`,
    finalize: (id: string) => `/api/battles/finalize/${id}`,
    byId: (id: string) => `/api/battles/${id}`,
  },
  wallet: {
    me: '/api/wallet/me',
  },
} as const

export const GAME_CONFIG = {
  flameTarget: 20,
  flameDuration: 15,
  flameSpawnRate: 800,
  comboMultiplier: 0.1,
} as const

export const CLAIMABLE_BALANCE_ID = 'roastellar-onboarding-reward'