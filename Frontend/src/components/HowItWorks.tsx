'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Sign Up & Onboard',
    description: 'Create your account and complete our engaging mini-game challenge to unlock your Stellar wallet.',
  },
  {
    number: '2',
    title: 'Join Battles',
    description: 'Jump into roasting battles with players from around the world. Submit your wittiest roasts and compete.',
  },
  {
    number: '3',
    title: 'Vote & Predict',
    description: 'Vote for your favorite roaster and predict winners. Earn extra XLM rewards for correct predictions.',
  },
  {
    number: '4',
    title: 'Climb the Leaderboard',
    description: 'Accumulate XP and wins to rank up. The top players earn exclusive rewards and recognition.',
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl opacity-20" />
        </div>

        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Four Easy Steps to Start Earning
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of players in the ultimate gamified battle arena.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
