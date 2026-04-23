'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Wallet, Check, ChevronRight, Sparkles, Zap, Star, Gift, X } from 'lucide-react';
import { GAME_CONFIG } from '@/lib/utils';
import { getWallet, airdrop } from '@/lib/api';

interface FlameToken {
  id: number;
  x: number;
  y: number;
}

const backgroundFlames: FlameToken[] = [
  { id: 1, x: 10, y: 0 },
  { id: 2, x: 30, y: 0 },
  { id: 3, x: 50, y: 0 },
  { id: 4, x: 70, y: 0 },
  { id: 5, x: 90, y: 0 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.duration);
  const [flames, setFlames] = useState<FlameToken[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [walletData, setWalletData] = useState<{ publicKey: string; balance: number } | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [spawning, setSpawning] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (!isGameActive || timeLeft <= 0 || score >= GAME_CONFIG.targetScore) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 100);
    }, 100);

    return () => clearTimeout(timer);
  }, [isGameActive, score, timeLeft]);

  useEffect(() => {
    if (!isGameActive) return;
    if (timeLeft <= 0 || score >= GAME_CONFIG.targetScore) {
      setIsGameActive(false);
      setShowVictory(true);
    }
  }, [isGameActive, timeLeft, score]);

  useEffect(() => {
    if (!isGameActive) return;

    const spawnTimer = setInterval(() => {
      const newFlame = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: -10,
      };
      setFlames((prev) => [...prev, newFlame]);

      setTimeout(() => {
        setFlames((prev) => prev.filter((f) => f.id !== newFlame.id));
      }, 3000);
    }, GAME_CONFIG.spawnInterval);

    return () => clearInterval(spawnTimer);
  }, [isGameActive]);

  const handleFlameClick = (id: number) => {
    setScore((prev) => prev + 1);
    setFlames((prev) => prev.filter((f) => f.id !== id));
  };

  const startGame = () => {
    setIsGameActive(true);
    setTimeLeft(GAME_CONFIG.duration);
    setScore(0);
    setFlames([]);
  };

  const handleWalletSetup = async () => {
    setIsLoadingWallet(true);
    try {
      const [wallet, _] = await Promise.all([
        getWallet(),
        airdrop(10000),
      ]);
      setWalletData(wallet);
    } catch (error) {
      console.error('Wallet error:', error);
      const mockWallet = {
        publicKey: 'GC3VUO5TLKAMUIRZAC76CDMDPDPJTLPU3MYTJSEUXLID56R6GJZR35EG',
        balance: 10000,
      };
      setWalletData(mockWallet);
    } finally {
      setIsLoadingWallet(false);
      setStep(3);
    }
  };

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setStep(1)} />,
    <GameStep
      key="game"
      score={score}
      timeLeft={timeLeft}
      flames={flames}
      isActive={isGameActive}
      onStart={startGame}
      onFlameClick={handleFlameClick}
    />,
    <VictoryReveal key="victory" onNext={handleWalletSetup} isLoading={isLoadingWallet} />,
    <WalletReveal key="wallet" data={walletData} onEnter={() => router.push('/dashboard')} />,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
      >
        <Flame className="w-12 h-12 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-4"
      >
        Welcome to Roastellar
      </motion.h1>

      <p className="text-muted-foreground mb-8 text-lg">
        Before entering the arena, complete your first challenge
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 font-semibold text-lg"
      >
        Start Challenge
      </motion.button>
    </div>
  );
}

function GameStep({
  score,
  timeLeft,
  flames,
  isActive,
  onStart,
  onFlameClick,
}: {
  score: number;
  timeLeft: number;
  flames: FlameToken[];
  isActive: boolean;
  onStart: () => void;
  onFlameClick: (id: number) => void;
}) {
  return (
    <div className="text-center">
      {!isActive ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Tap the Flame</h2>
          <p className="text-muted-foreground mb-8">
            Tap {GAME_CONFIG.targetScore} flames in {GAME_CONFIG.duration / 1000} seconds to win!
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 font-semibold text-lg"
          >
            Start Game
          </motion.button>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">
                {score}/{GAME_CONFIG.targetScore}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className={`text-3xl font-bold ${timeLeft < 3000 ? 'text-red-500' : ''}`}>
                {(timeLeft / 1000).toFixed(1)}s
              </div>
            </div>
          </div>

          <div className="relative h-96 bg-white/5 rounded-2xl overflow-hidden">
            {flames.map((flame) => (
              <motion.button
                key={flame.id}
                initial={{ y: -50, opacity: 1 }}
                animate={{ y: 350, opacity: 0 }}
                transition={{ duration: 3, ease: 'linear' }}
                onClick={() => onFlameClick(flame.id)}
                className="absolute w-12 h-12 bg-gradient-to-b from-orange-400 to-red-500 rounded-full flex items-center justify-center"
                style={{ left: `${flame.x}%` }}
              >
                <Flame className="w-6 h-6 text-white" />
              </motion.button>
            ))}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {score >= GAME_CONFIG.targetScore
              ? 'Challenge Complete!'
              : `Tap more flames!`}
          </div>
        </>
      )}
    </div>
  );
}

function VictoryReveal({
  onNext,
  isLoading,
}: {
  onNext: () => void;
  isLoading: boolean;
}) {
  const [showChest, setShowChest] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChest(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center">
      <AnimatePresence>
        {showChest ? (
          <motion.div
            key="chest"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center"
          >
            <Gift className="w-16 h-16 text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-3xl font-bold mb-4">Challenge Complete!</h2>
      <p className="text-muted-foreground mb-8 text-lg">
        You've earned your first victory. Now let's set up your wallet.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-lg disabled:opacity-50"
      >
        {isLoading ? 'Setting up wallet...' : 'Setup Wallet'}
      </motion.button>
    </div>
  );
}

function WalletReveal({
  data,
  onEnter,
}: {
  data: { publicKey: string; balance: number } | null;
  onEnter: () => void;
}) {
  if (!data) return null;

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center"
      >
        <Wallet className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold mb-2">Wallet Created!</h2>
      <p className="text-muted-foreground mb-8">Powered by Stellar</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8"
      >
        <div className="text-sm text-muted-foreground mb-2">Public Address</div>
        <div className="font-mono text-sm break-all">
          {data.publicKey.slice(0, 10)}...
          {data.publicKey.slice(-10)}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-gradient-to-r from-violet-900/20 to-blue-900/20 border border-violet-500/20 mb-8"
      >
        <div className="flex items-center justify-center gap-2 text-green-400">
          <Zap className="w-4 h-4" />
          <span className="font-semibold">{data.balance.toLocaleString()} Testnet XLM</span>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEnter}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-lg"
      >
        Enter Arena
        <ChevronRight className="inline ml-2 w-5 h-5" />
      </motion.button>
    </div>
  );
}