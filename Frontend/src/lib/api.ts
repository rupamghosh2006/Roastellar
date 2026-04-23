import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roastellar.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
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

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

type BackendUser = {
  id?: string
  _id?: string
  clerkId?: string
  username?: string
  imageUrl?: string
  avatar?: string
  xp?: number
  wins?: number
  losses?: number
  badges?: string[]
  walletPublicKey?: string
  walletAddress?: string
  createdAt?: string
}

type BackendBattle = {
  id?: string
  _id?: string
  matchId?: number
  topic?: string
  status?: string
  player1?: BackendUser
  player2?: BackendUser
  roast1Cid?: string
  roast2Cid?: string
  player1Roast?: string
  player2Roast?: string
  votesPlayer1?: number
  votesPlayer2?: number
  player1Votes?: number
  player2Votes?: number
  winner?: string
  winnerId?: string
  entryFee?: number
  pot?: number
  fee?: number
  createdAt?: string
  expiresAt?: string
  endedAt?: string
  spectators?: number
}

function normalizeUser(user: BackendUser | null | undefined): User {
  return {
    id: user?.id ?? user?._id ?? '',
    clerkId: user?.clerkId ?? '',
    username: user?.username ?? 'Player',
    avatar: user?.avatar ?? user?.imageUrl ?? null,
    xp: user?.xp ?? 0,
    wins: user?.wins ?? 0,
    losses: user?.losses ?? 0,
    walletAddress: user?.walletAddress ?? user?.walletPublicKey ?? null,
    walletBalance: null,
    badges: user?.badges ?? [],
    createdAt: user?.createdAt ?? new Date(0).toISOString(),
  }
}

function normalizeLeaderboard(entries: BackendUser[] | null | undefined): LeaderboardEntry[] {
  const safeEntries = Array.isArray(entries) ? entries : []
  return safeEntries.map((entry, index) => {
    const user = normalizeUser(entry)
    const matches = user.wins + user.losses
    return {
      ...user,
      rank: index + 1,
      winRate: matches > 0 ? (user.wins / matches) * 100 : 0,
    }
  })
}

function normalizeBattle(battle: BackendBattle | null | undefined): Battle {
  const status = battle?.status === 'ended' ? 'completed' : battle?.status === 'draw' ? 'completed' : (battle?.status as Battle['status'] | undefined)
  const pot = typeof battle?.pot === 'number'
    ? battle.pot
    : typeof battle?.entryFee === 'number'
    ? battle.entryFee * (battle?.player2 ? 2 : 1)
    : 0

  return {
    id: battle?.id ?? battle?._id ?? String(battle?.matchId ?? ''),
    topic: battle?.topic ?? 'Roast Battle',
    status: status ?? 'open',
    player1: battle?.player1 ? normalizeUser(battle.player1) : undefined,
    player2: battle?.player2 ? normalizeUser(battle.player2) : undefined,
    player1Roast: battle?.player1Roast ?? battle?.roast1Cid,
    player2Roast: battle?.player2Roast ?? battle?.roast2Cid,
    player1Votes: battle?.player1Votes ?? battle?.votesPlayer1 ?? 0,
    player2Votes: battle?.player2Votes ?? battle?.votesPlayer2 ?? 0,
    winnerId: battle?.winnerId ?? battle?.winner,
    pot,
    fee: battle?.fee ?? 0,
    createdAt: battle?.createdAt ?? new Date(0).toISOString(),
    expiresAt: battle?.expiresAt ?? battle?.endedAt ?? battle?.createdAt ?? new Date(0).toISOString(),
    spectators: battle?.spectators ?? 0,
  }
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data as T
  }
  return payload as T
}

async function getAndNormalize<TOutput, TInput = TOutput>(
  request: Promise<{ data: TInput | ApiEnvelope<TInput> }>,
  normalize: (value: TInput) => TOutput
): Promise<{ data: TOutput }> {
  const response = await request
  return { data: normalize(unwrapData(response.data)) }
}

export const apiRoutes = {
  users: {
    me: () => getAndNormalize(api.get<BackendUser>('/api/users/me'), normalizeUser),
    leaderboard: () => getAndNormalize(api.get<BackendUser[]>('/api/users/leaderboard'), normalizeLeaderboard),
    updateProfile: (payload: Partial<User>) => getAndNormalize(api.patch<BackendUser>('/api/users/me', payload), normalizeUser),
  },
  battles: {
    open: () => getAndNormalize(api.get<BackendBattle[]>('/api/battles/open'), (battles) => (Array.isArray(battles) ? battles.map(normalizeBattle) : [])),
    create: (payload: { topic: string; stakeAmount?: number }) => getAndNormalize(api.post<BackendBattle>('/api/battles/create', payload), normalizeBattle),
    join: (id: string) => getAndNormalize(api.post<BackendBattle>(`/api/battles/join/${id}`), normalizeBattle),
    vote: (id: string, payload: { playerId: string }) => getAndNormalize(api.post<BackendBattle>(`/api/battles/vote/${id}`, payload), normalizeBattle),
    finalize: (id: string) => getAndNormalize(api.post<BackendBattle>(`/api/battles/finalize/${id}`), normalizeBattle),
    get: (id: string) => getAndNormalize(api.get<BackendBattle>(`/api/battles/${id}`), normalizeBattle),
  },
  wallet: {
    me: () => api.get<Wallet>('/api/wallet/me'),
  },
  onboarding: {
    complete: () => api.post('/api/users/onboarding-complete'),
  },
}
