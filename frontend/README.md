# Ctrl + Alt + Defend — Frontend

A multiplayer mobile browser-based castle defence game. 3 players per team, each on their own device, defending a castle together in real time using verbal communication only.

For the full game design spec see `.claude/docs/game-spec.md`.

## Stack

- **Next.js** (App Router) — frontend framework
- **Supabase** — Postgres database + Realtime event bus
- **TanStack Query** — data fetching and mutations
- **shadcn/ui** — component library
- **Tailwind CSS** — styling
- **TypeScript** — strict mode throughout

## Prerequisites

- Node.js 18+
- A Supabase project with the schema from `.claude/docs/schema.sql` applied

## Environment Setup

Create a `.env.local` file in this directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Commands

```bash
npm install
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

---

## Running a Local Session

The game requires 3 players with 3 different roles. To simulate this locally, open **3 browser tabs** — one per role.

### 1. Start the dev server

```bash
cd frontend
npm run dev
```

### 2. Set up the session

In each tab, go to `http://localhost:3000` and:

1. Enter the **same team name** and **same room code** across all 3 tabs
2. Pick a **different role** in each tab (Builder, Artillery, Alchemist)
3. Each tab lands in the lobby — once all 3 roles are joined, start the game

### 3. Play the game

Each tab represents a different player's screen. The roles are interdependent — here's the order things need to happen:

**Wave start:**
- **Builder** — place weapons in lanes to give Artillery something to fire. Each weapon costs resources. Resources regenerate slowly, so spend them early.
- **Alchemist** — check the radar for incoming enemy types and start brewing ammo in your available brew slots. Brewing takes time, so start immediately.
- **Artillery** — assign personnel to built weapons. Each person can either fire or maintain — not both. Wait for Alchemist to deliver ammo before firing.

**During the wave:**
- **Alchemist** calls out which lane enemies are coming from and what type (sea / land / air). Radar accuracy starts at 0% in wave 1 — enemy type is hidden until accuracy improves.
- **Artillery** loads the correct ammo type onto weapons covering that lane, then fires. Wrong ammo type does significantly reduced damage.
- **Builder** watches lane HP bars. If a lane is taking damage, reinforce it or reposition a weapon. If a weapon hits zero durability, it is destroyed — rebuild it immediately or that lane is undefended.

**Between waves:**
- Ammo, brew slots, and personnel assignments reset. Weapons and lane HP persist.
- Builder gets a resource refill — good time to expand or upgrade.
- Alchemist's radar accuracy carries over and improves if correct ammo kills were made last wave.

**Lose condition:** any lane's HP hits zero = immediate game over.

---

## Project Structure

```
frontend/
  app/
    page.tsx                            # Landing — enter team name, room code, pick role
    lobby/[roomCode]/page.tsx           # Waiting room — shows ready state, start game
    game/
      layout.tsx                        # Landscape lock wrapper
      [roomCode]/builder/page.tsx       # Builder role screen
      [roomCode]/artillery/page.tsx     # Artillery role screen
      [roomCode]/alchemist/page.tsx     # Alchemist role screen
    reveal/[roomCode]/page.tsx          # Post-game role reveal + career explanation
    leaderboard/page.tsx                # Persistent leaderboard
  components/
    builder/         # Builder-specific components
    artillery/       # Artillery-specific components
    alchemist/       # Alchemist-specific components
    shared/          # BattlefieldView, PhaseBadge, useGameEngine hook
  engine/
    gameEngine.ts    # Core game loop — runs client-side, ticks every second
    enemySpawner.ts  # Wave + enemy generation logic
    scoring.ts       # Score calculation
    types.ts         # All shared game types
  config/
    gameConfig.ts    # All tunable game values — no magic numbers in game logic
  lib/
    supabase.ts      # Supabase client
    realtime.ts      # Realtime subscription helpers
```

## Architecture Notes

**Event bus** — player actions insert rows into `game_events`. All three clients subscribe to their room's Realtime channel and update local UI reactively. No server-side game logic.

**Client-side game engine** — the Builder client acts as session authority, publishing wave events, firing weapons, and managing timers. Other clients consume those events. All clients independently simulate enemy movement each tick for smooth rendering.

**Game config** — all tunable values (costs, timers, HP, damage, wave config, scoring) live in `config/gameConfig.ts`. Never hardcode game constants.

**Orientation** — all game screens are landscape-locked. A rotate prompt is shown in portrait mode, enforced in `app/game/layout.tsx`.

**UI pattern** — all 3 role screens share the same split layout: battlefield (left 70%) + context-aware action panel (right 30%). Tap to select, panel updates, act.
