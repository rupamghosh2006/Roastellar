import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roastellar.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export interface User {
  id: string
  clerkId: string
  username: string
  avatar?: string | null
  xp: number
  wins: number
  losses: number
  walletAddress?: string | null
  walletBalance?: number | null
  badges: string[]
  rank?: number
  createdAt: string
}

export interface Battle {
  id: string
  topic: string
  status: 'open' | 'active' | 'completed'
  player1?: User
  player2?: User
  player1Roast?: string
  player2Roast?: string
  player1Votes: number
  player2Votes: number
  winnerId?: string
  pot: number
  fee: number
  createdAt: string
  expiresAt: string
  spectators: number
}

export interface Wallet {
  address: string
  balance: number
  isNew: boolean
}

export interface LeaderboardEntry extends User {
  rank: number
  winRate: number
}

export const apiRoutes = {
  users: {
    me: () => api.get<User>('/api/users/me'),
    leaderboard: () => api.get<LeaderboardEntry[]>('/api/users/leaderboard'),
    updateProfile: (payload: Partial<User>) => api.patch<User>('/api/users/me', payload),
  },
  battles: {
    open: () => api.get<Battle[]>('/api/battles/open'),
    create: (payload: { topic: string; stakeAmount?: number }) => api.post<Battle>('/api/battles/create', payload),
    join: (id: string) => api.post<Battle>(`/api/battles/join/${id}`),
    vote: (id: string, payload: { playerId: string }) => api.post<Battle>(`/api/battles/vote/${id}`, payload),
    finalize: (id: string) => api.post<Battle>(`/api/battles/finalize/${id}`),
    get: (id: string) => api.get<Battle>(`/api/battles/${id}`),
  },
  wallet: {
    me: () => api.get<Wallet>('/api/wallet/me'),
  },
  onboarding: {
    complete: () => api.post('/api/users/onboarding-complete'),
  },
}
