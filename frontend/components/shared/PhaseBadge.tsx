'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/_shadcn/components/ui/badge'

interface PhaseBadgeProps {
  phase: string
  nextWaveAt: number | null
}

export function PhaseBadge({ phase, nextWaveAt }: PhaseBadgeProps) {
  const [secs, setSecs] = useState(() =>
    nextWaveAt && phase === 'between_waves'
      ? Math.max(0, Math.ceil((nextWaveAt - Date.now()) / 1000))
      : 0
  )

  useEffect(() => {
    if (phase !== 'between_waves' || !nextWaveAt) return
    const update = () => setSecs(Math.max(0, Math.ceil((nextWaveAt - Date.now()) / 1000)))
    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [phase, nextWaveAt])

  if (phase === 'wave_active') return <Badge variant="default">Wave Active</Badge>
  if (phase === 'between_waves') return <Badge variant="secondary">Breather — {secs}s</Badge>
  return <Badge variant="destructive">Game Over</Badge>
}
