'use client'

import { motion } from 'framer-motion'
import { KeyRound, Sparkles, Wallet } from 'lucide-react'

const steps = [
  { icon: KeyRound, label: 'Creating Keys...' },
  { icon: Sparkles, label: 'Funding Account...' },
  { icon: Wallet, label: 'Syncing Arena Access...' },
]

export function WalletMintLoader() {
  return (
    <div className="glass rounded-[28px] p-5 text-center sm:rounded-[32px] sm:p-6 md:rounded-[40px] md:p-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 sm:h-24 sm:w-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <Wallet className="h-8 w-8 text-blue-200 sm:h-10 sm:w-10" />
        </motion.div>
      </div>
      <h2 className="mt-6 font-orbitron text-3xl font-bold leading-tight text-white sm:mt-8 sm:text-4xl">
        Minting your Stellar Wallet...
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">
        We&apos;re provisioning your testnet wallet and unlocking arena access.
      </p>

      <div className="mt-8 space-y-3 text-left">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0.4, x: -8 }}
              animate={{ opacity: [0.45, 1, 0.45], x: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.35 }}
              className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 sm:rounded-[24px]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                <Icon className="h-5 w-5 text-blue-200" />
              </div>
              <span className="text-sm text-white/78 sm:text-base">{step.label}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
