'use client'

import { useEffect, useState, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Swords, Users, Clock, Send, Trophy, X } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes } from '@/lib/api'
import { getSocket, joinMatch, leaveMatch, submitRoast, castVote, onMatchResult, onSpectatorUpdate, removeAllListeners } from '@/lib/socket'
import type { Battle, User } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function BattleRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { userId } = useAuth()
  const router = useRouter()
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roast, setRoast] = useState('')
  const [spectators, setSpectators] = useState(0)
  const [showWinner, setShowWinner] = useState(false)
  const [winner, setWinner] = useState<User | null>(null)

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const response = await apiRoutes.battles.get(id)
        setBattle(response.data)
        if (userId) {
          joinMatch(id, userId)
        }
      } catch (error) {
        console.error('Failed to fetch battle:', error)
        router.push('/battles')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBattle()

    const socket = getSocket()
    socket.connect()

    onMatchResult((data) => {
      if (data.matchId === id) {
        setShowWinner(true)
        setWinner(data.winnerId === battle?.player1?.id ? battle?.player1 : battle?.player2)
      }
    })

    onSpectatorUpdate((data) => {
      if (data.matchId === id) {
        setSpectators(data.count)
      }
    })

    return () => {
      if (userId) {
        leaveMatch(id, userId)
      }
      removeAllListeners()
    }
  }, [id, userId, router, battle?.player1?.id, battle?.player2?.id])

  const handleSubmitRoast = async () => {
    if (!roast.trim() || !userId) return
    submitRoast(id, userId, roast)
    setRoast('')
    if (battle) {
      setBattle({
        ...battle,
        player1Roast: battle.player1?.id === userId ? roast : battle.player1Roast,
        player2Roast: battle.player2?.id === userId ? roast : battle.player2Roast,
      })
    }
  }

  const handleVote = async (playerId: string) => {
    if (!userId) return
    castVote(id, userId, playerId)
    try {
      const response = await apiRoutes.battles.vote(id, { playerId })
      setBattle(response.data)
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <PageLoader />
        </main>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="flex min-h-screen pt-16 items-center justify-center">
        <p className="text-white/60">Battle not found</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Swords className="w-6 h-6 text-primary" />
              <h1 className="font-orbitron text-2xl font-bold text-white">{battle.topic}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                <Users className="w-5 h-5 text-white/50" />
                <span className="text-white/70">{spectators}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <PlayerCard
                  player={battle.player1}
                  roast={battle.player1Roast}
                  votes={battle.player1Votes}
                  isYou={battle.player1?.id === userId}
                  onVote={() => handleVote(battle.player1?.id || '')}
                  canVote={!battle.player1Roast && battle.status !== 'completed'}
                />
                <PlayerCard
                  player={battle.player2}
                  roast={battle.player2Roast}
                  votes={battle.player2Votes}
                  isYou={battle.player2?.id === userId}
                  onVote={() => handleVote(battle.player2?.id || '')}
                  canVote={!battle.player2Roast && battle.status !== 'completed'}
                />
              </div>

              {battle.status !== 'completed' && (
                <div className="p-6 rounded-2xl glass">
                  <h3 className="font-semibold text-white mb-4">Submit Your Roast</h3>
                  <div className="space-y-4">
                    <textarea
                      value={roast}
                      onChange={(e) => setRoast(e.target.value)}
                      placeholder="Type your roast here..."
                      className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      onClick={handleSubmitRoast}
                      disabled={!roast.trim()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      <Send className="w-5 h-5" />
                      Submit Roast
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="p-6 rounded-2xl glass sticky top-24">
                <h3 className="font-semibold text-white mb-4">Battle Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Pot</span>
                    <span className="font-orbitron font-bold text-accent">{battle.pot} XLM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Status</span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      battle.status === 'open' ? 'bg-primary/20 text-primary' :
                      battle.status === 'active' ? 'bg-secondary/20 text-secondary' :
                      'bg-accent/20 text-accent'
                    )}>
                      {battle.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showWinner && winner && (
            <WinnerModal
              winner={winner}
              onClose={() => {
                setShowWinner(false)
                router.push('/battles')
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function PlayerCard({ player, roast, votes, isYou, onVote, canVote }: {
  player?: User
  roast?: string
  votes: number
  isYou: boolean
  onVote: () => void
  canVote: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-2xl glass',
        isYou && 'border-primary/30'
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
          {player?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-white">{player?.username || 'Waiting...'}</p>
          {isYou && <span className="text-xs text-primary">You</span>}
        </div>
      </div>

      {roast ? (
        <div className="p-4 rounded-xl bg-white/5 mb-4">
          <p className="text-white/90 italic">&ldquo;{roast}&rdquo;</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/5 mb-4 text-center">
          <p className="text-white/40">Waiting for roast...</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-orbitron font-bold text-white">{votes}</span>
        </div>
        {!isYou && canVote && (
          <button
            onClick={onVote}
            className="px-4 py-2 rounded-xl bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            Vote
          </button>
        )}
      </div>
    </motion.div>
  )
}

function WinnerModal({ winner, onClose }: { winner: User; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="p-8 rounded-3xl glass max-w-md w-full text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="mb-6"
        >
          <Trophy className="w-16 h-16 text-accent mx-auto glow-gold" />
        </motion.div>

        <h2 className="font-orbitron text-3xl font-bold text-white mb-2">Winner!</h2>
        <p className="text-white/60 mb-6">{winner.username} takes the pot!</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-orbitron text-2xl font-bold text-accent">+Reward Won!</span>
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  )
}