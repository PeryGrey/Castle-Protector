"use client";
import { useState, useEffect } from "react";
import { cn } from "@/_shadcn/lib/utils";
import { Progress } from "@/_shadcn/components/ui/progress";
import { Badge } from "@/_shadcn/components/ui/badge";
import { GAME_CONFIG } from "@/config/gameConfig";
import type {
  Lane,
  LaneId,
  Enemy,
  Personnel,
  Role,
  BuilderAction,
} from "@/engine/types";

const LANE_IDS: LaneId[] = [
  "moat_left",
  "bridge_left",
  "bridge_right",
  "moat_right",
];

const LANE_LABELS: Record<LaneId, string> = {
  moat_left: "Moat L",
  bridge_left: "Bridge L",
  bridge_right: "Bridge R",
  moat_right: "Moat R",
};

const LANE_ICONS: Record<LaneId, string> = {
  moat_left: "🌊",
  bridge_left: "🌉",
  bridge_right: "🌉",
  moat_right: "🌊",
};

const TYPE_ICONS: Record<string, string> = {
  sea: "🌊",
  land: "🏃",
  air: "🦅",
};

function hpColorClass(pct: number) {
  if (pct > 60) return "[&>div]:bg-green-500";
  if (pct > 30) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

// ── Builder lane info (left info panel) ───────────────────────────────────────

function BuilderLaneInfo({
  lane,
  laneId,
  builderActions,
}: {
  lane: Lane;
  laneId: LaneId;
  builderActions: BuilderAction[];
}) {
  const totalMs = GAME_CONFIG.builder.timers.build * 1000;
  const [now, setNow] = useState(Date.now);

  const buildAction = builderActions.find(
    (a) => a.laneId === laneId && a.slot !== undefined,
  );
  useEffect(() => {
    if (!buildAction) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [buildAction]);

  const hpPct = (lane.hp / lane.maxHp) * 100;
  const critical = hpPct < 30;
  const weapon = lane.weapons[0];
  const weaponExists = weapon?.exists;

  const weaponBar = (() => {
    if (buildAction) {
      const remaining = Math.max(0, buildAction.completesAt - now);
      const pct = Math.min(
        100,
        Math.max(0, ((totalMs - remaining) / totalMs) * 100),
      );
      const secs = Math.ceil(remaining / 1000);
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
      {/* Wall — label [bar] value */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground shrink-0 w-8">Wall</span>
        <Progress
          value={hpPct}
          className={cn("flex-1 h-1.5", hpColorClass(hpPct))}
        />
        <span
          className={cn(
            "tabular-nums shrink-0 w-7 text-right",
            critical ? "text-destructive font-bold" : "text-muted-foreground",
          )}
        >
          {Math.ceil(lane.hp)}
        </span>
      </div>

      {/* Weapon — label [bar] value  OR  label — Empty */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground shrink-0 w-8">Wpn</span>
        {weaponBar ? (
          <>
            <Progress
              value={weaponBar.pct}
              className={cn("flex-1 h-1.5", weaponBar.className)}
            />
            <span className="tabular-nums shrink-0 w-7 text-right text-muted-foreground">
              {weaponBar.label}
            </span>
          </>
        ) : (
          <>
            <Progress value={0} className="flex-1 h-1.5" />
            <span className="tabular-nums shrink-0 w-7 text-right text-muted-foreground">
              —
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Artillery lane info (left info panel) ────────────────────────────────────

function ArtilleryLaneInfo({
  lane,
  personnel,
}: {
  lane: Lane;
  personnel: [Personnel, Personnel, Personnel];
}) {
  const hpPct = (lane.hp / lane.maxHp) * 100;
  const weapon = lane.weapons[0];
  const weaponExists = weapon !== null && weapon?.exists;
  const ammoShort =
    weaponExists && weapon?.ammoLoaded
      ? { cannonballs: "🔮", arrows: "🏹", bolts: "⚡" }[weapon.ammoLoaded]
      : "—";
  const assignedCount = weaponExists
    ? personnel.filter((p) => p.weaponId === weapon?.id).length
    : 0;

  return (
    <div className="w-full space-y-1.5">
      {/* Wall HP bar */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground shrink-0">Wall</span>
        <Progress
          value={hpPct}
          className={cn("flex-1 h-1.5", hpColorClass(hpPct))}
        />
        <span className="tabular-nums shrink-0 w-7 text-right text-muted-foreground">
          {Math.ceil(lane.hp)}
        </span>
      </div>

      {/* Weapon status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{ammoShort}</span>
        <span>{weaponExists ? `×${assignedCount}` : "—"}</span>
      </div>
    </div>
  );
}

// ── Artillery track (right track panel) ──────────────────────────────────────

function ArtilleryTrack({ lane, enemies }: { lane: Lane; enemies: Enemy[] }) {
  const laneEnemies = enemies.filter(
    (e) =>
      e.alive &&
      e.targetLane === lane.id &&
      e.position >= 0 &&
      e.position <= 100,
  );

  return (
    <div className="w-full h-full relative">
      {/* Horizontal center line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-border/50" />
      {/* Enemy markers — position 0 = right edge (spawned), 100 = left edge (castle) */}
      {laneEnemies.map((e) => (
        <span
          key={e.id}
          className="absolute top-1/2 -translate-y-1/2 text-sm leading-none"
          style={{ right: `${e.position}%` }}
        >
          👾
        </span>
      ))}
    </div>
  );
}

// ── Alchemist lane info (left info panel) ────────────────────────────────────

function AlchemistLaneInfo({
  lane,
  enemies,
  radarAccuracy,
}: {
  lane: Lane;
  enemies: Enemy[];
  radarAccuracy: number;
}) {
  const aliveEnemies = enemies.filter(
    (e) => e.alive && e.targetLane === lane.id,
  );

  if (aliveEnemies.length === 0) {
    return <div className="text-xs text-muted-foreground italic">Clear</div>;
  }

  const typeCounts: Record<string, number> = {};
  for (const e of aliveEnemies) {
    let hash = 5381;
    for (let i = 0; i < e.id.length; i++) {
      hash = ((hash << 5) + hash) ^ e.id.charCodeAt(i);
    }
    const pseudo = Math.abs(hash % 100);
    const key = pseudo < radarAccuracy ? e.type : "unknown";
    typeCounts[key] = (typeCounts[key] ?? 0) + 1;
  }

  return (
    <div className="w-full space-y-0.5">
      <div className="text-sm font-bold text-destructive">
        {aliveEnemies.length}
      </div>
      {Object.entries(typeCounts).map(([type, count]) => (
        <div key={type} className="text-xs text-muted-foreground">
          {TYPE_ICONS[type] ?? "?"} ×{count}
        </div>
      ))}
    </div>
  );
}

// ── Main BattlefieldView ─────────────────────────────────────────────────────

interface BattlefieldViewProps {
  lanes: Record<LaneId, Lane>;
  enemies: Enemy[];
  role: Role;
  radarAccuracy: number;
  selectedLaneId: LaneId | null;
  onSelectLane: (laneId: LaneId) => void;
  personnel?: [Personnel, Personnel, Personnel];
  builderActions?: BuilderAction[];
}

export function BattlefieldView({
  lanes,
  enemies,
  role,
  radarAccuracy,
  selectedLaneId,
  onSelectLane,
  personnel,
  builderActions = [],
}: BattlefieldViewProps) {
  return (
    <div className="h-full flex flex-col p-2 gap-2">
      {/* Direction hint */}
      <div className="shrink-0 flex items-center justify-end gap-1 px-1">
        <span className="text-[10px] text-muted-foreground/60 flex gap-0.5">
          <span className="animate-[pulse_1.2s_ease-in-out_0.8s_infinite]">
            ‹
          </span>
          <span className="animate-[pulse_1.2s_ease-in-out_0.4s_infinite]">
            ‹
          </span>
          <span className="animate-[pulse_1.2s_ease-in-out_0s_infinite]">
            ‹
          </span>
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wide">
          Enemy attack
        </span>
      </div>

      {/* 4 horizontal lane rows */}
      <div className="flex flex-col gap-1.5 flex-1">
        {LANE_IDS.map((laneId) => {
          const lane = lanes[laneId];
          const selected = selectedLaneId === laneId;
          const hpPct = (lane.hp / lane.maxHp) * 100;
          const critical = hpPct < 30;
          const aliveCount = enemies.filter(
            (e) => e.alive && e.targetLane === laneId,
          ).length;

          return (
            <button
              key={laneId}
              onClick={() => onSelectLane(laneId)}
              className={cn(
                "flex flex-row items-stretch rounded-lg border-2 text-left transition-colors w-full flex-1 overflow-hidden p-0",
                selected
                  ? "border-primary bg-primary/10"
                  : critical
                  ? "border-destructive/60 bg-destructive/5"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              {/* Left: info panel */}
              <div className="shrink-0 w-[40%] flex flex-col justify-center p-2 gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold leading-none">
                    {LANE_LABELS[laneId]}
                  </span>
                </div>

                {role === "builder" && (
                  <BuilderLaneInfo
                    lane={lane}
                    laneId={laneId}
                    builderActions={builderActions}
                  />
                )}
                {role === "artillery" && personnel && (
                  <ArtilleryLaneInfo lane={lane} personnel={personnel} />
                )}
                {role === "alchemist" && (
                  <AlchemistLaneInfo
                    lane={lane}
                    enemies={enemies}
                    radarAccuracy={radarAccuracy}
                  />
                )}
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-border shrink-0" />

              {/* Right: track panel */}
              <div className="flex-1 relative overflow-hidden">
                {/* Enemy count badge — top-left of track */}
                {role !== "builder" && aliveCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-1 left-1 z-10 text-xs px-1 py-0 h-4"
                  >
                    {aliveCount}
                  </Badge>
                )}

                {role === "artillery" && personnel && (
                  <ArtilleryTrack lane={lane} enemies={enemies} />
                )}

                {/* Builder + alchemist: subtle horizontal center line only */}
                {(role === "builder" || role === "alchemist") && (
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-border/30" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
