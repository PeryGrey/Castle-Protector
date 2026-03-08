"use client";
import { Progress } from "@/_shadcn/components/ui/progress";

interface ResourceMeterProps {
  resources: number;
  regenRate: number;
}

export function ResourceMeter({ resources, regenRate }: ResourceMeterProps) {
  const displayMax = 200;
  const pct = Math.min(100, (resources / displayMax) * 100);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Resources
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {Math.floor(resources)}
          <span className="text-xs font-normal text-muted-foreground ml-1">
            +{regenRate}/s
          </span>
        </span>
      </div>
      <Progress value={pct} className="h-3" />
    </div>
  );
}
