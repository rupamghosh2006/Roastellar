import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Zap, Users, Trophy, Wallet, ArrowRight, Star, Play, Sparkles, Gamepad2, Target, Crown } from 'lucide-react';
import { Navbar, Footer } from '@/components/Navbar';

const features = [
  {
    icon: Gamepad2,
    title: 'Roast Battles',
    description: 'Challenge friends or strangers to epic roast battles. Submit roasts, vote, and let the community decide.',
  },
  {
    icon: Target,
    title: 'Predict Winners',
    description: 'Stake tokens on who you think will win. Correct predictions earn rewards.',
  },
  {
    icon: Trophy,
    title: 'Earn Rewards',
    description: 'Win XP, climb leaderboards, earn badges, and withdraw rewards powered by Stellar.',
  },
  {
    icon: Users,
    title: 'Real-timeSpectators',
    description: 'Live spectators, instant votes, and electric crowd reactions.',
  },
];

const leaderboardPreview = [
  { rank: 1, name: 'RoastKing', xp: 15420, wins: 89 },
  { rank: 2, name: 'FlameMaster', xp: 12350, wins: 72 },
  { rank: 3, name: 'BurnBot', xp: 9870, wins: 61 },
  { rank: 4, name: 'RoastQueen', xp: 8540, wins: 55 },
  { rank: 5, name: 'FireToast', xp: 7320, wins: 48 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-16">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-background to-background" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-muted-foreground">Powered by Stellar</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">Roast.</span>{' '}
              <span className="gradient-text">Battle.</span>{' '}
              <span className="gradient-text">Earn.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              The gamified social battle platform where wit meets Web3. 
              Challenge, roast, predict, and earn rewards on Stellar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  Enter Arena
                  <Flame className="w-5 h-5" />
                </Link>
              </SignedIn>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/10 font-semibold text-lg hover:bg-white/20 transition-colors">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              {[
                { icon: Crown, value: '🥇', label: '#1' },
                { icon: Flame, value: '🔥', label: 'Top 1%' },
                { icon: Zap, value: '⚡', label: '50K+ Battles' },
                { icon: Users, value: '👥', label: '10K+ Players' },
                { icon: Wallet, value: '💎', label: '$500K+ Rewards' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <div className="text-2xl mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to become a roast master
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Sign In', desc: 'Connect with Google via Clerk' },
                { step: '02', title: 'Get Wallet', desc: 'Auto-created Stellar wallet' },
                { step: '03', title: 'Join Battle', desc: 'Find or create matches' },
                { step: '04', title: 'Roast & Earn', desc: 'Submit roasts, win rewards' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 relative"
                >
                  <div className="text-6xl font-bold text-violet-500/20 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Stellar?</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Lightning Fast', desc: 'Transactions settle in 3-5 seconds' },
                { title: 'Nearly Free', desc: 'Minimal fees, even on busy days' },
                { title: 'Global Access', desc: 'Anyone can participate' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-gradient-to-br from-violet-900/20 to-blue-900/20 border border-white/10"
                >
                  <Zap className="w-10 h-10 text-violet-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Live Leaderboard</h2>
              <p className="text-xl text-muted-foreground">Top roasters this week</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {leaderboardPreview.map((user, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0"
                  >
                    <div className={`w-8 font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600" />
                    <div className="flex-1 font-medium">{user.name}</div>
                    <div className="text-right">
                      <div className="font-semibold">{user.xp.toLocaleString()} XP</div>
                      <div className="text-xs text-muted-foreground">{user.wins} wins</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
                >
                  View Full Leaderboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Features</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Roast?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of players in the arena. Your first wallet is on us.
            </p>
            <SignedOut>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-xl hover:opacity-90 transition-opacity"
              >
                Start Free Now
                <Flame className="w-6 h-6" />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-xl hover:opacity-90 transition-opacity"
              >
                Enter Arena
                <ArrowRight className="w-6 h-6" />
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}