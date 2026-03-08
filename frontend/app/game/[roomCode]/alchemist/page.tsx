'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/_shadcn/components/ui/badge'
import { useGameEngine } from '@/components/shared/useGameEngine'
import { BattlefieldView } from '@/components/shared/BattlefieldView'
import { PhaseBadge } from '@/components/shared/PhaseBadge'
import { GameLoadingState } from '@/components/shared/GameLoadingState'
import { GameScreenLayout } from '@/components/shared/GameScreenLayout'
import { useGameOverRedirect } from '@/components/shared/useGameOverRedirect'
import { RadarPanel } from '@/components/alchemist/RadarPanel'
import { BrewPanel } from '@/components/alchemist/BrewPanel'
import { AmmoInventory } from '@/components/alchemist/AmmoInventory'
import { ROLE_META } from '@/constants/gameLabels'
import type { AmmoType, LaneId } from '@/engine/types'

export default function AlchemistPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { state, actions } = useGameEngine(roomCode, 'alchemist')
  const [selectedLane, setSelectedLane] = useState<LaneId | null>(null)

  useGameOverRedirect(state?.phase, roomCode)

  if (!state) return <GameLoadingState />

  const selectedLaneEnemyCount = selectedLane
    ? state.enemies.filter((e) => e.alive && e.targetLane === selectedLane).length
    : 0

  return (
    <GameScreenLayout
      scrollable
      battlefieldView={
        <BattlefieldView
          lanes={state.lanes}
          enemies={state.enemies}
          role="alchemist"
          radarAccuracy={state.radarAccuracy}
          selectedLaneId={selectedLane}
          onSelectLane={setSelectedLane}
        />
      }
      header={
        <>
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-sm">{ROLE_META['alchemist'].emoji} Wave {state.currentWave}</span>
            <PhaseBadge phase={state.phase} nextWaveAt={state.nextWaveAt} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Score: {state.score}</div>
            <Badge variant={state.radarAccuracy > 0 ? 'default' : 'outline'} className="text-xs">
              {state.radarAccuracy}% radar
            </Badge>
          </div>
        </>
      }
      actions={
        <>
          {selectedLane && selectedLaneEnemyCount > 0 && (
            <RadarPanel
              enemies={state.enemies.filter((e) => e.targetLane === selectedLane)}
              radarAccuracy={state.radarAccuracy}
            />
          )}
          <BrewPanel
            brewSlots={state.brewSlots}
            onBrew={(slotIndex: 0 | 1 | 2, ammoType: AmmoType) =>
              actions.startBrew(slotIndex, ammoType)
            }
          />
          <AmmoInventory inventory={state.ammoInventory} />
        </>
      }
    />
  )
}
