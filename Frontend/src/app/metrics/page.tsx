import { Coins, Swords, UserCheck, Wallet } from 'lucide-react'
import { apiRoutes, type PublicMetrics } from '@/lib/api'
import { BrandLogo } from '@/components/BrandLogo'

async function getMetrics(): Promise<PublicMetrics | null> {
  try {
    const { data } = await apiRoutes.analytics.metrics()
    return data
  } catch {
    return null
  }
}

function MetricCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/30 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value.toLocaleString()}</p>
    </div>
  )
}

export default async function MetricsPage() {
  const metrics = await getMetrics()

  if (!metrics) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-300/30 bg-red-950/30 p-8">
          <h1 className="text-2xl font-semibold">Metrics Dashboard</h1>
          <p className="mt-3 text-sm text-red-100/90">Unable to load metrics right now. Please try again shortly.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo size={36} className="relative" />
            <h1 className="text-3xl font-semibold">Roastellar Metrics Dashboard</h1>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Event tracking started on <span className="font-semibold text-cyan-300">April 29, 2026</span>.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Users" value={metrics.totalUsers} accent="text-blue-200" />
          <MetricCard label="Onboarded Users" value={metrics.onboardedUsers} accent="text-emerald-300" />
          <MetricCard label="Wallets Created" value={metrics.walletCreatedUsers} accent="text-violet-300" />
          <MetricCard label="Events (24h)" value={metrics.eventsLast24h} accent="text-amber-300" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Total Battles" value={metrics.totalBattles} accent="text-cyan-200" />
          <MetricCard label="Open Battles" value={metrics.openBattles} accent="text-sky-300" />
          <MetricCard label="Active Battles" value={metrics.activeBattles} accent="text-indigo-300" />
          <MetricCard label="Voting Battles" value={metrics.votingBattles} accent="text-fuchsia-300" />
          <MetricCard label="Finished Battles" value={metrics.endedBattles} accent="text-rose-300" />
          <MetricCard label="Total Votes Cast" value={metrics.totalVotes} accent="text-orange-300" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/12 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-slate-300">
              <UserCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.22em]">Onboarding Progress</p>
            </div>
            <p className="mt-3 text-sm text-slate-200">
              {metrics.onboardedUsers} of {metrics.totalUsers} users completed onboarding.
            </p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-slate-300">
              <Wallet className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.22em]">Wallet Adoption</p>
            </div>
            <p className="mt-3 text-sm text-slate-200">{metrics.walletCreatedUsers} users have managed wallets.</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-slate-300">
              <Swords className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.22em]">Prediction Activity</p>
            </div>
            <p className="mt-3 text-sm text-slate-200">
              {metrics.totalPredictions} predictions placed and {metrics.totalVotes} votes cast.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/12 bg-black/30 p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Coins className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.22em]">Tracking Timestamp</p>
          </div>
          <p className="mt-2 text-sm text-slate-200">Tracking start (UTC): {new Date(metrics.trackingStartedAt).toISOString()}</p>
        </div>
      </section>
    </main>
  )
}
