'use client'

import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  const { isSignedIn } = useUser()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-30 animate-float animation-delay-2000" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl opacity-20" />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary">
            ✨ Gamified Social Battle Arena
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance"
        >
          <span className="gradient-primary bg-clip-text text-transparent">Roast.</span>{' '}
          <span className="gradient-accent bg-clip-text text-transparent">Battle.</span>{' '}
          <span className="text-foreground">Earn.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Join the ultimate gamified battle arena powered by Stellar. Complete challenges, dominate battles, predict winners, and earn real rewards.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 group"
            >
              Enter Arena
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 group"
              >
                Start Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-lg border border-primary/50 text-primary font-semibold hover:bg-primary/10 transition"
              >
                Watch Demo
              </a>
            </>
          )}
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
        >
          {[
            { number: '50K+', label: 'Active Players' },
            { number: '$1M+', label: 'Rewards Earned' },
            { number: '100K+', label: 'Battles Completed' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-lg p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
