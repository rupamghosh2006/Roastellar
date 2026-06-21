'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { Coins, MessageSquareText, Sparkles, Swords, Timer, Trophy, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { PredictionPanel } from '@/components/PredictionPanel'
import { PageLoader } from '@/components/LoadingScreen'
import { AnimatedList } from '@/components/AnimatedList'
import { apiRoutes, normalizeBattle, type Battle, type PredictionSummary, type User } from '@/lib/api'
import {
  connectSocket,
  joinBattle,
  onBattleStarted,
  leaveBattle,
  onBattleResult,
  onCountdownTick,
  onErrorMessage,
  onPlayerJoined,
  onRoastSubmitted,
  onSpectatorCount,
  onVoteUpdate,
  onVotingStarted,
  removeAllSocketListeners,
} from '@/lib/socket'
import { cn } from '@/lib/utils'
import { getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'

type TimerState = {
  phase: 'starting' | 'active' | 'voting' | null
  remaining: number
}

export default function BattleRoomPage() {
  const params = useParams<{ id: string }>()
  const matchId = Number(params?.id || 0)
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [battle, setBattle] = useState<Battle | null>(null)
  const [predictionSummary, setPredictionSummary] = useState<PredictionSummary | null>(null)
  const [roastText, setRoastText] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [timer, setTimer] = useState<TimerState>({ phase: null, remaining: 0 })
  const [resultWinner, setResultWinner] = useState<User | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [spectators, setSpectators] = useState(0)
  const [me, setMe] = useState<User | null>(null)
  const [activity, setActivity] = useState<string[]>([])
  const [predictionBusy, setPredictionBusy] = useState(false)
  const [managedWalletBlocked, setManagedWalletBlocked] = useState(false)

  const pushActivity = useCallback((line: string) => {
    setActivity((current) => [line, ...current].slice(0, 10))
  }, [])

  useEffect(() => {
    if (!Number.isFinite(matchId) || matchId <= 0) {
      router.replace('/battles')
      return
    }
  }, [matchId, router])

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    const walletMode = isWalletAuthenticated()
    if (!isSignedIn && !walletMode) {
      router.replace('/sign-in')
      return
    }

    let active = true
    ;(async () => {
      try {
        const token = walletMode ? getWalletAuthToken() : await getToken({ skipCache: true })
        if (!token) {
          throw new Error('Missing token')
        }

        connectSocket(token)
        joinBattle(matchId)

        const [meRes, battleRes, predictionRes] = await Promise.all([
          apiRoutes.users.me(token),
          apiRoutes.battles.get(matchId),
          apiRoutes.predictions.summary(matchId),
        ])

        if (!active) return
        setMe(meRes.data)
        setManagedWalletBlocked(Boolean(!meRes.data.hasManagedWallet))
        setBattle(battleRes.data)
        setPredictionSummary(predictionRes.data.summary)
        setSpectators(battleRes.data.spectators ?? 0)
        pushActivity(`Battle room connected for match #${matchId}`)

        onSpectatorCount((event) => {
          if (Number(event?.matchId) !== matchId) return
          setSpectators(Number(event?.count ?? 0))
          pushActivity(`Spectators online: ${Number(event?.count ?? 0)}`)
        })

        onPlayerJoined((event) => {
          if (Number(event?.matchId) !== matchId) return
          if (event?.battle) {
            setBattle(normalizeBattle(event.battle))
          }
        })

        onCountdownTick((event) => {
          if (Number(event?.matchId) !== matchId) return
          setTimer({
            phase: event?.phase || null,
            remaining: Number(event?.remaining || 0),
          })
        })

        onBattleStarted((event) => {
          if (Number(event?.matchId) !== matchId) return
          if (event?.battle) {
            setBattle((current) => {
              const next = normalizeBattle(event.battle)
              if (!current) return next
              // Never downgrade an already-started voting/result state back to active from delayed events.
              const lockedStates = new Set(['voting', 'ended', 'draw', 'cancelled'])
              if (lockedStates.has(current.status) && next.status === 'active') {
                return current
              }
              return next
            })
          } else {
            setBattle((current) => {
              if (!current) return current
              const lockedStates = new Set(['voting', 'ended', 'draw', 'cancelled'])
              if (lockedStates.has(current.status)) return current
              return { ...current, status: 'active' }
            })
          }
          setTimer({
            phase: 'active',
            remaining: Number(event?.durationSec || 60),
          })
          pushActivity('Battle started')
        })

        onRoastSubmitted((event) => {
          if (Number(event?.matchId) !== matchId) return
          if (event?.battle) {
            const normalized = normalizeBattle(event.battle)
            setBattle(normalized)
            pushActivity('A roast was submitted')
          } else if (event?.userId && event?.roast) {
            setBattle((current) => {
              if (!current) return current
              const next = {
                ...current,
                roast1: String(current.player1?.id) === String(event.userId) ? event.roast : current.roast1,
                roast2: String(current.player2?.id) === String(event.userId) ? event.roast : current.roast2,
              }
              // Fallback: if both roasts exist, surface voting UI even if voting_started socket arrives late.
              if (next.roast1 && next.roast2 && next.status === 'active') {
                return { ...next, status: 'voting' }
              }
              return next
            })
            pushActivity('A roast was submitted')
          }
        })

        onVotingStarted((event) => {
          if (Number(event?.matchId) !== matchId) return
          setBattle((current) => (current ? { ...current, status: 'voting' } : current))
          setTimer({
            phase: 'voting',
            remaining: Number(event?.durationSec || 0),
          })
          pushActivity('Voting phase started')
        })

        onVoteUpdate((event) => {
          if (Number(event?.matchId) !== matchId) return
          setBattle((current) => {
            if (!current) return current
            return {
              ...current,
              player1Votes: Number(event?.votesPlayer1 ?? current.player1Votes),
              player2Votes: Number(event?.votesPlayer2 ?? current.player2Votes),
            }
          })
          pushActivity('A spectator vote was cast')
        })

        onBattleResult((event) => {
          if (Number(event?.matchId) !== matchId) return
          setBattle((current) => {
            if (!current) return current
            const next = {
              ...current,
              status: event?.status || current.status,
              winnerId: event?.winnerId ?? current.winnerId,
              player1Votes: Number(event?.votesPlayer1 ?? current.player1Votes),
              player2Votes: Number(event?.votesPlayer2 ?? current.player2Votes),
              txHash: event?.txHash || current.txHash,
            } as Battle
            const winner = next.winnerId
              ? String(next.player1?.id) === String(next.winnerId)
                ? next.player1 || null
                : next.player2 || null
              : null
            setResultWinner(winner)
            setShowResult(true)
            pushActivity(`Battle finished with status: ${event?.status || next.status}`)
            return next
          })
        })

        onErrorMessage((event) => {
          if (event?.message) {
            toast.error(event.message)
          }
        })
      } catch (error) {
        toast.error('Unable to load battle room')
        router.replace('/battles')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
      leaveBattle(matchId)
      removeAllSocketListeners()
    }
  }, [getToken, isLoaded, isSignedIn, matchId, pushActivity, router])

  const currentUserInBattle = useMemo(() => {
    if (!battle) return { isPlayer1: false, isPlayer2: false }
    const identityId = me?.clerkId || userId
    const player1Clerk = battle.player1?.clerkId
    const player2Clerk = battle.player2?.clerkId
    return {
      isPlayer1: Boolean(player1Clerk) && player1Clerk === identityId,
      isPlayer2: Boolean(player2Clerk) && player2Clerk === identityId,
    }
  }, [battle, me?.clerkId, userId])

  const canJoinOpenBattle = useMemo(() => {
    if (!battle || !me) return false
    if (battle.status !== 'open') return false
    if (!me.walletAddress) return false
    if (String(battle.player1?.id) === String(me.id)) return false
    return true
  }, [battle, me])

  const submitRoast = async () => {
    if (managedWalletBlocked) {
      toast.error('Roast submission is temporarily gated for Freighter-primary accounts until wallet-native signing is enabled.')
      return
    }
    if (!battle) return
    if (!roastText.trim()) {
      toast.error('Write your roast first')
      return
    }

    try {
      setActionBusy(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing token')
      }
      const response = await apiRoutes.battles.submitRoast(matchId, roastText.trim(), token)
      setBattle(response.data)
      setRoastText('')
      toast.success('Roast submitted')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit roast')
    } finally {
      setActionBusy(false)
    }
  }

  const castVote = async (selectedPlayer: string) => {
    if (managedWalletBlocked) {
      toast.error('Voting is temporarily gated for Freighter-primary accounts until wallet-native signing is enabled.')
      return
    }
    try {
      setActionBusy(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing token')
      }
      const response = await apiRoutes.battles.vote(matchId, { selectedPlayer }, token)
      setBattle(response.data)
      toast.success('Vote cast')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cast vote')
    } finally {
      setActionBusy(false)
    }
  }

  const joinOpenBattle = async () => {
    if (managedWalletBlocked) {
      toast.error('Joining battles is temporarily gated for Freighter-primary accounts until wallet-native signing is enabled.')
      return
    }
    try {
      setActionBusy(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing token')
      }
      const response = await apiRoutes.battles.join(matchId, token)
      setBattle(response.data)
      toast.success('Joined battle. Roast timer started.')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to join battle')
    } finally {
      setActionBusy(false)
    }
  }

  const placePrediction = async (selectedPlayer: string, amount: number) => {
    if (managedWalletBlocked) {
      toast.error('Predictions are temporarily gated for Freighter-primary accounts until wallet-native signing is enabled.')
      return
    }
    try {
      setPredictionBusy(true)
      const token = isWalletAuthenticated() ? getWalletAuthToken() : await getToken({ skipCache: true })
      if (!token) {
        throw new Error('Missing token')
      }
      await apiRoutes.predictions.place(matchId, { selectedPlayer, amount }, token)
      const latest = await apiRoutes.predictions.summary(matchId)
      setPredictionSummary(latest.data.summary)
      toast.success('Prediction placed')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to place prediction')
    } finally {
      setPredictionBusy(false)
    }
  }

  if (loading || !battle) {
    return (
      <div className="flex min-h-screen pt-16 md:pt-0">
        <Sidebar />
        <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
          <PageLoader message="Connecting to arena..." />
        </main>
      </div>
    )
  }

  const isSpectator = !currentUserInBattle.isPlayer1 && !currentUserInBattle.isPlayer2
  const canRoast = (currentUserInBattle.isPlayer1 || currentUserInBattle.isPlayer2) && battle.status === 'active'
  const canVote = isSpectator && battle.status === 'voting'

  return (
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-8 border-l-4 border-l-orange-500/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Battle #{battle.matchId}</p>
                <h1 className="mt-2 font-orbitron text-3xl text-white sm:text-4xl">{battle.topic}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white">
                <Pill icon={<Sparkles className="h-4 w-4 text-violet-300" />} label={`Status: ${battle.status}`} />
                <Pill
                  icon={<Timer className="h-4 w-4 text-amber-300" />}
                  label={timer.remaining > 0 ? `${timer.phase || 'phase'} ${timer.remaining}s` : 'No timer'}
                />
                <Pill icon={<Users className="h-4 w-4 text-cyan-300" />} label={`${spectators} spectators`} />
                <Pill icon={<Coins className="h-4 w-4 text-emerald-300" />} label={`Pot ${battle.pot} XLM`} />
                {canJoinOpenBattle && (
                  <button
                    onClick={joinOpenBattle}
                    disabled={actionBusy}
                    className="rounded-full bg-[#B88A35] px-4 py-2 font-semibold text-slate-950 transition-colors hover:bg-[#D1A24A] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Join Battle
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <PlayerCard
                  title="Player 1"
                  player={battle.player1}
                  roast={battle.roast1}
                  votes={battle.player1Votes}
                  winning={battle.player1Votes > battle.player2Votes}
                  onVote={canVote && battle.player1?.id ? () => castVote(battle.player1!.id) : undefined}
                  disabled={actionBusy}
                />
                <PlayerCard
                  title="Player 2"
                  player={battle.player2}
                  roast={battle.roast2}
                  votes={battle.player2Votes}
                  winning={battle.player2Votes > battle.player1Votes}
                  onVote={canVote && battle.player2?.id ? () => castVote(battle.player2!.id) : undefined}
                  disabled={actionBusy}
                />
              </div>

              <div className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 border-l-4 border-l-violet-500/40">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-violet-300" />
                  <h2 className="font-orbitron text-xl text-white sm:text-2xl">Roast Submission</h2>
                </div>
                <textarea
                  value={roastText}
                  onChange={(event) => setRoastText(event.target.value)}
                  placeholder={canRoast ? 'Drop your best roast here...' : 'Only battle players can submit roasts'}
                  disabled={!canRoast || actionBusy}
                  className="mt-4 h-36 w-full input-glass disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={submitRoast}
                    disabled={!canRoast || actionBusy || !roastText.trim()}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit Roast
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <PredictionPanel
                player1Id={battle.player1?.id}
                player2Id={battle.player2?.id}
                player1Name={battle.player1?.username || 'Player 1'}
                player2Name={battle.player2?.username || 'Player 2'}
                isSpectator={isSpectator}
                disabled={predictionBusy}
                onPredict={(selectedPlayer, amount) => placePrediction(selectedPlayer, amount)}
              />

              <div className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 border-l-4 border-l-cyan-500/40">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Prediction Pot</p>
                <p className="mt-3 font-orbitron text-3xl text-white">{predictionSummary?.totalAmount ?? 0} XLM</p>
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  <p>Backed on P1: {predictionSummary?.onPlayer1 ?? 0} XLM</p>
                  <p>Backed on P2: {predictionSummary?.onPlayer2 ?? 0} XLM</p>
                </div>
              </div>
            </aside>
          </section>

          <section className="glass rounded-2xl p-5 sm:rounded-2xl sm:p-6 border-l-4 border-l-emerald-500/40">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-emerald-300" />
              <h2 className="font-orbitron text-xl text-white sm:text-2xl">Live Activity Feed</h2>
            </div>
            <div className="mt-4">
              {activity.length === 0 ? (
                <p className="text-sm text-slate-400">No activity yet.</p>
              ) : (
                <AnimatedList
                  items={activity}
                  showGradients={false}
                  enableArrowNavigation={false}
                  displayScrollbar={false}
                  containerClassName="max-h-none overflow-visible p-0"
                  renderItem={(line, index) => (
                    <div
                      key={`${line}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400"
                    >
                      {line}
                    </div>
                  )}
                />
              )}
            </div>
          </section>
        </div>

        <AnimatePresence>
          {showResult && (
            <ResultModal
              battle={battle}
              winner={resultWinner}
              onClose={() => setShowResult(false)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium">
      {icon}
      {label}
    </span>
  )
}

function PlayerCard({
  title,
  player,
  roast,
  votes,
  winning,
  onVote,
  disabled,
}: {
  title: string
  player?: User
  roast?: string
  votes: number
  winning?: boolean
  onVote?: () => void
  disabled?: boolean
}) {
  return (
    <div className={cn('glass rounded-xl p-5 sm:rounded-xl sm:p-6 border-l-4', winning ? 'border-l-emerald-500/50' : 'border-l-white/20')}>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full font-semibold text-white", winning ? 'bg-emerald-500/20' : 'bg-white/10')}>
          {player?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-white">{player?.username || 'Awaiting challenger'}</p>
          <p className="text-xs text-slate-400">{votes} votes</p>
        </div>
      </div>
      <div className="mt-4 min-h-[92px] rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-slate-300">
        {roast || 'No roast submitted yet.'}
      </div>
      {onVote && (
        <button
          onClick={onVote}
          disabled={disabled}
          className="mt-4 w-full rounded-xi bg-[#B88A35] px-4 py-2.5 font-semibold text-slate-950 transition-all hover:bg-[#D1A24A] disabled:cursor-not-allowed disabled:opacity-55"
        >
          Vote for {player?.username || 'Player'}
        </button>
      )}
    </div>
  )
}

function ResultModal({
  battle,
  winner,
  onClose,
}: {
  battle: Battle
  winner: User | null
  onClose: () => void
}) {
  const router = useRouter()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        onClick={(event) => event.stopPropagation()}
        className="glass w-full max-w-xl rounded-2xl p-6 sm:p-8 border-l-4 border-l-orange-500/50"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15">
          <Trophy className="h-7 w-7 text-orange-400" />
        </div>
        <h2 className="mt-5 text-center font-orbitron text-3xl text-white">Battle Result</h2>
        <p className="mt-3 text-center text-slate-300">
          {battle.status === 'draw' ? 'Draw. Entry refunds applied.' : `${winner?.username || 'Winner'} takes the arena.`}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Votes P1" value={String(battle.player1Votes)} />
          <InfoRow label="Votes P2" value={String(battle.player2Votes)} />
          <InfoRow label="Prize" value={`${battle.pot} XLM`} />
          <InfoRow label="Tx Hash" value={battle.txHash ? `${battle.txHash.slice(0, 12)}...` : 'Pending'} />
        </div>
        {battle.txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${battle.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm text-blue-200 hover:text-blue-100"
          >
            View transaction on Stellar Expert
          </a>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push('/battles')}
            className="w-full btn-primary"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full btn-secondary"
          >
            Go Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl px-4 py-3 border-t-2 border-t-orange-500/50">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}
