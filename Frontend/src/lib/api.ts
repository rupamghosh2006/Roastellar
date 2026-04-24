import axios, { type AxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roastellar.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

export interface User {
  id: string
  clerkId: string
  username: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  xp: number
  wins: number
  losses: number
  rankPoints?: number
  totalBattles?: number
  walletAddress?: string | null
  walletBalance?: number | null
  badges: string[]
  rank?: number
  onboardingCompleted?: boolean
  createdAt: string
}

export type BattleStatus = 'open' | 'active' | 'voting' | 'ended' | 'draw' | 'cancelled'

export interface Battle {
  id: string
  matchId: number
  topic: string
  topicCid?: string
  status: BattleStatus
  creator?: User
  player1?: User
  player2?: User
  player1Wallet?: string
  player2Wallet?: string
  roast1?: string
  roast2?: string
  roast1Cid?: string
  roast2Cid?: string
  player1Votes: number
  player2Votes: number
  spectators: number
  entryFee: number
  winnerId?: string | null
  txHash?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
  expiresAt: string
  pot: number
}

export interface Prediction {
  id: string
  battleId: string
  predictorId: string
  selectedPlayer: string
  amount: number
  settled: boolean
  won: boolean
}

export interface PredictionSummary {
  matchId: number
  totalPredictions: number
  totalAmount: number
  onPlayer1: number
  onPlayer2: number
}

export interface Wallet {
  address: string
  publicKey: string
  balance: number
  funded: boolean
  createdAt?: string | null
  isNew?: boolean
}

export interface WalletCreateResult {
  alreadyExists: boolean
  fundingPending?: boolean
  wallet: Wallet
}

export interface WalletSecretExport {
  publicKey: string
  secretKey: string
  network: string
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
  email?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  avatar?: string
  xp?: number
  wins?: number
  losses?: number
  rankPoints?: number
  totalBattles?: number
  badges?: string[]
  walletPublicKey?: string
  walletAddress?: string
  walletFunded?: boolean
  onboardingCompleted?: boolean
  createdAt?: string
}

type BackendBattle = {
  id?: string
  _id?: string
  matchId?: number
  topic?: string
  topicCid?: string
  status?: BattleStatus
  creator?: BackendUser
  player1?: BackendUser
  player2?: BackendUser
  player1Wallet?: string
  player2Wallet?: string
  roast1?: string
  roast2?: string
  roast1Cid?: string
  roast2Cid?: string
  votesPlayer1?: number
  votesPlayer2?: number
  player1Votes?: number
  player2Votes?: number
  spectators?: number
  spectatorsCount?: number
  entryFee?: number
  winner?: string | BackendUser
  txHash?: string
  startedAt?: string
  endedAt?: string
  createdAt?: string
}

type BackendWallet = {
  publicKey?: string
  address?: string
  funded?: boolean
  balance?: number
  createdAt?: string | null
}

type BackendPrediction = {
  _id?: string
  battleId?: string
  predictor?: BackendUser | string
  selectedPlayer?: BackendUser | string
  amount?: number
  settled?: boolean
  won?: boolean
}

type BackendWalletSecretExport = {
  publicKey?: string
  secretKey?: string
  network?: string
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data as T
  }
  return payload as T
}

