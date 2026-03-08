"use client";
import { hashEnemyReveal } from "@/lib/gameUtils";
import { ENEMY_TYPE_ICONS } from "@/constants/gameLabels";
import type { Lane, Enemy } from "@/engine/types";

interface AlchemistLaneInfoProps {
  lane: Lane;
  enemies: Enemy[];
  radarAccuracy: number;
}

export function AlchemistLaneInfo({
  lane: _lane,
  enemies,
  radarAccuracy,
}: AlchemistLaneInfoProps) {
  const aliveEnemies = enemies.filter(
    (e) => e.alive && e.targetLane === _lane.id,
  );

  if (aliveEnemies.length === 0) {
    return <div className="text-xs text-muted-foreground italic">Clear</div>;
  }

  const typeCounts: Record<string, number> = {};
  for (const e of aliveEnemies) {
    const key = hashEnemyReveal(e.id, radarAccuracy) ? e.type : "unknown";
    typeCounts[key] = (typeCounts[key] ?? 0) + 1;
  }

  return (
    <div className="w-full space-y-0.5">
      <div className="text-sm font-bold text-destructive">
        {aliveEnemies.length}
      </div>
      {Object.entries(typeCounts).map(([type, count]) => (
        <div key={type} className="text-xs text-muted-foreground">
          {ENEMY_TYPE_ICONS[type as keyof typeof ENEMY_TYPE_ICONS] ?? "?"} ×
          {count}
        </div>
      ))}
    </div>
  );
}
