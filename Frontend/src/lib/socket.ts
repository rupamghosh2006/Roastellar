import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roastellar.onrender.com'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function connectSocket(token?: string) {
  const s = getSocket()
  if (token) {
    s.auth = { token }
  }
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export interface MatchRoomEvents {
  join_match: { matchId: string; userId: string }
  leave_match: { matchId: string; userId: string }
  submit_roast: { matchId: string; userId: string; roast: string }
  cast_vote: { matchId: string; voterId: string; playerId: string }
  battle_result: { matchId: string; winnerId: string; payout: number }
  spectator_update: { matchId: string; count: number }
  chat_message: { matchId: string; userId: string; message: string; timestamp: string }
  prediction: { matchId: string; playerId: string; amount: number }
}

export function joinMatch(matchId: string, userId: string) {
  getSocket().emit('join_match', { matchId, userId })
}

export function leaveMatch(matchId: string, userId: string) {
  getSocket().emit('leave_match', { matchId, userId })
}

export function submitRoast(matchId: string, userId: string, roast: string) {
  getSocket().emit('submit_roast', { matchId, userId, roast })
}

export function castVote(matchId: string, voterId: string, playerId: string) {
  getSocket().emit('cast_vote', { matchId, voterId, playerId })
}

export function makePrediction(matchId: string, playerId: string, amount: number) {
  getSocket().emit('prediction', { matchId, playerId, amount })
}

export function sendChatMessage(matchId: string, userId: string, message: string) {
  getSocket().emit('chat_message', { matchId, userId, message })
}

export function onMatchResult(callback: (data: MatchRoomEvents['battle_result']) => void) {
  getSocket().on('battle_result', callback)
}

export function onSpectatorUpdate(callback: (data: MatchRoomEvents['spectator_update']) => void) {
  getSocket().on('spectator_update', callback)
}

export function onChatMessage(callback: (data: MatchRoomEvents['chat_message']) => void) {
  getSocket().on('chat_message', callback)
}

export function onRoastSubmitted(callback: (data: MatchRoomEvents['submit_roast']) => void) {
  getSocket().on('submit_roast', callback)
}

export function removeAllListeners() {
  if (socket) {
    socket.removeAllListeners()
  }
}