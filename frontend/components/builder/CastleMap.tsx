"use client";
import { Card, CardContent } from "@/_shadcn/components/ui/card";
import { Button } from "@/_shadcn/components/ui/button";
import { Progress } from "@/_shadcn/components/ui/progress";
import { cn } from "@/_shadcn/lib/utils";
import { GAME_CONFIG } from "@/config/gameConfig";
import type { Wall, WallId } from "@/engine/types";

interface CastleMapProps {
  walls: Record<WallId, Wall>;
  resources: number;
  builderActionWalls: Set<string>; // wallId-slot keys currently in queue
  onBuild: (wallId: WallId, slot: 0 | 1) => void;
  onReinforce: (wallId: WallId) => void;
}

const WALL_LABELS: Record<WallId, string> = {
  north: "North",
  south: "South",
  east: "East",
  west: "West",
};

function hpIndicatorClass(hp: number, maxHp: number): string {
  const pct = hp / maxHp;
  if (pct > 0.6) return "[&>div]:bg-green-500";
  if (pct > 0.3) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

function durIndicatorClass(dur: number): string {
  if (dur > 60) return "[&>div]:bg-green-500";
  if (dur > 20) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

export function CastleMap({
  walls,
  resources,
  builderActionWalls,
  onBuild,
  onReinforce,
}: CastleMapProps) {
  const wallIds: WallId[] = ["north", "east", "south", "west"];

  return (
    <div className="grid grid-cols-2 gap-3">
      {wallIds.map((wallId) => {
        const wall = walls[wallId];
        const hpPct = (wall.hp / wall.maxHp) * 100;
        const critical = wall.hp / wall.maxHp < 0.3;

        return (
          <Card
            key={wallId}
            className={cn(
              "border-2",
              critical ? "border-destructive" : "border-border",
            )}
          >
            <CardContent className="py-3 px-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  {WALL_LABELS[wallId]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.ceil(wall.hp)} HP
                </span>
              </div>
              <Progress
                value={hpPct}
                className={cn("h-2", hpIndicatorClass(wall.hp, wall.maxHp))}
              />

              {/* Weapon slots */}
              <div className="space-y-1">
                {([0, 1] as const).map((slot) => {
                  const weapon = wall.weapons[slot];
                  const queueKey = `${wallId}-${slot}`;
                  const inQueue = builderActionWalls.has(queueKey);
                  const canBuild =
                    resources >= GAME_CONFIG.builder.costs.build && !inQueue;

                  if (!weapon || !weapon.exists) {
                    return (
                      <div key={slot} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex-1">
                          Slot {slot + 1}: empty
                        </span>
                        {!inQueue && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs px-2"
                            disabled={!canBuild}
                            onClick={() => onBuild(wallId, slot)}
                          >
                            Build ({GAME_CONFIG.builder.costs.build})
                          </Button>
                        )}
                        {inQueue && (
                          <span className="text-xs text-muted-foreground">
                            Building…
                          </span>
                        )}
                      </div>
                    );
                  }

                  const durPct =
                    (weapon.durability /
                      GAME_CONFIG.weapons.startingDurability) *
                    100;
                  const durCritical = durPct < 20;

                  return (
                    <div
                      key={slot}
                      className={cn(
                        "rounded p-1 border",
                        durCritical
                          ? "border-destructive"
                          : "border-transparent",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Slot {slot + 1} ·{" "}
                          <span className="font-mono">
                            {weapon.id.slice(-4)}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.ceil(weapon.durability)}%
                        </span>
                      </div>
                      <Progress
                        value={durPct}
                        className={cn("h-1.5", durIndicatorClass(weapon.durability))}
                      />
                    </div>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 text-xs"
                disabled={resources < GAME_CONFIG.builder.costs.reinforce}
                onClick={() => onReinforce(wallId)}
              >
                Reinforce ({GAME_CONFIG.builder.costs.reinforce})
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
