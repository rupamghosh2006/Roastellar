'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { 
  Flame, Swords, Trophy, Zap, Shield, Star, 
  ChevronRight, Play, Rocket, ArrowRight, Users,
  TrendingUp, Clock, Gift
} from 'lucide-react'

const features = [
  { icon: Swords, title: 'Epic Battles', description: 'Challenge opponents in real-time roast battles' },
  { icon: Trophy, title: 'Win Rewards', description: 'Earn XLM and exclusive badges for victories' },
  { icon: Zap, title: 'Instant Payouts', description: 'Get paid instantly via the Stellar network' },
  { icon: Shield, title: 'Secure', description: 'Built on Stellar blockchain technology' },
]

const steps = [
  { icon: Users, title: 'Sign Up', description: 'Create your account in seconds' },
  { icon: Swords, title: 'Battle', description: 'Join or create roast battles' },
  { icon: Trophy, title: 'Win & Earn', description: 'Get rewarded in XLM' },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()

  return (
    <main className="min-h-screen pt-16">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Flame className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-white/70">Now live on Stellar Testnet</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-orbitron text-5xl md:text-7xl font-black mb-6"
          >
            <span className="text-gradient">Roast. Battle. Earn.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/60 mb-10 max-w-2xl mx-auto"
          >
            The gamified social battle platform where your wit wins real rewards. 
            Powered by Stellar blockchain with instant payouts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={isSignedIn ? '/dashboard' : '/sign-up'}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:opacity-90 transition-all glow-primary flex items-center gap-2"
            >
              {isSignedIn ? 'Go to Dashboard' : 'Start Free'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 rounded-xl glass text-white/80 font-medium text-lg hover:bg-white/5 transition-colors flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/60 max-w-xl mx-auto">Three simple steps to start earning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl glass text-center group hover:border-primary/30 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4">Why Stellar?</h2>
            <p className="text-white/60 max-w-xl mx-auto">Built on the fastest, most affordable blockchain</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass glass-hover"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 md:p-12 rounded-3xl glass border border-primary/20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">New Users Get Free XLM</span>
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Enter the Arena?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Complete a fun challenge to unlock your Stellar wallet with free testnet XLM
            </p>
            <Link
              href={isSignedIn ? '/onboarding' : '/sign-up'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-amber-600 text-black font-bold text-lg hover:opacity-90 transition-all glow-gold"
            >
              {isSignedIn ? 'Continue Onboarding' : 'Join Now'}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-primary" />
              <span className="font-orbitron font-bold text-xl text-gradient">Roastellar</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Docs</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
            <p className="text-sm text-white/30">Powered by Stellar Network</p>
          </div>
        </div>
      </section>
    </main>
  )
}