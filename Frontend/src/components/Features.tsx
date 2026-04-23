'use client'

import { motion } from 'framer-motion'
import { Gamepad2, Trophy, Wallet, Users, Zap, Lock } from 'lucide-react'

const features = [
  {
    icon: Gamepad2,
    title: 'Addictive Mini-Games',
    description: 'Complete fun onboarding challenges to unlock your wallet and prepare for battle.',
  },
  {
    icon: Trophy,
    title: 'Roast Battles',
    description: 'Compete in real-time roasting battles with other players and earn XP.',
  },
  {
    icon: Users,
    title: 'Predict & Vote',
    description: 'Vote for your favorite roaster and predict winners to earn additional rewards.',
  },
  {
    icon: Wallet,
    title: 'Stellar Rewards',
    description: 'Earn real XLM tokens and testnet rewards powered by Stellar blockchain.',
  },
  {
    icon: Zap,
    title: 'Real-time Gameplay',
    description: 'Socket.io powered live updates for instant feedback and immersive battles.',
  },
  {
    icon: Lock,
    title: 'Secure Wallet',
    description: 'Auto-generated wallets with Stellar integration for safe, transparent transactions.',
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="how-it-works" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl opacity-20" />
        </div>

        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything You Need to Dominate
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From onboarding challenges to epic battles and real rewards—Roastellar has it all.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group glass rounded-lg p-6 hover:border-primary/50 transition"
              >
                <div className="mb-4 inline-block p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
