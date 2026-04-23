'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Users, Zap, Flame, ArrowRight } from 'lucide-react';
import { getLeaderboard, User } from '@/lib/api';
import { getRankEmoji, getRankColor } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState<'xp' | 'wins'>('xp');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(type);
        setUsers(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const top3 = users.slice(0, 3);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
            <p className="text-muted-foreground">Top roasters ranked by {type}</p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setType('xp')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  type === 'xp'
                    ? 'bg-violet-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                XP
              </button>
              <button
                onClick={() => setType('wins')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  type === 'wins'
                    ? 'bg-violet-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Wins
              </button>
            </div>
          </motion.div>

          {top3.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center items-end gap-4 mb-12"
            >
              {[top3[1], top3[0], top3[2]].map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`text-center ${
                    i === 1 ? 'order-first -translate-y-4' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">{MEDALS[i]}</div>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-2">
                    <Users className="w-10 h-10" />
                  </div>
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {type === 'xp'
                      ? `${user.xp.toLocaleString()} XP`
                      : `${user.wins} wins`}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
          >
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.02 }}
                className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-0 ${
                  i < 3 ? 'bg-white/5' : ''
                }`}
              >
                <div
                  className={`w-8 font-bold ${
                    i === 0
                      ? 'text-yellow-400'
                      : i === 1
                      ? 'text-gray-300'
                      : i === 2
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">{user.username}</div>
                  {user.badges?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {user.badges.slice(0, 3).map((badge, j) => (
                        <span key={j} className="text-xs">
                          {badge === 'FirstWin' ? '🏆' : badge === 'FiveWins' ? '⭐' : '🎖️'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {type === 'xp'
                      ? user.xp.toLocaleString()
                      : user.wins}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {type === 'xp' ? 'XP' : 'wins'}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}