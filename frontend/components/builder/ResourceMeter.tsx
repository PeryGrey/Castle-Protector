'use client'
import { Progress } from '@/_shadcn/components/ui/progress'
import { Card, CardContent } from '@/_shadcn/components/ui/card'

interface ResourceMeterProps {
  resources: number
  regenRate: number
}

export function ResourceMeter({ resources, regenRate }: ResourceMeterProps) {
  const displayMax = 200
  const pct = Math.min(100, (resources / displayMax) * 100)

  return (
    <Card>
      <CardContent className="py-3 space-y-1">
        <div className="flex justify-between text-sm font-medium">
          <span>Resources</span>
          <span className="text-muted-foreground">
            {Math.floor(resources)} <span className="text-xs">(+{regenRate}/s)</span>
          </span>
        </div>
        <Progress value={pct} className="h-3" />
      </CardContent>
    </Card>
  )
}
