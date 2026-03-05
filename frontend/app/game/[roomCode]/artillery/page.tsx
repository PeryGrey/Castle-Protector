'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/_shadcn/components/ui/card'
import { useGameEngine } from '@/components/shared/useGameEngine'
import { PhaseBadge } from '@/components/shared/PhaseBadge'
import { PersonnelPool } from '@/components/artillery/PersonnelPool'
import { WeaponDashboard } from '@/components/artillery/WeaponDashboard'
import type { AmmoType, Weapon } from '@/engine/types'

export default function ArtilleryPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const router = useRouter()
  const { state, actions } = useGameEngine(roomCode, 'artillery')

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

  // Flatten all existing weapons across all walls
  const allWeapons: Weapon[] = Object.values(state.walls).flatMap((wall) =>
    wall.weapons.filter((w): w is Weapon => w !== null && w.exists)
  )

  // Read-only ammo inventory bar
  const { cannonballs, arrows, bolts } = state.ammoInventory

  return (
    <main className="min-h-screen px-4 py-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">🎯 Wave {state.currentWave}</span>
        <PhaseBadge phase={state.phase} nextWaveAt={state.nextWaveAt} />
        <span className="text-sm text-muted-foreground">Score: {state.score}</span>
      </div>

      {/* Ammo inventory summary */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-around text-base font-semibold">
            <span>🔮 {cannonballs}</span>
            <span>🏹 {arrows}</span>
            <span>⚡ {bolts}</span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1">Inventory</p>
        </CardContent>
      </Card>

      <PersonnelPool
        personnel={state.personnel}
        weapons={allWeapons}
        onAssign={(id, weaponId, mode) => actions?.assignPersonnel(id, weaponId, mode)}
        onUnassign={(id) => actions?.unassignPersonnel(id)}
      />

      <WeaponDashboard
        walls={state.walls}
        ammoInventory={state.ammoInventory}
        personnel={state.personnel}
        onLoadAmmo={(weaponId: string, ammoType: AmmoType) => actions?.loadAmmo(weaponId, ammoType)}
      />
    </main>
  )
}
