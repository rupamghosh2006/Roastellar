'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { PredictionPanel } from '@/components/PredictionPanel'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Clock, Users, Trophy, Flame } from 'lucide-react'

export default function BattleRoomPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string

  const [battle, setBattle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roastText, setRoastText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [winner, setWinner] = useState<any>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/')
    }
  }, [isLoaded, isSignedIn, router])

  // Fetch battle data
  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const response = await api.get(`/battles/${battleId}`)
        setBattle(response.data.data)
      } catch (error) {
        toast.error('Failed to load battle')
        router.replace('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchBattle()
  }, [battleId, router])

  // Timer
  useEffect(() => {
    if (battle?.status !== 'active' || timeRemaining === 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev - 1 === 0) {
          // Battle ends
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [battle, timeRemaining])

  const handleJoinBattle = async () => {
    if (!battle) return
    setIsSubmitting(true)
    try {
      await api.post(`/battles/join/${battle.matchId}`)
      setBattle({ ...battle, status: 'active' })
      toast.success('Joined battle!')
    } catch (error) {
      toast.error('Failed to join battle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRoast = async () => {
    if (!roastText.trim()) {
      toast.error('Write a roast first!')
      return
    }

    setIsSubmitting(true)
    try {
      // Upload roast to IPFS and submit
      const roastCid = await api.post('/uploads/ipfs', { data: { roast: roastText } })
      await api.post(`/battles/submit-roast/${battle.matchId}`, {
        roastCid: roastCid.data.data.cid,
      })
      toast.success('Roast submitted!')
      setRoastText('')
      // Refresh battle data
      const response = await api.get(`/battles/${battle.matchId}`)
      setBattle(response.data.data)
    } catch (error) {
      toast.error('Failed to submit roast')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (selectedPlayer: string) => {
    try {
      await api.post(`/battles/vote/${battle.matchId}`, { selectedPlayer })
      toast.success('Vote cast!')
      // Refresh battle data
      const response = await api.get(`/battles/${battle.matchId}`)
      setBattle(response.data.data)
    } catch (error) {
      toast.error('Failed to cast vote')
    }
  }

  const handlePredict = async (playerName: string, amount: number) => {
    try {
      // In a real app, this would be an actual prediction API call
      toast.success(`Predicted ${amount} XLM on ${playerName}!`)
    } catch (error) {
      toast.error('Failed to place prediction')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block p-4 rounded-lg bg-card animate-spin mb-4">
                <Flame className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground">Loading battle...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Battle not found</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const isSpectator = battle.status !== 'active' || (battle.player1 && battle.player2)
  const player1Name = typeof battle.player1 === 'string' ? battle.player1 : battle.player1?.username
  const player2Name = typeof battle.player2 === 'string' ? battle.player2 : battle.player2?.username || 'Waiting...'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Battle Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2">Battle #{battle.matchId}</h1>
              <p className="text-lg text-muted-foreground">{battle.topic}</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Battle Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Timer and Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="text-lg font-semibold">Time Remaining</span>
                    </div>
                    <span className="text-4xl font-bold text-accent">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </motion.div>

                {/* Players Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {/* Player 1 */}
                  <div className="glass rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
                        P1
                      </div>
                      <div>
                        <h3 className="font-bold">{player1Name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {battle.votesPlayer1} votes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                      <div className="flex-1 bg-card rounded-full overflow-hidden h-2">
                        <motion.div
                          animate={{
                            width:
                              battle.votesPlayer1 + battle.votesPlayer2 > 0
                                ? `${(battle.votesPlayer1 / (battle.votesPlayer1 + battle.votesPlayer2)) * 100}%`
                                : '0%',
                          }}
                          className="h-full gradient-primary"
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {battle.votesPlayer1 + battle.votesPlayer2 > 0
                          ? Math.round(
                              (battle.votesPlayer1 / (battle.votesPlayer1 + battle.votesPlayer2)) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {battle.roast1Cid ? '✓ Roast submitted' : 'Waiting for roast...'}
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="glass rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-lg font-bold">
                        P2
                      </div>
                      <div>
                        <h3 className="font-bold">{player2Name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {battle.votesPlayer2} votes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                      <div className="flex-1 bg-card rounded-full overflow-hidden h-2">
                        <motion.div
                          animate={{
                            width:
                              battle.votesPlayer1 + battle.votesPlayer2 > 0
                                ? `${(battle.votesPlayer2 / (battle.votesPlayer1 + battle.votesPlayer2)) * 100}%`
                                : '0%',
                          }}
                          className="h-full gradient-accent"
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {battle.votesPlayer1 + battle.votesPlayer2 > 0
                          ? Math.round(
                              (battle.votesPlayer2 / (battle.votesPlayer1 + battle.votesPlayer2)) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {battle.roast2Cid ? '✓ Roast submitted' : 'Waiting for roast...'}
                    </div>
                  </div>
                </motion.div>

                {/* Roast Submission */}
                {!isSpectator && battle.status === 'open' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-lg p-6"
                  >
                    <h3 className="font-bold mb-4">Join and Submit Your Roast</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleJoinBattle}
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-lg gradient-primary text-primary-foreground font-bold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Joining...' : 'Join Battle'}
                    </motion.button>
                  </motion.div>
                )}

                {battle.status === 'active' && !isSpectator && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-lg p-6"
                  >
                    <h3 className="font-bold mb-4">Your Roast</h3>
                    <textarea
                      value={roastText}
                      onChange={(e) => setRoastText(e.target.value)}
                      placeholder="Craft your wittiest roast here... Make it count!"
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-lg bg-card border border-card focus:border-primary focus:outline-none transition resize-none"
                      rows={6}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        {roastText.length}/500
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmitRoast}
                        disabled={isSubmitting || roastText.length === 0}
                        className="px-8 py-3 rounded-lg gradient-primary text-primary-foreground font-bold disabled:opacity-50 transition"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Roast'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Voting Section */}
                {battle.status === 'active' && isSpectator && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-lg p-6"
                  >
                    <h3 className="font-bold mb-4">Cast Your Vote</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVote(player1Name)}
                        className="p-6 rounded-lg border-2 border-primary/50 hover:border-primary transition"
                      >
                        <p className="font-bold">{player1Name}</p>
                        <Trophy className="w-5 h-5 text-primary mx-auto mt-2" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVote(player2Name)}
                        className="p-6 rounded-lg border-2 border-secondary/50 hover:border-secondary transition"
                      >
                        <p className="font-bold">{player2Name}</p>
                        <Trophy className="w-5 h-5 text-secondary mx-auto mt-2" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Sidebar - Predictions */}
              <div>
                <PredictionPanel
                  player1Name={player1Name}
                  player2Name={player2Name}
                  onPredict={handlePredict}
                  isSpectator={isSpectator}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinnerModal && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-lg p-8 max-w-md w-full text-center"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🏆
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Battle Complete!</h2>
              <p className="text-xl text-accent font-bold mb-6">{winner} Wins!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-bold"
              >
                Back to Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
