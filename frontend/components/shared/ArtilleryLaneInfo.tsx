"use client";
import { StatRow } from "@/components/shared/StatRow";
import { getHealthColorClass } from "@/lib/gameUtils";
import { AMMO_ICONS } from "@/constants/gameLabels";
import type { Lane, Personnel } from "@/engine/types";

interface ArtilleryLaneInfoProps {
  lane: Lane;
  personnel: [Personnel, Personnel, Personnel];
}

export function ArtilleryLaneInfo({ lane, personnel }: ArtilleryLaneInfoProps) {
  const hpPct = (lane.hp / lane.maxHp) * 100;
  const weapon = lane.weapons[0];
  const weaponExists = weapon !== null && weapon?.exists;
  const ammoShort =
    weaponExists && weapon?.ammoLoaded
      ? AMMO_ICONS[weapon.ammoLoaded]
      : "—";
  const assignedCount = weaponExists
    ? personnel.filter((p) => p.weaponId === weapon?.id).length
    : 0;

  return (
    <div className="w-full space-y-1.5">
      <StatRow
        label="Wall"
        value={hpPct}
        display={`${Math.ceil(lane.hp)}`}
        barClass={getHealthColorClass(hpPct)}
      />
      {/* Weapon status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{ammoShort}</span>
        <span>{weaponExists ? `×${assignedCount}` : "—"}</span>
      </div>
    </div>
  );
}
