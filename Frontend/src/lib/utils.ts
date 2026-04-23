import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const ONBOARDING_KEY = 'roastellar:onboarding-complete'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatXLM(amount: number | string): string {
  const parsed = typeof amount === 'string' ? Number(amount) : amount
  const safe = Number.isFinite(parsed) ? parsed : 0
  return safe.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  const diff = value.getTime() - Date.now()
  const abs = Math.abs(diff)
  const minutes = Math.floor(abs / 60000)
  const hours = Math.floor(abs / 3600000)
  const days = Math.floor(abs / 86400000)

  if (diff >= 0) {
    if (days > 0) return `in ${days}d`
    if (hours > 0) return `in ${hours}h`
    if (minutes > 0) return `in ${minutes}m`
    return 'soon'
  }

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function getExplorerUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`
}

export function getBattleRoomPath(id: string): string {
  return `/battle/${id}`
}

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function setOnboardingComplete(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ONBOARDING_KEY, 'true')
}

export const GAME_CONFIG = {
  flameTarget: 20,
  flameDuration: 15,
  flameSpawnRate: 650,
} as const