function authConfig(token?: string): AxiosRequestConfig {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

export function normalizeUser(user: BackendUser | null | undefined): User {
  return {
    id: user?.id ?? user?._id ?? '',
    clerkId: user?.clerkId ?? '',
    username: user?.username ?? 'Player',
    email: user?.email ?? null,
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    avatar: user?.avatar ?? user?.imageUrl ?? null,
    xp: user?.xp ?? 0,
    wins: user?.wins ?? 0,
    losses: user?.losses ?? 0,
    rankPoints: user?.rankPoints ?? 0,
    totalBattles: user?.totalBattles ?? 0,
    walletAddress: user?.walletAddress ?? user?.walletPublicKey ?? null,
    walletBalance: null,
    badges: user?.badges ?? [],
    onboardingCompleted: user?.onboardingCompleted ?? false,
    createdAt: user?.createdAt ?? new Date(0).toISOString(),
  }
}

export function normalizeWallet(wallet: BackendWallet | null | undefined): Wallet {
  const publicKey = wallet?.publicKey ?? wallet?.address ?? ''
  return {
    address: publicKey,
    publicKey,
    balance: wallet?.balance ?? 0,
    funded: Boolean(wallet?.funded),
    createdAt: wallet?.createdAt ?? null,
    isNew: false,
  }
}

function normalizeWalletCreateResult(payload: { alreadyExists?: boolean; fundingPending?: boolean; wallet?: BackendWallet } | null | undefined): WalletCreateResult {
  return {
    alreadyExists: Boolean(payload?.alreadyExists),
    fundingPending: Boolean(payload?.fundingPending),
    wallet: normalizeWallet(payload?.wallet),
  }
}

function normalizeWalletSecretExport(payload: BackendWalletSecretExport | null | undefined): WalletSecretExport {
  return {
    publicKey: payload?.publicKey ?? '',
    secretKey: payload?.secretKey ?? '',
    network: payload?.network ?? 'TESTNET',
  }
}

export function normalizeLeaderboard(entries: BackendUser[] | null | undefined): LeaderboardEntry[] {
  const safe = Array.isArray(entries) ? entries : []
  return safe.map((entry, index) => {
    const user = normalizeUser(entry)
    const total = user.wins + user.losses
    return {
      ...user,
      rank: user.rank ?? index + 1,
      winRate: total > 0 ? (user.wins / total) * 100 : 0,
    }
  })
}

export function normalizeBattle(battle: BackendBattle | null | undefined): Battle {
  const winnerId = typeof battle?.winner === 'string'
    ? battle?.winner
    : battle?.winner && typeof battle.winner === 'object'
    ? (battle.winner.id ?? battle.winner._id ?? null)
    : null

  const entryFee = Number(battle?.entryFee ?? 0)
  const hasSecondPlayer = Boolean(battle?.player2)
  const pot = entryFee > 0 ? entryFee * (hasSecondPlayer ? 2 : 1) : 0

  return {
    id: String(battle?.id ?? battle?._id ?? battle?.matchId ?? ''),
    matchId: Number(battle?.matchId ?? 0),
    topic: battle?.topic ?? 'Roast Battle',
    topicCid: battle?.topicCid ?? '',
    status: battle?.status ?? 'open',
    creator: battle?.creator ? normalizeUser(battle.creator) : undefined,
    player1: battle?.player1 ? normalizeUser(battle.player1) : undefined,
    player2: battle?.player2 ? normalizeUser(battle.player2) : undefined,
    player1Wallet: battle?.player1Wallet ?? '',
    player2Wallet: battle?.player2Wallet ?? '',
    roast1: battle?.roast1 ?? '',
    roast2: battle?.roast2 ?? '',
    roast1Cid: battle?.roast1Cid ?? '',
    roast2Cid: battle?.roast2Cid ?? '',
    player1Votes: Number(battle?.player1Votes ?? battle?.votesPlayer1 ?? 0),
    player2Votes: Number(battle?.player2Votes ?? battle?.votesPlayer2 ?? 0),
    spectators: Number(battle?.spectators ?? battle?.spectatorsCount ?? 0),
    entryFee,
    winnerId,
    txHash: battle?.txHash ?? '',
    startedAt: battle?.startedAt,
    endedAt: battle?.endedAt,
    createdAt: battle?.createdAt ?? new Date(0).toISOString(),
    expiresAt: battle?.endedAt ?? battle?.startedAt ?? battle?.createdAt ?? new Date(0).toISOString(),
    pot,
  }
}

export function normalizeBattleList(battles: BackendBattle[] | null | undefined): Battle[] {
  return Array.isArray(battles) ? battles.map(normalizeBattle) : []
}

export function normalizePrediction(prediction: BackendPrediction | null | undefined): Prediction {
  const predictorId = typeof prediction?.predictor === 'string'
    ? prediction.predictor
    : prediction?.predictor?.id ?? prediction?.predictor?._id ?? ''
  const selectedPlayer = typeof prediction?.selectedPlayer === 'string'
    ? prediction.selectedPlayer
    : prediction?.selectedPlayer?.id ?? prediction?.selectedPlayer?._id ?? ''

  return {
    id: String(prediction?._id ?? ''),
    battleId: String(prediction?.battleId ?? ''),
    predictorId,
    selectedPlayer,
    amount: Number(prediction?.amount ?? 0),
    settled: Boolean(prediction?.settled),
    won: Boolean(prediction?.won),
  }
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
    me: (token?: string) => getAndNormalize(api.get<BackendUser>('/api/users/me', authConfig(token)), normalizeUser),
    leaderboard: () => getAndNormalize(api.get<BackendUser[]>('/api/leaderboard'), normalizeLeaderboard),
    updateProfile: (payload: Partial<User>, token?: string) =>
      getAndNormalize(api.patch<BackendUser>('/api/users/me', payload, authConfig(token)), normalizeUser),
  },
  leaderboard: {
    list: () => getAndNormalize(api.get<BackendUser[]>('/api/leaderboard'), normalizeLeaderboard),
  },
  battles: {
    open: () =>
      getAndNormalize(api.get<BackendBattle[]>('/api/battles/open'), normalizeBattleList),
    create: (payload: { topic: string; entryFee: number }, token?: string) =>
      getAndNormalize(api.post<BackendBattle>('/api/battles/create', payload, authConfig(token)), normalizeBattle),
    join: (matchId: number | string, token?: string) =>
      getAndNormalize(api.post<BackendBattle>(`/api/battles/join/${matchId}`, undefined, authConfig(token)), normalizeBattle),
    submitRoast: (matchId: number | string, text: string, token?: string) =>
      getAndNormalize(api.post<BackendBattle>(`/api/battles/submit-roast/${matchId}`, { text }, authConfig(token)), normalizeBattle),
    vote: (matchId: number | string, payload: { selectedPlayer: string }, token?: string) =>
      getAndNormalize(api.post<BackendBattle>(`/api/battles/vote/${matchId}`, payload, authConfig(token)), normalizeBattle),
    finalize: (matchId: number | string, token?: string) =>
      getAndNormalize(api.post<BackendBattle>(`/api/battles/finalize/${matchId}`, undefined, authConfig(token)), normalizeBattle),
    cancel: (matchId: number | string, token?: string) =>
      getAndNormalize(api.post<BackendBattle>(`/api/battles/cancel/${matchId}`, undefined, authConfig(token)), normalizeBattle),
    get: (matchId: number | string) =>
      getAndNormalize(api.get<BackendBattle>(`/api/battles/${matchId}`), normalizeBattle),
  },
  predictions: {
    place: (matchId: number | string, payload: { selectedPlayer: string; amount: number }, token?: string) =>
      getAndNormalize(api.post<BackendPrediction>(`/api/predictions/place/${matchId}`, payload, authConfig(token)), normalizePrediction),
    summary: (matchId: number | string) =>
      getAndNormalize(
        api.get<{ summary: PredictionSummary; predictions: BackendPrediction[] }>(`/api/predictions/${matchId}`),
        (payload) => ({
          summary: payload?.summary || { matchId: Number(matchId), totalPredictions: 0, totalAmount: 0, onPlayer1: 0, onPlayer2: 0 },
          predictions: Array.isArray(payload?.predictions) ? payload.predictions.map(normalizePrediction) : [],
        })
      ),
  },
  wallet: {
    create: (token?: string) =>
      getAndNormalize(
        api.post<{ alreadyExists?: boolean; fundingPending?: boolean; wallet?: BackendWallet }>(
          '/api/wallet/create',
          undefined,
          authConfig(token)
        ),
        normalizeWalletCreateResult
      ),
    me: (token?: string) => getAndNormalize(api.get<BackendWallet>('/api/wallet/me', authConfig(token)), normalizeWallet),
    refundTest: (token?: string) => getAndNormalize(api.post<BackendWallet>('/api/wallet/refund-test', undefined, authConfig(token)), normalizeWallet),
    exportSecret: (token?: string) =>
      getAndNormalize(api.post<BackendWalletSecretExport>('/api/wallet/export-secret', undefined, authConfig(token)), normalizeWalletSecretExport),
  },
}
