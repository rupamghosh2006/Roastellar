'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquareText, Sparkles, Swords, Timer, Users } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { PredictionPanel } from '@/components/PredictionPanel'
import { PageLoader } from '@/components/LoadingScreen'
import { apiRoutes, type Battle, type User } from '@/lib/api'
import {
  castVote,
  getSocket,
  joinMatch,
  leaveMatch,
  makePrediction,
  onMatchResult,
  onRoastSubmitted,
  onSpectatorUpdate,
  removeAllListeners,
  submitRoast,
} from '@/lib/socket'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

export default function BattleRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { userId } = useAuth()
  const [battle, setBattle] = useState<Battle | null>(null)
  const [roast, setRoast] = useState('')
  const [spectators, setSpectators] = useState(0)
  const [winner, setWinner] = useState<User | null>(null)
  const [showWinner, setShowWinner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRoutes.battles.get(id)
      .then((response) => {
        setBattle(response.data)
        setSpectators(response.data.spectators)
      })
      .catch((error) => {
        console.error('Failed to load battle:', error)
        router.replace('/battles')
      })
      .finally(() => setLoading(false))

    const socket = getSocket()
    socket.connect()

    if (userId) {
      joinMatch(id, userId)
    }

    onSpectatorUpdate((event) => {
      if (event.matchId === id) setSpectators(event.count)
    })

    onRoastSubmitted((event) => {
      if (event.matchId !== id) return
      setBattle((current) => {
        if (!current) return current
        return {
          ...current,
          player1Roast: current.player1?.id === event.userId ? event.roast : current.player1Roast,
          player2Roast: current.player2?.id === event.userId ? event.roast : current.player2Roast,
        }
      })
    })

    onMatchResult((event) => {
      if (event.matchId !== id) return
      setBattle((current) => {
        if (!current) return current
        const nextWinner = current.player1?.id === event.winnerId ? current.player1 ?? null : current.player2 ?? null
        setWinner(nextWinner)
        setShowWinner(true)
        return current
      })
    })

    return () => {
      if (userId) leaveMatch(id, userId)
      removeAllListeners()
    }
  }, [id, router, userId])

  const isPlayer = useMemo(() => {
    return battle?.player1?.clerkId === userId || battle?.player2?.clerkId === userId
  }, [battle, userId])

  const handleSubmitRoast = () => {
    if (!roast.trim() || !battle || !userId) return
    submitRoast(id, userId, roast)
    setBattle((current) => {
      if (!current) return current
      return {
        ...current,
        player1Roast: current.player1?.clerkId === userId ? roast : current.player1Roast,
        player2Roast: current.player2?.clerkId === userId ? roast : current.player2Roast,
      }
    })
    setRoast('')
    toast.success('Roast submitted')
  }

  const handleVote = async (playerId: string) => {
    if (!userId) return
    castVote(id, userId, playerId)
    try {
      const response = await apiRoutes.battles.vote(id, { playerId })
      setBattle(response.data)
      toast.success('Vote recorded')
    } catch (error) {
      console.error('Failed to vote:', error)
      toast.error('Vote failed')
    }
  }

  if (loading || !battle) {
    return (
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <PageLoader message="Connecting to match room" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-8">
              <div className="glass rounded-[36px] p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-blue-200/75">Battle room</p>
                    <h1 className="mt-3 font-orbitron text-4xl font-bold text-white">{battle.topic}</h1>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-white/70">
                    <InfoPill icon={<Timer className="h-4 w-4 text-amber-200" />} label={`Ends ${formatRelativeTime(battle.expiresAt)}`} />
                    <InfoPill icon={<Users className="h-4 w-4 text-blue-200" />} label={`${spectators} spectators`} />
                    <InfoPill icon={<Sparkles className="h-4 w-4 text-violet-200" />} label={`${battle.player1Votes + battle.player2Votes} votes`} />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <PlayerPanel
                  player={battle.player1}
                  roast={battle.player1Roast}
                  votes={battle.player1Votes}
                  isCurrentUser={battle.player1?.clerkId === userId}
                  onVote={() => battle.player1?.id && handleVote(battle.player1.id)}
                />
                <PlayerPanel
                  player={battle.player2}
                  roast={battle.player2Roast}
                  votes={battle.player2Votes}
                  isCurrentUser={battle.player2?.clerkId === userId}
                  onVote={() => battle.player2?.id && handleVote(battle.player2.id)}
                />
              </div>

              <div className="glass rounded-[36px] p-6">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-blue-200" />
                  <h2 className="font-orbitron text-2xl text-white">Submit your roast</h2>
                </div>
                <textarea
                  value={roast}
                  onChange={(event) => setRoast(event.target.value)}
                  placeholder={isPlayer ? 'Type something devastating...' : 'Spectators can watch and predict only.'}
                  disabled={!isPlayer}
                  className="mt-5 h-36 w-full rounded-[28px] border border-white/10 bg-white/[0.03] p-4 text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSubmitRoast}
                    disabled={!isPlayer || !roast.trim()}
                    className="rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Submit Roast
                  </button>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <PredictionPanel
                player1Name={battle.player1?.id ?? 'player-1'}
                player2Name={battle.player2?.id ?? 'player-2'}
                isSpectator={!isPlayer}
                onPredict={(playerId, amount) => {
                  makePrediction(id, playerId, amount)
                  toast.success('Prediction placed')
                }}
              />

              <div className="glass rounded-[28px] p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Match pulse</p>
                <div className="mt-5 space-y-3">
                  <PulseRow label="Pot" value={`${battle.pot} XLM`} />
                  <PulseRow label="Votes" value={`${battle.player1Votes + battle.player2Votes}`} />
                  <PulseRow label="Status" value={battle.status} />
                </div>
              </div>
            </aside>
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

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">{icon}<span className="ml-2">{label}</span></div>
}

function PlayerPanel({
  player,
  roast,
  votes,
  isCurrentUser,
  onVote,
}: {
  player?: User
  roast?: string
  votes: number
  isCurrentUser: boolean
  onVote: () => void
}) {
  return (
    <div className={cn('glass rounded-[32px] p-6', isCurrentUser && 'border-blue-400/18')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 font-bold text-white">
            {player?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-white">{player?.username ?? 'Awaiting player'}</p>
            <p className="text-sm text-white/45">{isCurrentUser ? 'You' : 'Competitor'}</p>
          </div>
        </div>
        {!isCurrentUser && player?.id && (
          <button onClick={onVote} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">
            Vote
          </button>
        )}
      </div>
      <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/72">
        {roast ?? 'Waiting for roast submission...'}
      </div>
      <p className="mt-4 text-sm text-white/45">{votes} votes</p>
    </div>
  )
}

function PulseRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}

function WinnerModal({ winner, onClose }: { winner: User; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={(event) => event.stopPropagation()}
        className="glass glow-primary w-full max-w-md rounded-[36px] p-8 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-300/12">
          <Swords className="h-8 w-8 text-amber-200" />
        </div>
        <h2 className="mt-6 font-orbitron text-4xl text-white">Winner</h2>
        <p className="mt-3 text-lg text-white/70">{winner.username} takes the room.</p>
        <button onClick={onClose} className="mt-8 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-300 px-6 py-3 font-semibold text-slate-950">
          Back to battles
        </button>
      </motion.div>
    </motion.div>
  )
}
