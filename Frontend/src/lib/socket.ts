'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const useSocket = (token?: string) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  return { socket, isConnected };
};

export const emitJoinLobby = () => socket?.emit('join_lobby');
export const emitJoinMatch = (matchId: number) => socket?.emit('join_match', { matchId });
export const emitLeaveMatch = (matchId: number) => socket?.emit('leave_match', { matchId });
export const emitSubmitRoast = (matchId: number, roastCid: string) => 
  socket?.emit('submit_roast', { matchId, roastCid });
export const emitCastVote = (matchId: number, selectedPlayer: string) => 
  socket?.emit('cast_vote', { matchId, selectedPlayer });
export const emitPlacePrediction = (matchId: number, selectedPlayer: string, amount: number) =>
  socket?.emit('place_prediction', { matchId, selectedPlayer, amount });

export const onBattleUpdate = (callback: (battle: any) => void) => {
  socket?.on('battle_updated', callback);
  return () => socket?.off('battle_updated', callback);
};

export const onMatchJoined = (callback: (data: any) => void) => {
  socket?.on('match_joined', callback);
  return () => socket?.off('match_joined', callback);
};

export const onMatchStarted = (callback: (data: any) => void) => {
  socket?.on('match_started', callback);
  return () => socket?.off('match_started', callback);
};

export const onRoastSubmitted = (callback: (data: any) => void) => {
  socket?.on('roast_submitted', callback);
  return () => socket?.off('roast_submitted', callback);
};

export const onVoteCast = (callback: (data: any) => void) => {
  socket?.on('vote_cast', callback);
  return () => socket?.off('vote_cast', callback);
};

export const onBattleResult = (callback: (data: any) => void) => {
  socket?.on('battle_result', callback);
  return () => socket?.off('battle_result', callback);
};

export const onUsersOnline = (callback: (data: { count: number }) => void) => {
  socket?.on('users_online', callback);
  return () => socket?.off('users_online', callback);
};

export const onLeaderboard = (callback: (data: any) => void) => {
  socket?.on('leaderboard', callback);
  return () => socket?.off('leaderboard', callback);
};