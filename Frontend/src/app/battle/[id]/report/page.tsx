'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ArrowLeft, Coins, ExternalLink, Swords, Trophy, Users, Vote } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { apiRoutes, type BattleReport, type User } from '@/lib/api'
import { formatDate, formatXLM } from '@/lib/utils'
import { getWalletAuthToken, isWalletAuthenticated } from '@/lib/walletAuth'

const statusStyles: Record<string, string> = {
  ended: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  draw: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  cancelled: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
}

export default function BattleReportPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [report, setReport] = useState<BattleReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const walletMode = isWalletAuthenticated()
  const matchId = Number(params?.id || 0)

  useEffect(() => {
    if (!isLoaded) return
    if (!Number.isFinite(matchId) || matchId <= 0) {
      router.replace('/profile')
      return
    }
    if (!isSignedIn && !walletMode) {
      router.replace('/sign-in')
      return
    }

    let active = true
    ;(async () => {
      try {
        const token = walletMode ? getWalletAuthToken() : await getToken({ skipCache: true })
        if (!token) throw new Error('Missing auth token')
        const response = await apiRoutes.battles.report(matchId, token)
        if (active) setReport(response.data)
      } catch (requestError: any) {
        if (active) {
          setError(requestError?.response?.data?.message || requestError?.message || 'Unable to load this battle report')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [getToken, isLoaded, isSignedIn, matchId, router, walletMode])

  if (loading) {
    return <ReportSkeleton />
  }

  if (!report) {
    return (
      <div className="flex min-h-screen pt-16 md:pt-0">
        <Sidebar />
        <main className="mobile-nav-offset flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="glass w-full max-w-lg rounded-2xl border-l-4 border-l-red-500/40 p-6 text-center sm:p-8">
            <p className="font-orbitron text-xl text-white">Battle report unavailable</p>
            <p className="mt-3 text-sm text-slate-400">{error || 'You can only view reports for battles where you played or voted.'}</p>
            <button onClick={() => router.push('/profile')} className="btn-secondary mt-6">
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </button>
          </div>
        </main>
      </div>
    )
  }

  const { battle } = report
  const explorerNetwork = report.network === 'mainnet' ? 'public' : 'testnet'
  const transactionUrl = (hash: string) => `https://stellar.expert/explorer/${explorerNetwork}/tx/${hash}`
  const statusLabel = battle.status === 'ended' ? 'Finished' : battle.status === 'draw' ? 'Draw' : 'Cancelled'

  return (
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
          <section className="glass rounded-2xl border-l-4 border-l-orange-500/40 p-5 sm:p-8">
            <button onClick={() => router.push('/profile')} className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </button>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Battle report · #{battle.matchId}</p>
                <h1 className="mt-2 break-words font-orbitron text-2xl font-bold leading-tight text-white sm:text-4xl">{battle.topic}</h1>
                <p className="mt-3 text-sm text-slate-400">Completed {formatDate(battle.endedAt || battle.createdAt)} · Entry {formatXLM(battle.entryFee)} XLM</p>
              </div>
              <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${statusStyles[battle.status] || statusStyles.cancelled}`}>
                {statusLabel}
              </span>
            </div>
          </section>

          <SectionHeading icon={<Swords className="h-5 w-5 text-violet-300" />} eyebrow="Arena" title="Players & result" />
          <section className="grid gap-4 md:grid-cols-2">
            <PlayerCard player={battle.player1} label="Player 1" isWinner={battle.winnerId === battle.player1?.id} votes={battle.player1Votes} />
            <PlayerCard player={battle.player2} label="Player 2" isWinner={battle.winnerId === battle.player2?.id} votes={battle.player2Votes} />
          </section>

          <section className="glass rounded-2xl border-l-4 border-l-cyan-500/40 p-5 sm:p-6">
            <SectionHeading icon={<Vote className="h-5 w-5 text-cyan-300" />} eyebrow="Audience" title="Votes cast" detail={`${report.votes.length} total`} />
            {report.votes.length ? (
              <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-black/10">
                {report.votes.map((vote) => (
                  <div key={vote.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <Person user={vote.voter} label="Voted" />
                    <div className="flex items-center gap-2 text-sm text-slate-500 sm:px-4">
                      <span className="hidden sm:inline">for</span>
                      <span className="sm:hidden">Voted for</span>
                      <span className="text-slate-600">→</span>
                    </div>
                    <Person user={vote.selectedPlayer} label="Selected player" align="right" />
                    {vote.chainTxHash && <TransactionLink hash={vote.chainTxHash} href={transactionUrl(vote.chainTxHash)} label="Vote transaction" />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No spectator votes were recorded for this battle." />
            )}
          </section>

          <section className="glass rounded-2xl border-l-4 border-l-violet-500/40 p-5 sm:p-6">
            <SectionHeading icon={<Users className="h-5 w-5 text-violet-300" />} eyebrow="Predictions" title="Who staked on whom" detail={`${report.predictions.length} total`} />
            {report.predictions.length ? (
              <div className="mt-5 space-y-3">
                {report.predictions.map((prediction) => (
                  <div key={prediction.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <PersonAvatar user={prediction.predictor} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{prediction.predictor.username}</p>
                          <p className="mt-1 text-sm text-slate-400">Backed {prediction.selectedPlayer.username} with {formatXLM(prediction.amount)} XLM</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.03] px-3 py-2 lg:min-w-[220px]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Received</p>
                          <p className={`mt-1 font-orbitron text-lg ${prediction.payoutAmount > 0 ? 'text-emerald-200' : 'text-slate-300'}`}>
                            {formatXLM(prediction.payoutAmount)} XLM
                          </p>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${prediction.won ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-white/15 bg-white/5 text-slate-400'}`}>
                          {prediction.won ? 'Won' : prediction.payoutAmount > 0 ? 'Refunded' : 'No payout'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      {prediction.payoutEstimated && <span className="text-slate-500">Estimated from the archived transaction</span>}
                      {prediction.payoutTxHash && <TransactionLink hash={prediction.payoutTxHash} href={transactionUrl(prediction.payoutTxHash)} label="Payout transaction" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No predictions were placed on this battle." />
            )}
          </section>

          <section className="glass rounded-2xl border-l-4 border-l-emerald-500/40 p-5 sm:p-6">
            <SectionHeading icon={<Coins className="h-5 w-5 text-emerald-300" />} eyebrow="Rewards" title="Payouts & refunds" detail={`${report.payouts.length} recorded`} />
            {report.payouts.length ? (
              <div className="mt-5 space-y-3">
                {report.payouts.map((payout, index) => (
                  <div key={`${payout.recipient.id}-${payout.txHash}-${index}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <Person user={payout.recipient} label={payout.reason} />
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="font-orbitron text-xl text-emerald-200">{formatXLM(payout.amount)} XLM</p>
                        {payout.estimated && <p className="mt-1 text-xs text-slate-500">Estimated from archived data</p>}
                      </div>
                      {payout.txHash && <TransactionLink hash={payout.txHash} href={transactionUrl(payout.txHash)} />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No XLM payout was recorded for this battle." />
            )}
          </section>

          <section className="glass rounded-2xl border-l-4 border-l-orange-500/40 p-5 sm:p-6">
            <SectionHeading icon={<ExternalLink className="h-5 w-5 text-orange-300" />} eyebrow="Stellar" title="On-chain transactions" detail={`${report.transactions.length} available`} />
            {report.transactions.length ? (
              <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-black/10">
                {report.transactions.map((transaction) => (
                  <div key={transaction.hash} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-300">{transaction.label}</p>
                    <TransactionLink hash={transaction.hash} href={transactionUrl(transaction.hash)} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No Stellar transaction hash was stored for this battle." />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function SectionHeading({ icon, eyebrow, title, detail }: { icon: React.ReactNode; eyebrow: string; title: string; detail?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 font-orbitron text-xl text-white sm:text-2xl">{title}</h2>
        </div>
      </div>
      {detail && <p className="text-sm text-slate-400">{detail}</p>}
    </div>
  )
}

function PlayerCard({ player, label, isWinner, votes }: { player?: User; label: string; isWinner: boolean; votes: number }) {
  return (
    <div className={`glass min-w-0 rounded-2xl p-5 ${isWinner ? 'border border-emerald-400/30' : 'border border-white/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
        {isWinner && <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Winner</span>}
      </div>
      {player ? (
        <div className="mt-5 flex min-w-0 items-center gap-4">
          <PersonAvatar user={player} large />
          <div className="min-w-0">
            <p className="truncate font-orbitron text-xl text-white">{player.username}</p>
            <p className="mt-2 text-sm text-slate-400">{votes} vote{votes === 1 ? '' : 's'} · {player.wins} wins</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">No second player joined this battle.</p>
      )}
    </div>
  )
}

function Person({ user, label, align = 'left' }: { user: User; label: string; align?: 'left' | 'right' }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'sm:flex-row-reverse sm:text-right' : ''}`}>
      <PersonAvatar user={user} />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate font-semibold text-white">{user.username}</p>
      </div>
    </div>
  )
}

function PersonAvatar({ user, large = false }: { user: User; large?: boolean }) {
  const size = large ? 'h-14 w-14' : 'h-10 w-10'
  if (user.avatar) {
    return <Image src={user.avatar} alt={`${user.username}'s profile picture`} width={large ? 56 : 40} height={large ? 56 : 40} className={`${size} shrink-0 rounded-xl border border-white/15 object-cover`} />
  }
  return <div className={`flex ${size} shrink-0 items-center justify-center rounded-xl bg-violet-500/15 font-semibold text-violet-200`}>{user.username?.[0]?.toUpperCase() || '?'}</div>
}

function TransactionLink({ hash, href, label = 'View on Stellar Expert' }: { hash: string; href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 text-xs text-cyan-200 transition-colors hover:text-cyan-100">
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label} · {hash.slice(0, 10)}…{hash.slice(-6)}</span>
    </a>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="mt-5 rounded-xl border border-dashed border-white/15 bg-black/10 px-4 py-7 text-center text-sm text-slate-500">{text}</p>
}

function ReportSkeleton() {
  return (
    <div className="flex min-h-screen pt-16 md:pt-0">
      <Sidebar />
      <main className="mobile-nav-offset flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="glass h-44 rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-2"><div className="glass h-40 rounded-2xl" /><div className="glass h-40 rounded-2xl" /></div>
          {[0, 1, 2].map((index) => <div key={index} className="glass h-52 rounded-2xl" />)}
        </div>
      </main>
    </div>
  )
}
