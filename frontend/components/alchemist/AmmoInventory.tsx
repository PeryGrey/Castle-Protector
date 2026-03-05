'use client'
import { Card, CardContent } from '@/_shadcn/components/ui/card'
import type { AmmoType } from '@/engine/types'

interface AmmoInventoryProps {
  inventory: Record<AmmoType, number>
}

export function AmmoInventory({ inventory }: AmmoInventoryProps) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-around text-base font-semibold">
          <span>🔮 {inventory.cannonballs}</span>
          <span>🏹 {inventory.arrows}</span>
          <span>⚡ {inventory.bolts}</span>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-1">
          Cannonballs · Arrows · Bolts
        </p>
      </CardContent>
    </Card>
  )
}
