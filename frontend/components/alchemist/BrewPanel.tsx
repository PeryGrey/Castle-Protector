'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/_shadcn/components/ui/card'
import { Button } from '@/_shadcn/components/ui/button'
import { Progress } from '@/_shadcn/components/ui/progress'
import { Badge } from '@/_shadcn/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/_shadcn/components/ui/select'
import { GAME_CONFIG } from '@/config/gameConfig'
import type { BrewSlot, AmmoType } from '@/engine/types'

interface BrewPanelProps {
  brewSlots: BrewSlot[]
  onBrew: (slotIndex: 0 | 1 | 2, ammoType: AmmoType) => void
}

const AMMO_OPTIONS: { value: AmmoType; label: string }[] = [
  { value: 'cannonballs', label: `Cannonballs (${GAME_CONFIG.alchemist.brewTimePerAmmoType.cannonballs}s)` },
  { value: 'arrows', label: `Arrows (${GAME_CONFIG.alchemist.brewTimePerAmmoType.arrows}s)` },
  { value: 'bolts', label: `Bolts (${GAME_CONFIG.alchemist.brewTimePerAmmoType.bolts}s)` },
]

const AMMO_LABELS: Record<AmmoType, string> = {
  cannonballs: 'Cannonballs',
  arrows: 'Arrows',
  bolts: 'Bolts',
}

function ActiveBrewCard({ slot }: { slot: BrewSlot & { completesAt: number; ammoType: AmmoType } }) {
  const brewTime = GAME_CONFIG.alchemist.brewTimePerAmmoType[slot.ammoType] * 1000
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [])

  const elapsed = Math.max(0, now - (slot.completesAt - brewTime))
  const pct = Math.min(100, (elapsed / brewTime) * 100)
  const secs = Math.max(0, Math.ceil((slot.completesAt - now) / 1000))

  return (
    <Card>
      <CardContent className="py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Slot {slot.slotIndex + 1}</span>
          <Badge variant="secondary">{AMMO_LABELS[slot.ammoType]}</Badge>
        </div>
        <Progress value={pct} className="h-3" />
        <p className="text-xs text-muted-foreground text-right">{secs}s remaining</p>
      </CardContent>
    </Card>
  )
}

function IdleBrewCard({
  slot,
  onBrew,
}: {
  slot: BrewSlot
  onBrew: (slotIndex: 0 | 1 | 2, ammoType: AmmoType) => void
}) {
  const [selected, setSelected] = useState<AmmoType | ''>('')

  return (
    <Card>
      <CardContent className="py-3 space-y-2">
        <span className="font-semibold text-sm">Slot {slot.slotIndex + 1}</span>
        <Select value={selected} onValueChange={(v) => setSelected(v as AmmoType)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Choose ammo type…" />
          </SelectTrigger>
          <SelectContent>
            {AMMO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="w-full h-12 text-base font-semibold"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onBrew(slot.slotIndex, selected as AmmoType)
              setSelected('')
            }
          }}
        >
          Brew
        </Button>
      </CardContent>
    </Card>
  )
}

export function BrewPanel({ brewSlots, onBrew }: BrewPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
        Brew Slots
      </p>
      {brewSlots.map((slot) =>
        slot.completesAt !== null && slot.ammoType !== null ? (
          <ActiveBrewCard
            key={slot.slotIndex}
            slot={slot as BrewSlot & { completesAt: number; ammoType: AmmoType }}
          />
        ) : (
          <IdleBrewCard key={slot.slotIndex} slot={slot} onBrew={onBrew} />
        )
      )}
    </div>
  )
}
