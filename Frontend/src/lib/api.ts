import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roastellar.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in'
      }
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  clerkId: string
  username: string
  avatar?: string
  xp: number
  wins: number
  losses: number
  walletAddress?: string
  walletBalance?: number
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

export interface Prediction {
  battleId: string
  playerId: string
  amount: number
  claimed: boolean
}

export interface MatchEvent {
  type: 'join_match' | 'submit_roast' | 'cast_vote' | 'battle_result' | 'spectator_update' | 'chat_message'
  payload: Record<string, unknown>
  timestamp: string
}

export const apiRoutes = {
  users: {
    me: () => api.get<User>('/api/users/me'),
    leaderboard: () => api.get<LeaderboardEntry[]>('/api/users/leaderboard'),
    updateProfile: (data: Partial<User>) => api.patch<User>('/api/users/me', data),
  },
  battles: {
    open: () => api.get<Battle[]>('/api/battles/open'),
    create: (data: { topic: string; stakeAmount?: number }) => api.post<Battle>('/api/battles/create', data),
    join: (id: string) => api.post<Battle>(`/api/battles/join/${id}`),
    vote: (id: string, data: { playerId: string }) => api.post<Battle>(`/api/battles/vote/${id}`, data),
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