export interface OnboardingState {
  step: 1 | 2 | 3
  gameScore: number
  walletAddress: string
  walletBalance: number
}

export interface GameState {
  score: number
  combo: number
  timeRemaining: number
  isGameActive: boolean
  targetScore: number
}

export interface BattleStats {
  rank: number
  xp: number
  wins: number
  walletBalance: number
}
