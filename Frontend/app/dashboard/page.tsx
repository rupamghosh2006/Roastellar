'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Trophy, Wallet, Zap, Users, Sword, Crown, ChevronRight, Plus, UsersRound, ArrowUpRight, UserPlus, Gamepad2, Target, DollarSign } from 'lucide-react';
import { getMe, getOpenBattles, getLeaderboard, Battle, User } from '@/lib/api';
import { formatNumber, formatXLM } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, battlesData, leaderboardData] = await Promise.all([
          getMe(),
          getOpenBattles(),
          getLeaderboard(),
        ]);
        setUser(userData);
        setBattles(battlesData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  if (!isSignedIn || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Rank', value: '#12', icon: Crown, color: 'from-yellow-500 to-amber-500' },
    { label: 'XP', value: formatNumber(user?.xp || 0), icon: Zap, color: 'from-violet-500 to-purple-500' },
    { label: 'Wins', value: user?.wins || 0, icon: Trophy, color: 'from-green-500 to-emerald-500' },
    { label: 'Balance', value: formatXLM(10000), icon: Wallet, color: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.username || 'Roaster'}</span>
          </h1>
          <p className="text-muted-foreground">
            Ready to rule the arena?
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/battle/create"
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group"
                >
                  <Sword className="w-8 h-8 text-violet-400 mb-3" />
                  <div className="font-semibold mb-1">Create Battle</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground">
                    Start a new roast battle
                  </div>
                </Link>
                <Link
                  href="/battles"
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group"
                >
                  <UsersRound className="w-8 h-8 text-blue-400 mb-3" />
                  <div className="font-semibold mb-1">Join Battle</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground">
                    Find open matches
                  </div>
                </Link>
                <Link
                  href="/leaderboard"
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group"
                >
                  <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
                  <div className="font-semibold mb-1">Leaderboard</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground">
                    Top roasters
                  </div>
                </Link>
                <Link
                  href="/wallet"
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group"
                >
                  <Wallet className="w-8 h-8 text-green-400 mb-3" />
                  <div className="font-semibold mb-1">Wallet</div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground">
                    View balance
                  </div>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Open Battles</h2>
                <Link
                  href="/battles"
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {battles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <UsersRound className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No open battles yet</p>
                  <Link
                    href="/battle/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4" /> Create Battle
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {battles.slice(0, 5).map((battle) => (
                    <Link
                      key={battle.id}
                      href={`/battle/${battle.matchId}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{battle.topic}</div>
                        <div className="text-sm text-muted-foreground">
                          {battle.entryFee} XLM entry
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Top Roasters</h2>
              <Link
                href="/leaderboard"
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                View All
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              {leaderboard.slice(0, 5).map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
                >
                  <div
                    className={`w-6 text-center ${
                      i === 0
                        ? 'text-yellow-400'
                        : i === 1
                        ? 'text-gray-300'
                        : i === 2
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600" />
                  <div className="flex-1">{u.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {u.xp.toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}