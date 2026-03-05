'use client'
import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGameEngine } from '@/components/shared/useGameEngine'
import { PhaseBadge } from '@/components/shared/PhaseBadge'
import { ResourceMeter } from '@/components/builder/ResourceMeter'
import { CastleMap } from '@/components/builder/CastleMap'
import { BuildQueue } from '@/components/builder/BuildQueue'
import { GAME_CONFIG } from '@/config/gameConfig'
import type { WallId } from '@/engine/types'

export default function BuilderPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const router = useRouter()
  const { state, actions } = useGameEngine(roomCode, 'builder')

  useEffect(() => {
    if (state?.phase === 'game_over') {
      router.push(`/reveal/${roomCode}`)
    }
  }, [state?.phase, roomCode, router])

  // Build a set of wallId-slot keys that are currently in queue
  const builderActionWalls = useMemo(() => {
    if (!state) return new Set<string>()
    return new Set(
      state.builderActions
        .filter((a) => a.slot !== undefined)
        .map((a) => `${a.wallId}-${a.slot}`)
    )
  }, [state])

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
        <span className="font-bold text-lg">🏰 Wave {state.currentWave}</span>
        <PhaseBadge phase={state.phase} nextWaveAt={state.nextWaveAt} />
        <span className="text-sm text-muted-foreground">Score: {state.score}</span>
      </div>

      <ResourceMeter
        resources={state.resources}
        regenRate={GAME_CONFIG.builder.resourceRegenPerSecond}
      />

      <CastleMap
        walls={state.walls}
        resources={state.resources}
        builderActionWalls={builderActionWalls}
        onBuild={(wallId: WallId, slot: 0 | 1) => actions?.startBuild(wallId, slot)}
        onReinforce={(wallId: WallId) => actions?.reinforce(wallId)}
      />

      <BuildQueue actions={state.builderActions} />
    </main>
  )
}
