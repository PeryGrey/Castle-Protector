"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { GamePhase } from "@/engine/types";

export function useGameOverRedirect(
  phase: GamePhase | undefined,
  roomCode: string,
): void {
  const router = useRouter();
  useEffect(() => {
    if (phase === "game_over") {
      router.push(`/reveal/${roomCode}`);
    }
  }, [phase, roomCode, router]);
}
