'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: 'up' | 'down'
  trendValue?: string
}

export function StatCard({ icon: Icon, label, value, trend, trendValue }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
    </motion.div>
  )
}
