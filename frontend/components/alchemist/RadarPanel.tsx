'use client'
import React, { useMemo } from 'react'
import { Card, CardContent } from '@/_shadcn/components/ui/card'
import { Badge } from '@/_shadcn/components/ui/badge'
import { Separator } from '@/_shadcn/components/ui/separator'
import { LANE_LABELS, ENEMY_TYPE_LABELS } from '@/constants/gameLabels'
import { hashEnemyReveal } from '@/lib/gameUtils'
import { SectionLabel } from '@/components/shared/SectionLabel'
import type { Enemy, LaneId } from '@/engine/types'

interface RadarPanelProps {
  enemies: Enemy[]
  radarAccuracy: number
}

export function RadarPanel({ enemies, radarAccuracy }: RadarPanelProps) {
  const revealMap = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const e of enemies) {
      if (e.alive) map.set(e.id, hashEnemyReveal(e.id, radarAccuracy))
    }
    return map
  }, [enemies, radarAccuracy])

  const byLane = useMemo(() => {
    const groups: Partial<Record<LaneId, Enemy[]>> = {}
    for (const e of enemies) {
      if (!e.alive) continue
      if (!groups[e.targetLane]) groups[e.targetLane] = []
      groups[e.targetLane]!.push(e)
    }
    for (const laneId of Object.keys(groups) as LaneId[]) {
      groups[laneId]!.sort((a, b) => b.position - a.position)
    }
    return groups
  }, [enemies])

  const lanesUnderAttack = Object.keys(byLane) as LaneId[]

  return (
    <Card>
      <CardContent className="py-3 space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Radar</SectionLabel>
          <Badge variant={radarAccuracy > 0 ? 'default' : 'outline'}>
            {radarAccuracy}% accuracy
          </Badge>
        </div>

        {lanesUnderAttack.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No enemies detected</p>
        )}

        {lanesUnderAttack.map((laneId) => (
          <div key={laneId} className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">
              {LANE_LABELS[laneId]}
            </p>
            {byLane[laneId]!.map((enemy, index) => {
              const typeRevealed = revealMap.get(enemy.id) ?? false
              return (
                <React.Fragment key={enemy.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between text-sm py-1">
                    <span>
                      {typeRevealed ? (
                        <Badge variant="default" className="text-xs">
                          {ENEMY_TYPE_LABELS[enemy.type]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Unknown
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(enemy.position)}% close
                    </span>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
