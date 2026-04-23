import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Auth not available in this context
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  walletPublicKey?: string;
  xp: number;
  wins: number;
  losses: number;
  rankPoints: number;
  badges: string[];
  profileCid: string;
  role: string;
  createdAt: string;
}

export interface Battle {
  id: string;
  matchId: number;
  creator: string;
  player1: User | string;
  player2: User | string | null;
  topic: string;
  topicCid: string;
  roast1Cid: string;
  roast2Cid: string;
  votesPlayer1: number;
  votesPlayer2: number;
  status: 'open' | 'active' | 'ended' | 'draw';
  winner: User | string | null;
  entryFee: number;
  startedAt?: string;
  endedAt?: string;
  txHash?: string;
  createdAt: string;
}

export interface WalletInfo {
  publicKey: string;
  balance: number;
}

// Auth
export const login = async (idToken: string) => {
  const { data } = await api.post('/auth/login', { idToken });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/users/me');
  return data.data;
};

export const updateProfile = async (updates: Partial<User>) => {
  const { data } = await api.patch('/users/me', updates);
  return data.data;
};

export const getLeaderboard = async (type = 'xp') => {
  const { data } = await api.get(`/users/leaderboard?type=${type}`);
  return data.data;
};

// Battles
export const createBattle = async (topic: string, entryFee: number, topicCid?: string) => {
  const { data } = await api.post('/battles/create', { topic, entryFee, topicCid });
  return data.data;
};

export const getOpenBattles = async () => {
  const { data } = await api.get('/battles/open');
  return data.data as Battle[];
};

export const getBattle = async (matchId: number) => {
  const { data } = await api.get(`/battles/${matchId}`);
  return data.data as Battle;
};

export const joinBattle = async (matchId: number) => {
  const { data } = await api.post(`/battles/join/${matchId}`);
  return data.data;
};

export const submitRoast = async (matchId: number, roastCid: string) => {
  const { data } = await api.post(`/battles/submit-roast/${matchId}`, { roastCid });
  return data.data;
};

export const voteBattle = async (matchId: number, selectedPlayer: string) => {
  const { data } = await api.post(`/battles/vote/${matchId}`, { selectedPlayer });
  return data.data;
};

export const finalizeBattle = async (matchId: number) => {
  const { data } = await api.post(`/battles/finalize/${matchId}`);
  return data.data;
};

// Wallet
export const getWallet = async (): Promise<WalletInfo> => {
  const { data } = await api.get('/wallet/me');
  return data.data;
};

export const airdrop = async (amount = 10000) => {
  const { data } = await api.post('/wallet/airdrop', { amount });
  return data.data;
};

// Uploads
export const uploadToIPFS = async (data: object) => {
  const { data: result } = await api.post('/uploads/ipfs', { data });
  return result.data.cid as string;
};

export default api;
