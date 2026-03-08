'use client'
import React from 'react'
import { Card, CardContent } from '@/_shadcn/components/ui/card'
import { Separator } from '@/_shadcn/components/ui/separator'
import { AMMO_ICONS, AMMO_LABELS, AMMO_TYPES } from '@/constants/gameLabels'
import type { AmmoType } from '@/engine/types'

interface AmmoInventoryProps {
  inventory: Record<AmmoType, number>
}

export function AmmoInventory({ inventory }: AmmoInventoryProps) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-around text-base font-semibold">
          {AMMO_TYPES.map((type, i) => (
            <React.Fragment key={type}>
              {i > 0 && <Separator orientation="vertical" className="h-4" />}
              <span>{AMMO_ICONS[type]} {inventory[type]}</span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-1">
          {AMMO_TYPES.map((t) => AMMO_LABELS[t]).join(' · ')}
        </p>
      </CardContent>
    </Card>
  )
}
