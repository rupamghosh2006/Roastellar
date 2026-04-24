import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roastellar.onrender.com'

let socket: Socket | null = null

function ensureSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['polling', 'websocket'],
      reconnection: true,
      timeout: 12000,
    })
  }
  return socket
}

export function connectSocket(token: string) {
  const s = ensureSocket()
  s.auth = { token }
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function getSocket() {
  return ensureSocket()
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinLobby() {
  ensureSocket().emit('join_lobby')
}

export function joinBattle(matchId: number) {
  ensureSocket().emit('join_battle', { matchId })
}

export function leaveBattle(matchId: number) {
  ensureSocket().emit('leave_battle', { matchId })
}

export function emitStartMatch(matchId: number) {
  ensureSocket().emit('start_match', { matchId })
}

export function emitSubmitRoast(matchId: number, text: string) {
  ensureSocket().emit('submit_roast', { matchId, text })
}

export function emitCastVote(matchId: number, selectedPlayer: string) {
  ensureSocket().emit('cast_vote', { matchId, selectedPlayer })
}

export function emitPlacePrediction(matchId: number, selectedPlayer: string, amount: number) {
  ensureSocket().emit('place_prediction', { matchId, selectedPlayer, amount })
}

export function onOpenBattlesUpdated(handler: (payload: any) => void) {
  ensureSocket().on('open_battles_updated', handler)
}

export function onPlayerJoined(handler: (payload: any) => void) {
  ensureSocket().on('player_joined', handler)
}

export function onBattleStarted(handler: (payload: any) => void) {
  ensureSocket().on('battle_started', handler)
}

export function onRoastSubmitted(handler: (payload: any) => void) {
  ensureSocket().on('roast_submitted', handler)
}

export function onVotingStarted(handler: (payload: any) => void) {
  ensureSocket().on('voting_started', handler)
}

export function onVoteUpdate(handler: (payload: any) => void) {
  ensureSocket().on('vote_update', handler)
}

export function onSpectatorCount(handler: (payload: any) => void) {
  ensureSocket().on('spectator_count', handler)
}

export function onCountdownTick(handler: (payload: any) => void) {
  ensureSocket().on('countdown_tick', handler)
}

export function onBattleResult(handler: (payload: any) => void) {
  ensureSocket().on('battle_result', handler)
}

export function onLeaderboardUpdated(handler: (payload: any) => void) {
  ensureSocket().on('leaderboard_updated', handler)
}

export function onErrorMessage(handler: (payload: any) => void) {
  ensureSocket().on('error_message', handler)
}

export function removeAllSocketListeners() {
  if (socket) {
    socket.removeAllListeners()
  }
}
