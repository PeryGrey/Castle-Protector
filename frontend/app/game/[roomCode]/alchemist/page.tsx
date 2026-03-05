'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGameEngine } from '@/components/shared/useGameEngine'
import { PhaseBadge } from '@/components/shared/PhaseBadge'
import { RadarPanel } from '@/components/alchemist/RadarPanel'
import { BrewPanel } from '@/components/alchemist/BrewPanel'
import { AmmoInventory } from '@/components/alchemist/AmmoInventory'
import type { AmmoType } from '@/engine/types'

export default function AlchemistPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const router = useRouter()
  const { state, actions } = useGameEngine(roomCode, 'alchemist')

  useEffect(() => {
    if (state?.phase === 'game_over') {
      router.push(`/reveal/${roomCode}`)
    }
  }, [state?.phase, roomCode, router])

  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading game…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">⚗️ Wave {state.currentWave}</span>
        <PhaseBadge phase={state.phase} nextWaveAt={state.nextWaveAt} />
        <span className="text-sm text-muted-foreground">Score: {state.score}</span>
      </div>

      <RadarPanel enemies={state.enemies} radarAccuracy={state.radarAccuracy} />

      <BrewPanel
        brewSlots={state.brewSlots}
        onBrew={(slotIndex: 0 | 1 | 2, ammoType: AmmoType) =>
          actions?.startBrew(slotIndex, ammoType)
        }
      />

      <AmmoInventory inventory={state.ammoInventory} />
    </main>
  )
}
