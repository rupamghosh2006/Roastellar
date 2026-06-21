'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ChampionIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/api'
import ElectricBorder from '@/components/ElectricBorder'

function AnimatedItem({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}: {
  children: ReactNode
  delay?: number
  index: number
  onMouseEnter: () => void
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { amount: 0.5, once: false })

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[]
  currentUserId?: string
}) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [keyboardNav, setKeyboardNav] = useState(false)
  const [topShadeOpacity, setTopShadeOpacity] = useState(0)
  const [bottomShadeOpacity, setBottomShadeOpacity] = useState(1)

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleItemClick = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    setTopShadeOpacity(Math.min(scrollTop / 50, 1))
    const bottomDistance = scrollHeight - (scrollTop + clientHeight)
    setBottomShadeOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1))
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.min(prev + 1, entries.length - 1))
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [entries.length])

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return

    const container = listRef.current
    const selectedItem = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`)
    if (selectedItem) {
      const extraMargin = 50
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' })
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        })
      }
    }
    setKeyboardNav(false)
  }, [keyboardNav, selectedIndex])

  useEffect(() => {
    if (!listRef.current) return
    const container = listRef.current
    setBottomShadeOpacity(container.scrollHeight <= container.clientHeight ? 0 : 1)
  }, [entries.length])

  return (
    <div className="glass relative w-full overflow-hidden rounded-[24px] p-4 sm:rounded-[32px]">
      <div
        ref={listRef}
        className="max-h-[400px] overflow-y-auto p-2 [scrollbar-color:#222_#120F17] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-[4px] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-track]:bg-[#120F17] [&::-webkit-scrollbar]:w-[8px]"
        onScroll={handleScroll}
      >
        {entries.map((entry, index) => (
          <AnimatedItem
            key={entry.id}
            delay={0.1}
            index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(index)}
          >
            <div
              className={cn(
                'rounded-xl border border-white/10 bg-[#111] p-4 transition-colors',
                selectedIndex === index && 'bg-[#222]',
                currentUserId === entry.clerkId && 'border-blue-400/40 bg-blue-500/10'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <RankBadge rank={entry.rank} />
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1D4ED8]/20 font-semibold text-white">
                    {entry.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{entry.username}</p>
                    <p className="text-xs text-white/50">{entry.wins} wins</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 font-orbitron text-white">
                    <TrendingUp className="h-4 w-4 text-blue-200" />
                    {entry.xp.toLocaleString()}
                  </div>
                  <p className="text-xs text-white/60">{entry.winRate.toFixed(1)}% win rate</p>
                </div>
              </div>
            </div>
          </AnimatedItem>
        ))}
      </div>

      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[50px] bg-[#120F17]/85 transition-opacity duration-300 ease"
        style={{ opacity: topShadeOpacity }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[100px] bg-[#120F17]/85 transition-opacity duration-300 ease"
        style={{ opacity: bottomShadeOpacity }}
      />
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-2 font-orbitron text-[#F5C451]">
        <HugeiconsIcon icon={ChampionIcon} size={20} color="currentColor" strokeWidth={1.5} />
        #{rank}
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div className="flex items-center gap-2 font-orbitron text-[#C0C7D1]">
        <HugeiconsIcon icon={ChampionIcon} size={20} color="currentColor" strokeWidth={1.5} />
        #{rank}
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className="flex items-center gap-2 font-orbitron text-[#CD7F32]">
        <HugeiconsIcon icon={ChampionIcon} size={20} color="currentColor" strokeWidth={1.5} />
        #{rank}
      </div>
    )
  }

  return <span className="font-orbitron text-white/40">#{rank}</span>
}

export function Podium({ topThree }: { topThree: LeaderboardEntry[] }) {
  const getElectricColor = (rank: number) => {
    if (rank === 1) return '#f1d039'
    if (rank === 2) return '#abd8da'
    if (rank === 3) return '#a54b0f'
    return '#5227FF'
  }

  const getPodiumStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-white/20 backdrop-blur-xl border border-white/30',
          textColor: 'text-white',
          height: 'h-80',
          order: 'order-2',
        }
      case 2:
        return {
          bg: 'bg-white/15 backdrop-blur-xl border border-white/25',
          textColor: 'text-white',
          height: 'h-64',
          order: 'order-1',
        }
      case 3:
        return {
          bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
          textColor: 'text-white',
          height: 'h-56',
          order: 'order-3',
        }
      default:
        return {
          bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
          textColor: 'text-white',
          height: 'h-56',
          order: 'order-4',
        }
    }
  }

  const rankOrder: Record<number, number> = { 1: 0, 2: 1, 3: 2 }
  const sortedTopThree = [...topThree]
    .filter((entry) => [1, 2, 3].includes(entry.rank))
    .sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank])

  return (
    <div className="w-full">
      <div className="mb-16 flex flex-wrap items-end justify-center gap-6">
        {sortedTopThree.map((entry, index) => {
          const styles = getPodiumStyles(entry.rank)
          const rankLabel =
            entry.rank === 1 ? '1st place' : entry.rank === 2 ? '2nd place' : '3rd place'
          const avatarFallback = entry.username?.slice(0, 1).toUpperCase() ?? String(entry.rank)

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex flex-col items-center ${styles.order}`}
            >
              <div className="mb-4">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#B88A35] text-4xl shadow-lg">
                    {avatarFallback}
                  </div>
                )}
              </div>

              <ElectricBorder
                color={getElectricColor(entry.rank)}
                speed={1}
                chaos={0.12}
                borderRadius={24}
                className="rounded-3xl"
              >
                <div
                  className={`${styles.bg} ${styles.textColor} ${styles.height} flex w-48 flex-col items-center justify-center rounded-3xl px-6 py-8 shadow-2xl`}
                >
                  <div className="mb-6 rounded-full bg-black/80 px-4 py-2 text-sm font-bold text-white">
                    {rankLabel}
                  </div>
                  <div className="text-center font-orbitron text-4xl font-bold">
                    {entry.xp.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs opacity-75">XP</div>
                  <div className="mt-4 text-center text-sm font-semibold opacity-90">
                    {entry.username}
                  </div>
                </div>
              </ElectricBorder>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
