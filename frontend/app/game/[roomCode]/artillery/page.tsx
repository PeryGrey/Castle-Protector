'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useGameEngine } from '@/components/shared/useGameEngine'
import { BattlefieldView } from '@/components/shared/BattlefieldView'
import { PhaseBadge } from '@/components/shared/PhaseBadge'
import { GameLoadingState } from '@/components/shared/GameLoadingState'
import { GameScreenLayout } from '@/components/shared/GameScreenLayout'
import { useGameOverRedirect } from '@/components/shared/useGameOverRedirect'
import { PersonnelPool } from '@/components/artillery/PersonnelPool'
import { WeaponDashboard } from '@/components/artillery/WeaponDashboard'
import { AmmoInventory } from '@/components/alchemist/AmmoInventory'
import { ROLE_META } from '@/constants/gameLabels'
import { isActiveWeapon } from '@/lib/gameUtils'
import type { AmmoType, LaneId, Weapon } from '@/engine/types'

export default function ArtilleryPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { state, actions } = useGameEngine(roomCode, 'artillery')
  const [selectedLane, setSelectedLane] = useState<LaneId | null>(null)

  useGameOverRedirect(state?.phase, roomCode)

  if (!state) return <GameLoadingState />

  const allWeapons: Weapon[] = Object.values(state.lanes).flatMap((lane) =>
    lane.weapons.filter(isActiveWeapon)
  )

  return (
    <GameScreenLayout
      scrollable
      battlefieldView={
        <BattlefieldView
          lanes={state.lanes}
          enemies={state.enemies}
          role="artillery"
          radarAccuracy={0}
          selectedLaneId={selectedLane}
          onSelectLane={setSelectedLane}
          personnel={state.personnel}
        />
      }
      header={
        <>
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-sm">{ROLE_META['artillery'].emoji} Wave {state.currentWave}</span>
            <PhaseBadge phase={state.phase} nextWaveAt={state.nextWaveAt} />
          </div>
          <div className="text-xs text-muted-foreground">Score: {state.score}</div>
          <AmmoInventory inventory={state.ammoInventory} />
        </>
      }
      actions={
        <>
          <PersonnelPool
            personnel={state.personnel}
            weapons={allWeapons}
            onAssign={(id, weaponId, mode) => actions.assignPersonnel(id, weaponId, mode)}
            onUnassign={(id) => actions.unassignPersonnel(id)}
          />
          <WeaponDashboard
            lanes={state.lanes}
            ammoInventory={state.ammoInventory}
            personnel={state.personnel}
            onLoadAmmo={(weaponId: string, ammoType: AmmoType) => actions.loadAmmo(weaponId, ammoType)}
            filterLaneId={selectedLane ?? undefined}
          />
        </>
      }
    />
  )
}
