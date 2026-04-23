'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Users, Send, Trophy, DollarSign, Copy, ExternalLink, ChevronLeft, Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Battle, User, getBattle, joinBattle, submitRoast, voteBattle, finalizeBattle } from '@/lib/api';
import { useSocket, onBattleUpdate, onVoteCast, onBattleResult } from '@/lib/socket';
import { formatAddress } from '@/lib/utils';

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [roastText, setRoastText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const matchId = parseInt(params.id as string);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [battleData, userData] = await Promise.all([
          getBattle(matchId),
          import('@/lib/api').then((m) => m.getMe()),
        ]);
        setBattle(battleData);
        setUser(userData);
      } catch (error) {
        console.error('Fetch error:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn, matchId, router]);

  useEffect(() => {
    const cleanupVote = onVoteCast((data) => {
      if (data.matchId === matchId) {
        setBattle((prev) =>
          prev
            ? {
                ...prev,
                votesPlayer1:
                  data.selectedPlayer === prev.player1
                    ? prev.votesPlayer1 + 1
                    : prev.votesPlayer1,
                votesPlayer2:
                  data.selectedPlayer === prev.player2
                    ? prev.votesPlayer2 + 1
                    : prev.votesPlayer2,
              }
            : null
        );
      }
    });

    const cleanupResult = onBattleResult((data) => {
      if (data.matchId === matchId) {
        setBattle((prev) => (prev ? { ...prev, status: data.status, winner: data.winner } : null));
        setShowResult(true);
      }
    });

    return () => {
      cleanupVote();
      cleanupResult();
    };
  }, [matchId]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const updated = await joinBattle(matchId);
      setBattle(updated);
    } catch (error) {
      console.error('Join error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmitRoast = async () => {
    if (!roastText.trim()) return;
    setIsSubmitting(true);
    try {
      await submitRoast(matchId, roastText);
      const updated = await getBattle(matchId);
      setBattle(updated);
      setRoastText('');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (player: string) => {
    setIsVoting(true);
    try {
      await voteBattle(matchId, player);
      const updated = await getBattle(matchId);
      setBattle(updated);
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleFinalize = async () => {
    try {
      const updated = await finalizeBattle(matchId);
      setBattle(updated);
      setShowResult(true);
    } catch (error) {
      console.error('Finalize error:', error);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPlayer1 = battle?.player1 === user?.id;
  const isPlayer2 = battle?.player2 === user?.id;
  const isPlayer = isPlayer1 || isPlayer2;
  const canSubmit = isPlayer && battle?.status === 'active';

  if (!isSignedIn || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-2 text-violet-400 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm">Battle #{matchId}</span>
              </div>
              <h1 className="text-2xl font-bold mb-4">{battle?.topic}</h1>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    battle?.status === 'open'
                      ? 'bg-green-500/20 text-green-400'
                      : battle?.status === 'active'
                      ? 'bg-blue-500/20 text-blue-400'
                      : battle?.status === 'ended'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {battle?.status}
                </span>
                <span className="text-muted-foreground">
                  {battle?.entryFee} XLM entry
                </span>
              </div>

              {battle?.status === 'open' && !battle.player2 && (
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join Battle'}
                </button>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-6 rounded-2xl border ${
                  isPlayer1
                    ? 'bg-gradient-to-br from-violet-900/30 to-blue-900/30 border-violet-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-blue-600" />
                  <div>
                    <div className="font-semibold">
                      {typeof battle?.player1 === 'object'
                        ? battle.player1?.username
                        : 'Player 1'}
                    </div>
                    {battle?.player1 === user?.id && (
                      <span className="text-xs text-violet-400">You</span>
                    )}
                  </div>
                </div>

                {battle?.roast1Cid ? (
                  <div className="p-3 rounded-xl bg-white/5 text-sm">
                    {battle.roast1Cid.slice(0, 50)}...
                  </div>
                ) : battle?.status === 'active' && isPlayer1 ? (
                  <div className="space-y-3">
                    <textarea
                      value={roastText}
                      onChange={(e) => setRoastText(e.target.value)}
                      placeholder="Write your roast..."
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleSubmitRoast}
                      disabled={isSubmitting || !roastText.trim()}
                      className="w-full py-2 rounded-xl bg-violet-600 font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Roast'}
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {battle?.status === 'active'
                      ? 'Waiting for roast...'
                      : 'Joined'}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-6 rounded-2xl border ${
                  isPlayer2
                    ? 'bg-gradient-to-br from-violet-900/30 to-blue-900/30 border-violet-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600" />
                  <div>
                    <div className="font-semibold">
                      {battle?.player2
                        ? typeof battle.player2 === 'object'
                          ? battle.player2.username
                          : 'Player 2'
                        : 'Waiting...'}
                    </div>
                    {battle?.player2 === user?.id && (
                      <span className="text-xs text-blue-400">You</span>
                    )}
                  </div>
                </div>

                {battle?.roast2Cid ? (
                  <div className="p-3 rounded-xl bg-white/5 text-sm">
                    {battle.roast2Cid.slice(0, 50)}...
                  </div>
                ) : battle?.status === 'active' && isPlayer2 ? (
                  <div className="space-y-3">
                    <textarea
                      value={roastText}
                      onChange={(e) => setRoastText(e.target.value)}
                      placeholder="Write your roast..."
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleSubmitRoast}
                      disabled={isSubmitting || !roastText.trim()}
                      className="w-full py-2 rounded-xl bg-blue-600 font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Roast'}
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {battle?.status === 'active'
                      ? 'Waiting for roast...'
                      : battle?.status === 'open'
                      ? 'Waiting for opponent...'
                      : 'Not joined'}
                  </div>
                )}
              </motion.div>
            </div>

            {battle?.status === 'active' && !battle.roast1Cid && !battle.roast2Cid && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                <p className="text-yellow-400">
                  Waiting for both players to submit roasts...
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <h3 className="font-semibold mb-4">Live Votes</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {typeof battle?.player1 === 'object'
                      ? battle.player1.username
                      : 'Player 1'}
                  </span>
                  <span className="font-bold">{battle?.votesPlayer1 || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {typeof battle?.player2 === 'object'
                      ? battle.player2.username
                      : 'Player 2'}
                  </span>
                  <span className="font-bold">{battle?.votesPlayer2 || 0}</span>
                </div>
              </div>

              {battle?.status === 'active' && !isPlayer && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => handleVote(battle.player1 as string)}
                    disabled={isVoting || selectedPlayer === battle.player1}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                  >
                    Vote Player 1
                  </button>
                  <button
                    onClick={() => handleVote(battle.player2 as string)}
                    disabled={isVoting || selectedPlayer === battle.player2}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                  >
                    Vote Player 2
                  </button>
                </div>
              )}
            </motion.div>

            {battle?.status === 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold">Prediction</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Predict the winner to earn rewards!
                </p>
                <button className="w-full py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 font-semibold">
                  Place Prediction
                </button>
              </motion.div>
            )}

            {isPlayer && battle?.status === 'active' && battle.roast1Cid && battle.roast2Cid && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleFinalize}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold"
              >
                Finalize & Declare Winner
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-violet-900 to-blue-900 border border-violet-500 text-center"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-bold mb-2">Battle Complete!</h2>
                <p className="text-muted-foreground mb-6">
                  {battle?.status === 'draw'
                    ? "It's a draw!"
                    : `Winner: ${battle?.winner}`}
                </p>
                <button
                  onClick={() => {
                    setShowResult(false);
                    router.push('/dashboard');
                  }}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}