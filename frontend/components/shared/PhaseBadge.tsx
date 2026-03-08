"use client";
import { Badge } from "@/_shadcn/components/ui/badge";
import { useCountdown } from "@/components/shared/useCountdown";
import type { GamePhase } from "@/engine/types";

interface PhaseBadgeProps {
  phase: GamePhase;
  nextWaveAt: number | null;
}

export function PhaseBadge({ phase, nextWaveAt }: PhaseBadgeProps) {
  const secs = useCountdown(phase === "between_waves" ? nextWaveAt : null);

  if (phase === "wave_active")
    return (
      <Badge
        variant="default"
        className="uppercase font-semibold text-black/60"
      >
        Wave Active
      </Badge>
    );
  if (phase === "between_waves")
    return (
      <Badge variant="secondary" className="uppercase font-semibold">
        Breather — {secs}s
      </Badge>
    );
  return (
    <Badge variant="destructive" className="uppercase font-semibold">
      Game Over
    </Badge>
  );
}
