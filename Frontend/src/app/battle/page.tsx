'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BattlePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/battles')
  }, [router])

  return null
}