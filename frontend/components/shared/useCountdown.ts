"use client";
import { useState, useEffect } from "react";

export function useCountdown(targetMs: number | null): number {
  const [secs, setSecs] = useState(() =>
    targetMs !== null
      ? Math.max(0, Math.ceil((targetMs - Date.now()) / 1000))
      : 0,
  );

  useEffect(() => {
    if (targetMs === null) return;
    const update = () =>
      setSecs(Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [targetMs]);

  return secs;
}
