"use client";
import { GAME_CONFIG } from "@/config/gameConfig";
import { useCountdown } from "@/components/shared/useCountdown";
import { StatRow } from "@/components/shared/StatRow";
import { getHealthColorClass } from "@/lib/gameUtils";
import type { Lane, LaneId, BuilderAction } from "@/engine/types";

interface BuilderLaneInfoProps {
  lane: Lane;
  laneId: LaneId;
  builderActions: BuilderAction[];
}

export function BuilderLaneInfo({
  lane,
  laneId,
  builderActions,
}: BuilderLaneInfoProps) {
  const totalSecs = GAME_CONFIG.builder.timers.build;

  const buildAction = builderActions.find(
    (a) => a.laneId === laneId && a.slot !== undefined,
  );

  const secs = useCountdown(buildAction?.completesAt ?? null);

  const hpPct = (lane.hp / lane.maxHp) * 100;
  const critical = hpPct < 30;
  const weapon = lane.weapons[0];
  const weaponExists = weapon?.exists;

  const weaponBar = (() => {
    if (buildAction) {
      const pct = Math.min(100, Math.max(0, ((totalSecs - secs) / totalSecs) * 100));
      return { pct, label: `${secs}s`, className: "[&>div]:bg-violet-500" };
    }
    if (!weaponExists) return null;
    const pct =
      (weapon.durability / GAME_CONFIG.weapons.startingDurability) * 100;
    const label = `${Math.ceil(weapon.durability)}`;
    const className =
      weapon.durability < 20 ? "[&>div]:bg-red-500" : "[&>div]:bg-sky-500";
    return { pct, label, className };
  })();

  return (
    <div className="w-full space-y-1.5">
      <StatRow
        label="Wall"
        value={hpPct}
        display={`${Math.ceil(lane.hp)}`}
        barClass={getHealthColorClass(hpPct)}
        valueCritical={critical}
      />
      <StatRow
        label="Wpn"
        value={weaponBar?.pct ?? 0}
        display={weaponBar?.label ?? ""}
        barClass={weaponBar?.className}
        empty={!weaponBar}
      />
    </div>
  );
}
