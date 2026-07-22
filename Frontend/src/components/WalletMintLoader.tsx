'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { KeyRound, Sparkles, Wallet } from 'lucide-react'

const steps = [
  { icon: KeyRound, title: 'Generating wallet keys', detail: 'Creating your testnet key pair.' },
  { icon: Sparkles, title: 'Funding your account', detail: 'Requesting your Stellar testnet balance.' },
  { icon: Wallet, title: 'Authorizing arena access', detail: 'Preparing your wallet for Roastellar.' },
]

export function WalletMintLoader() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 bg-[#0b0d12] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-[28px] sm:p-8 lg:p-10"
      aria-label="Provisioning your Stellar wallet"
    >
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start gap-4 border-b border-white/10 pb-6 sm:items-center sm:pb-8">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-[#111b25]">
            <motion.span
              className="absolute inset-1 rounded-lg border border-cyan-200/20"
              animate={prefersReducedMotion ? undefined : { scale: [0.9, 1.12, 0.9], opacity: [0.65, 0, 0.65] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -3, 0], scale: [1, 0.96, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Wallet className="h-6 w-6 text-cyan-200" />
            </motion.div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Secure provisioning</p>
            <h2 className="mt-2 font-orbitron text-xl font-bold tracking-tight text-white sm:text-2xl">Preparing your Stellar wallet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This usually takes only a moment. Keep this window open while we complete setup.</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-white/10 border border-white/10 bg-[#0e1117]">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.12 }}
                className="flex items-center gap-4 p-4 sm:p-5"
              >
                <span className="w-5 font-space text-xs text-slate-600">0{index + 1}</span>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#171d29]">
                  <Icon className="h-5 w-5 text-cyan-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-100">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
                <div className="hidden w-20 sm:block">
                  <div className="h-1 overflow-hidden bg-white/10">
                    <motion.div
                      className="h-full bg-cyan-300"
                      animate={prefersReducedMotion ? { width: '62%' } : { width: ['22%', '78%', '42%'] }}
                      transition={{ duration: 1.8, delay: index * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Your wallet remains secured on Stellar Testnet.
        </div>
      </div>
    </motion.section>
  )
}
