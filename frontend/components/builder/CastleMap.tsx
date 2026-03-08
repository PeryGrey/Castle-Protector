"use client";
import { useState, useEffect } from "react";
import { Button } from "@/_shadcn/components/ui/button";
import { cn } from "@/_shadcn/lib/utils";
import { GAME_CONFIG } from "@/config/gameConfig";
import type { Lane, LaneId, BuilderAction } from "@/engine/types";

interface CastleMapProps {
  lane: Lane;
  laneId: LaneId;
  resources: number;
  builderActions: BuilderAction[];
  onBuild: (laneId: LaneId, slot: 0) => void;
  onReinforce: (laneId: LaneId) => void;
}

const LANE_LABELS: Record<LaneId, string> = {
  moat_left: "Left Moat",
  bridge_left: "Left Bridge",
  bridge_right: "Right Bridge",
  moat_right: "Right Moat",
};

function BuildCountdown({ completesAt }: { completesAt: number }) {
  const [secs, setSecs] = useState(() =>
    Math.max(0, Math.ceil((completesAt - Date.now()) / 1000)),
  );
  useEffect(() => {
    const id = setInterval(
      () => setSecs(Math.max(0, Math.ceil((completesAt - Date.now()) / 1000))),
      500,
    );
    return () => clearInterval(id);
  }, [completesAt]);
  return <>{secs}s</>;
}

export function CastleMap({
  lane,
  laneId,
  resources,
  builderActions,
  onBuild,
  onReinforce,
}: CastleMapProps) {
  const critical = lane.hp / lane.maxHp < 0.3;
  const canReinforce = resources >= GAME_CONFIG.builder.costs.reinforce;

  const buildAction = builderActions.find(
    (a) => a.laneId === laneId && a.slot !== undefined,
  );
  const weapon = lane.weapons[0];
  const weaponExists = weapon?.exists;
  const canBuild = resources >= GAME_CONFIG.builder.costs.build && !buildAction;
  const durCritical = weaponExists && weapon.durability < 20;

  return (
    <div className="h-full flex flex-col gap-2">
      <p className="font-semibold text-sm px-1 shrink-0">
        {LANE_LABELS[laneId]}
      </p>

      {/* Wall — always actionable */}
      <Button
        variant={canReinforce ? "default" : "outline"}
        className={cn(
          "flex-1 w-full h-auto rounded-lg p-3 flex-col items-start justify-between whitespace-normal",
          !canReinforce &&
            (critical ? "border-destructive/70" : "cursor-not-allowed"),
        )}
        disabled={!canReinforce}
        onClick={() => onReinforce(laneId)}
      >
        <div className="w-full flex justify-between text-xs font-medium">
          <span
            className={cn(
              "uppercase",
              canReinforce ? "text-black/60" : "text-muted-foreground",
            )}
          >
            Wall
          </span>
          <span
            className={cn(
              "tabular-nums",
              canReinforce ? "text-black/60" : "text-muted-foreground",
              critical && "font-bold",
            )}
          >
            {Math.ceil(lane.hp)} / {lane.maxHp}
          </span>
        </div>
        <span className="text-2xl font-semibold">
          Reinforce · {GAME_CONFIG.builder.costs.reinforce}
        </span>
      </Button>

      {/* Weapon — three states */}
      {buildAction ? (
        <div className="flex-1 w-full rounded-lg border p-3 opacity-60 flex flex-col justify-between">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="uppercase">Weapon</span>
            <span className="tabular-nums">
              <BuildCountdown completesAt={buildAction.completesAt} />
            </span>
          </div>
          <span className="text-2xl font-medium text-muted-foreground">
            Building…
          </span>
        </div>
      ) : weaponExists ? (
        <div className="flex-1 w-full rounded-lg border p-3 flex flex-col justify-between">
          <div className="flex justify-between text-xs text-muted-foreground uppercase">
            <span className="uppercase">Weapon</span>
            <span
              className={cn(
                "tabular-nums",
                durCritical && "text-destructive font-bold",
              )}
            >
              {Math.ceil(weapon.durability)} / 100
            </span>
          </div>
          <span className="text-2xl text-muted-foreground">Operational</span>
        </div>
      ) : (
        <Button
          variant={canBuild ? "default" : "outline"}
          className="flex-1 w-full h-auto rounded-lg p-3 flex-col items-start justify-between whitespace-normal disabled:cursor-not-allowed"
          disabled={!canBuild}
          onClick={() => onBuild(laneId, 0)}
        >
          <div className="flex justify-between w-full text-xs font-medium uppercase">
            <span
              className={cn(
                "uppercase",
                canBuild ? "text-black/60" : "text-muted-foreground",
              )}
            >
              Weapon
            </span>
            <span
              className={canBuild ? "text-black/60" : "text-muted-foreground"}
            >
              —
            </span>
          </div>
          <span className="text-2xl font-semibold">
            Build · {GAME_CONFIG.builder.costs.build}
          </span>
        </Button>
      )}
    </div>
  );
}
