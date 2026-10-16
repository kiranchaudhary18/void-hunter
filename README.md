<div align="center">

# 🚀 VOID HUNTER
### *SPACE COMBAT BEYOND LIMITS*

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-00E5FF?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Phaser](https://img.shields.io/badge/Game_Engine-Phaser_3-7C3AED?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-10B981?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_+_Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-FBBF24?style=for-the-badge)](LICENSE)

<br/>

<img src="client/public/favicon.svg" alt="Void Hunter Crest" width="130" height="130" />

<p align="center">
  <b>A production-grade, arcade space shooter connected to a hardened Node.js/Express backend and an auditable VELOOP Reward Economy.</b>
</p>

[🎮 Live Demo](#) • [📖 Documentation](#table-of-contents) • [⚡ Quickstart](#-quickstart--local-setup) • [🛡️ Economy & Anti-Cheat](#-the-veloop-reward-economy)

</div>

---

## 📑 Table of Contents
- [1. Executive Summary & Gameplay Loop](#-1-executive-summary--gameplay-loop)
- [2. Reference Game Comparison & Originality](#-2-reference-game-comparison--originality)
- [3. Dynamic Title & Configuration (Section 4 Compliance)](#-3-dynamic-title--configuration-section-4-compliance)
- [4. Game Engine & Combat Mechanics](#-4-game-engine--combat-mechanics)
  - [Controls](#desktop--mobile-controls)
  - [5 Ship Classes & 7 Upgrade Tracks](#5-ship-classes--7-upgrade-tracks)
  - [8 Mandatory Combat Power-Ups](#8-mandatory-combat-power-ups)
  - [5 Enemy Archetypes & 5 Multi-Phase Bosses](#5-enemy-archetypes--5-original-multi-phase-bosses)
  - [50 Data-Driven Missions across 5 Sectors](#50-data-driven-missions-across-5-sectors)
- [5. The VELOOP Reward Economy](#-5-the-veloop-reward-economy)
  - [4 Distinct Currencies](#4-distinct-currencies)
  - [Double-Entry Wallet Ledger](#double-entry-wallet-ledger)
  - [Rewarded Ad State Machine & Simulated Provider](#rewarded-ad-state-machine--simulated-provider)
  - [Monetization Placements](#core-ad-placements)
- [6. Anti-Cheat Engine & Session Lifecycle](#-6-anti-cheat-engine--session-lifecycle)
- [7. Design System & Brand Identity](#-7-design-system--brand-identity)
- [8. REST API Specification](#-8-rest-api-specification)
- [9. Database Architecture](#-9-database-architecture)
- [10. Quickstart & Local Setup](#-10-quickstart--local-setup)

---

## 🌌 1. Executive Summary & Gameplay Loop

**VOID HUNTER** is built around an engaging, continuous progression loop designed for high retention, skill mastery, and sustainable reward economics:

```
┌─────────────────┐      Start Run       ┌────────────────────────┐
│  Hangar / Ship  │ ───────────────────> │  Game Session Created  │
│  Selection      │                      │  (Unique Session ID)   │
└─────────────────┘                      └────────────────────────┘
         ▲                                           │
         │                                           ▼
┌─────────────────┐                       ┌──────────────────────┐
│ Ship Upgrades & │                       │ Real-Time 60 FPS     │
│ Hangar Unlocks  │                       │ Combat & Waves       │
└─────────────────┘                       └──────────────────────┘
         ▲                                           │
         │                                           ▼
┌─────────────────┐     Validate Run      ┌──────────────────────┐
│ Ledgered Wallet │ <──────────────────── │ Multi-Phase Boss /   │
│ & 2x Ad Claim   │   (Anti-Cheat Engine) │ Objective Complete   │
└─────────────────┘                       └──────────────────────┘
```

The application combines:
1. **React 19**: Responsive menus, hangar customization, mission selector, player dashboard, and wallet ledger.
2. **Phaser 3**: High-performance WebGL/Canvas game engine managing sprite pooling, bullet-hell trajectories, particle explosions, and collision groups.
3. **Node.js/Express + MongoDB**: Hardened backend enforcing mission validity, anti-cheat duration bounds, and double-entry transaction ledgers.

---

## 🔬 2. Reference Game Comparison & Originality

Per **Section 2 & 3** of the assignment specification, **VOID HUNTER** draws structural inspiration from arcade vertical space shooters like *Space Shooter: Galaxy Attack* (ONESOFT) while delivering **100% original assets, mechanics, and backend infrastructure**:

| Feature | Reference Model (*Space Shooter*) | VOID HUNTER (Our Implementation) |
| :--- | :--- | :--- |
| **Visuals & Art** | Proprietary alien insectoid sprites | **Original Procedural & Custom Sci-Fi Vectors** (Deep Space theme) |
| **Title & Branding** | Hardcoded title | **Dynamic Environment Rebranding** (`VITE_GAME_NAME` & `GAME_NAME`) |
| **Economy Authority**| Primarily client-simulated | **Server-Authoritative Double-Entry Ledger** (MongoDB) |
| **Ad Verification** | Client-triggered ad calls | **9-State Ad Machine** (`OFFERED` $\to$ `GRANTED`) with local simulated adapter |
| **Progression Engine**| Level maps with basic stars | **50 Data-Driven Missions** with 7 diverse objective archetypes |
| **Anti-Cheat** | Basic client storage | **Server-side Duration, Kill Bounds, and Score Verification** |

---

## ⚙️ 3. Dynamic Title & Configuration (Section 4 Compliance)

The game title is **never hardcoded**. It is injected dynamically via environment variables across both frontend and backend:

* **Frontend (`client/.env`)**:
  ```env
  VITE_GAME_NAME=VOID HUNTER
  VITE_GAME_TAGLINE=Space Combat Beyond Limits
  VITE_API_URL=http://localhost:5000/api
  ```
  *Centralized in `client/src/config/gameConfig.js`.*

* **Backend (`server/.env`)**:
  ```env
  GAME_NAME=VOID HUNTER
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/void_hunter
  ```
  *Centralized in `server/src/config/gameConfig.js`.*

> **Evaluation Test**: Changing `VITE_GAME_NAME=GALAXY COMMANDER` updates the browser title, hero banners, headers, and metadata across the entire application upon rebuild without modifying any component.

---

## 🎮 4. Game Engine & Combat Mechanics

### Desktop & Mobile Controls
* **Desktop**:
  * Movement: `W`, `A`, `S`, `D` or `Arrow Keys`
  * Primary Fire: `Spacebar` or `Left Mouse Click` (Hold for auto-fire)
  * Power-Ups: Keys `1`, `2`, `3`, `4`
  * Pause / Resume: `P` or `Esc`
* **Mobile / Touch**:
  * Movement: Responsive touch drag or left-side **Virtual Floating Joystick**
  * Primary Fire: Automatic continuous fire while moving
  * Abilities: Dedicated right-hand action HUD buttons (Missiles, Shield, EMP)

---

### 5 Ship Classes & 7 Upgrade Tracks

Players unlock and command 5 distinct starship classes, each modifying flight physics, weapon patterns, and defensive capabilities:

```
1. V-01 ORBITRON  ─── [Balanced Fighter]   ── Balanced speed, shield, and twin lasers.
2. S-02 PHOENIX   ─── [Striker Class]      ── High damage plasma bursts, reduced shields.
3. X-03 SHADOW    ─── [Interceptor]        ── Ultra-high agility, evasion, and rapid fire.
4. R-04 TITAN     ─── [Guardian Class]     ── Reinforced hull plating and heavy shield absorbers.
5. Z-05 NOVA      ─── [Experimental Craft] ── Quantum warp drive, antimatter spiral cannons.
```

#### Upgradable Attributes (Atomic Server-Validated Purchases):
1. **Weapon Damage** (Increases primary cannon projectile DPS)
2. **Firing Rate** (Decreases delay between consecutive shots)
3. **Maximum Health** (Expands hull integrity pool)
4. **Shield Capacity** (Increases shield absorption threshold)
5. **Movement Speed** (Enhances ship thruster velocity)
6. **Ability Cooldown** (Reduces cooldown period for power-ups)
7. **Projectile Velocity** (Increases bullet speed and hit reliability)

---

### 8 Mandatory Combat Power-Ups

All 8 power-ups function as real-time combat abilities with strict durations and cooldowns:

| # | Power-Up | Type | In-Game Effect | Duration | Cooldown |
| :-: | :--- | :--- | :--- | :-: | :-: |
| 1 | **Shield Pulse** | Active | Generates a temporary invulnerability bubble deflecting projectiles | 8s | 25s |
| 2 | **Rapid Fire** | Active | Multiplies fire rate by 2.2x, restoring normal speed on expiry | 10s | 20s |
| 3 | **Spread Shot** | Active | Converts single laser into a 5-way spread cannon | 12s | 22s |
| 4 | **Homing Missiles** | Active | Launches 4 auto-targeting micro-rockets that track elite enemies | 8s | 30s |
| 5 | **EMP Blast** | Active | Screen-wide shockwave clearing hostile bullets and stunning enemies | 1s | 35s |
| 6 | **Repair Drone** | Active | Deploys nanite drone restoring 35% hull up to max health cap | 6s | 40s |
| 7 | **Overdrive** | Active | Boosts speed, damage, and fire rate by 40% simultaneously | 10s | 45s |
| 8 | **Emergency Warp** | Active | Instantly blinks the ship to a safe coordinates with 1.5s i-frames | 2s | 50s |

---

### 5 Enemy Archetypes & 5 Original Multi-Phase Bosses

#### Enemy Fleet
* **Scout Fighter**: Swift straight-line dive attacks with single blaster fire.
* **Interceptor**: Sweeping arc maneuvers that flank player positioning.
* **Armored Cruiser**: High-health heavy ships firing spread shot clusters.
* **Long-Range Gunship**: Stays at top perimeter firing targeted sniper laser beams.
* **Elite Enemy**: Dodges incoming fire and unleashes radial spiral projectile rings.

#### 5 Multi-Phase Boss Battles
1. **Sector 1 — Orion Dreadnought**: Twin heavy laser batteries and frontal missile salvo.
2. **Sector 2 — Crimson Colossus**: High-armor leviathan with plasma shockwaves and turret phases.
3. **Sector 3 — Glacial Leviathan**: Ice-shard spiral bullet storms and sweeping laser beam sweeps.
4. **Sector 4 — Rift Annihilator**: Teleports across screen quadrants, summoning rift escort drones.
5. **Sector 5 — Void Overlord**: Final multi-phase bullet-hell encounter with 3 distinct dynamic phases.

---

### 50 Data-Driven Missions across 5 Sectors

The campaign is partitioned into 5 unique planetary sectors containing **50 data-driven missions**:
* **Sector 1: Nebula Outpost** (Missions 01–10) — *Beginner / Flight Training*
* **Sector 2: Dark Orbit** (Missions 11–20) — *Easy / Fleet Skirmishes*
* **Sector 3: Asteroid Belt** (Missions 21–30) — *Medium / Environmental Hazards*
* **Sector 4: Void Rift** (Missions 31–40) — *Hard / Tactical Combat*
* **Sector 5: Final Frontier** (Missions 41–50) — *Expert / Elite Bullet-Hell*

#### 7 Diverse Objective Archetypes:
* `destroy_enemies`: Eliminate a target number of enemy combatants.
* `survive_duration`: Survive continuous waves for a set time limit.
* `defeat_boss`: Defeat the sector flagship boss encounter.
* `escort_target`: Protect a friendly transport vessel across the sector.
* `collect_items`: Gather dropped energy cores or mission intel pods.
* `limited_damage`: Complete the stage with hull integrity above 75%.
* `time_attack`: Complete the mission under a strict time threshold.

---

## 💰 5. The VELOOP Reward Economy

### 4 Distinct Currencies

```
┌─────────────────┐  Spendable on Ship Upgrades, Power-Ups, and Hangar Repairs
│  1. CREDITS     │  Earned from defeating enemies, mission completion, and 2x ads.
└─────────────────┘
┌─────────────────┐  Rare progression currency for unlocking high-tier starships.
│ 2. ENERGY CORES │  Earned exclusively from boss encounters and sector milestones.
└─────────────────┘
┌─────────────────┐  Player progression metric. Unlocks higher mission tiers and
│     3. XP       │  hangar items (non-spendable).
└─────────────────┘
┌─────────────────┐  Separate platform-eligible reward balance subject to VELOOP's
│ 4. REWARD COINS │  strict compliance and external payout rules.
└─────────────────┘
```

---

### Double-Entry Wallet Ledger

Every credit and debit event creates an immutable record in the `WalletTransaction` collection:
* `userId`: Player account reference
* `transactionType`: `CREDIT` or `DEBIT`
* `amount`: Transaction value
* `balanceBefore` & `balanceAfter`: Balance state verification
* `source`: `MISSION_REWARD`, `SHIP_UPGRADE`, `AD_DOUBLE_CREDITS`, `DAILY_LOGIN`
* `referenceId`: Linked mission session ID or purchase event ID (Enforces Idempotency)

---

### Rewarded Ad State Machine & Simulated Provider

Rewarded advertising events strictly follow a **9-state finite state machine** to eliminate double-claim exploits and unverified payouts:

```
[ OFFERED ] ──> [ REQUESTED ] ──> [ AD_STARTED ] ──> [ AD_COMPLETED ]
                                                            │
                                                            ▼
[ GRANTED ] <── [ VERIFIED ] <── [ VERIFYING ] <────────────┘
     │
     └──> [ REJECTED ] (if validation fails or session expires)
```

#### Local Development Simulated Ad Provider:
For local development and evaluator grading, an interactive modal simulates video playback with:
* Real-time countdown timer (5–10s)
* Skip-prevention logic
* Cryptographic signature / verification callback simulation
* Error injection mode to test reward denial upon premature closure

#### Core Ad Placements:
1. **Defeat Revive**: Grants emergency hull/shield checkpoint revival (Capped at 3/day).
2. **Double Credits**: Doubles verified mission credit rewards upon victory (Capped at 5/day).
3. **Double Score**: Multiplies verified final score for leaderboard climb (Capped at 5/day).

---

## 🛡️ 6. Anti-Cheat Engine & Session Lifecycle

The browser client is **never trusted** as the sole authority for mission outcomes:

1. **Session Initialization**: `POST /api/games/start` generates an active `GameSession` containing start timestamp and initial player state.
2. **Session Finalization**: `POST /api/games/:sessionId/complete` submits end-of-mission telemetry.
3. **Server-Side Validation**:
   * **Duration Bounds**: Rejects missions finished faster than the physical minimum wave duration.
   * **Kill Count Bounds**: Validates that reported enemy kills do not exceed the actual number spawned.
   * **Score Bounds**: Ensures score calculation adheres to mathematical theoretical ceilings.
   * **Idempotency Guard**: Rejects replayed submissions for sessions already in `COMPLETED` state.

---

## 🎨 7. Design System & Brand Identity

Built with an original AAA cyberpunk sci-fi aesthetic matching the official branding guide:

```
  DEEP SPACE         COSMIC PURPLE        NEON CYAN         MAGENTA          CREDIT GOLD
   #0A0F2C              #7C3AED            #00E5FF          #FF2DFF            #FBBF24
┌──────────────┐     ┌──────────────┐   ┌──────────────┐ ┌──────────────┐   ┌──────────────┐
│  Background  │     │ Primary Brand│   │Action Buttons│ │ Boss Alerts  │   │   Currency   │
└──────────────┘     └──────────────┘   └──────────────┘ └──────────────┘   └──────────────┘
```

* **Typography**:
  * **Headings**: `Orbitron` (Futuristic geometric display font)
  * **UI & Subtitles**: `Exo 2` (High-legibility cybernetic sans)
  * **Body Text**: `Inter` (Optimized readability for stats & ledgers)
* **Glassmorphism**: Translucent frosted glass containers with cyan/purple neon highlights.

---

## 🖥️ 8. Complete 10-Screen UI/UX Architecture

The frontend provides a cohesive 10-screen visual journey adhering to the cosmic cyberpunk design system:

| # | Screen | Component | Key Features & Interactions |
| :-: | :--- | :--- | :--- |
| **1** | **Main Menu Landing** | `MainMenuPage.jsx` | Cinematic title backdrop, ambient audio synthesizer toggle (`SoundManager`), mission launch CTA, and quick-route status cards. |
| **2** | **Pilot Dossier / Auth** | `AuthPage.jsx` | Dual-mode JWT registration/login, live credential validation, callsign allocation, and session token persistence. |
| **3** | **Command Deck Dashboard** | `DashboardPage.jsx` | Central player hub displaying equipped starship render, 4 live currency stats, operational links, and combat quick-launch. |
| **4** | **Mission Selection Grid** | `MissionsPage.jsx` | 5 sector tabs (`Sector 1` to `Sector 5`), 50 data-driven mission cards, star ratings, boss alerts, and level requirements. |
| **5** | **Starship Hangar** | `HangarPage.jsx` | 5 distinct ship classes (`Orbitron`, `Phoenix`, `Shadow`, `Titan`, `Nova`), modular upgrade paths, attribute meters, and real-time ledger purchasing. |
| **6** | **Combat Arena HUD** | `GameContainer.jsx` | 60 FPS Phaser 3 canvas with React HUD overlay: dynamic boss health bar, score multipliers, lives counter, and weapon status. |
| **7** | **Mission Results Debrief**| `GameContainer.jsx` | Victory/Defeat modal displaying kill counts, star rating, verified ledger payout, and 2x Rewarded Ad claim CTA. |
| **8** | **VELOP Economy Ledger**| `WalletPage.jsx` | Cryptographic multi-currency balances, filterable immutable transaction table, and interactive simulated ad player. |
| **9** | **Daily Quests & Merits** | `QuestsPage.jsx` | 24h UTC reset countdown, 7-day progressive login streak tracker, 4 daily rotating combat tasks, and 10 merit achievements. |
| **10**| **Global Pilot Rankings** | `LeaderboardPage.jsx` | Gold/Silver/Bronze podium cards, top 50 global pilots leaderboard, and personal rank banner. |

---

## 🔌 9. REST API Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new pilot account | No |
| `POST` | `/api/auth/login` | Authenticate pilot & issue JWT | No |
| `GET` | `/api/auth/me` | Fetch active profile & wallet | Yes |

### Player & Hangar (`/api/player`, `/api/ships`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/player/profile` | Retrieve level, XP, and stats | Yes |
| `GET` | `/api/ships` | List all 5 ships & ownership status | Yes |
| `POST` | `/api/ships/:shipId/select` | Equip starship for missions | Yes |
| `POST` | `/api/ships/:shipId/upgrade`| Purchase attribute upgrade atomically | Yes |

### Missions & Combat (`/api/games`, `/api/missions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/missions` | Get 50 data-driven mission definitions | Yes |
| `POST` | `/api/games/start` | Initialize mission session ID | Yes |
| `POST` | `/api/games/:sessionId/complete` | Submit telemetry & validate rewards | Yes |

### Daily Quests, Streaks & Achievements (`/api/quests`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/quests` | Retrieve active daily quests, streak progress, and 10 achievements | Yes |
| `POST` | `/api/quests/claim` | Claim reward for a completed quest or achievement | Yes |
| `POST` | `/api/quests/streak` | Claim daily 7-day login streak bonus | Yes |

### Global Leaderboard (`/api/leaderboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/leaderboard` | Fetch top 50 global pilots and requesting pilot's personal rank | Yes |

### Economy & Rewarded Ads (`/api/economy`, `/api/rewards`, `/api/wallet`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/economy/config` | Fetch reward constants & ad caps | Yes |
| `GET` | `/api/wallet/ledger` | Fetch immutable transaction audit history | Yes |
| `POST` | `/api/rewards/ad/opportunity` | Create verifiable ad event (9-state machine) | Yes |
| `POST` | `/api/rewards/ad/verify` | Verify ad completion & credit reward | Yes |

### Admin & System Audit (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/audit` | Live verification of double-entry mathematical balance and zero discrepancies | Yes |

---

## 🗄️ 10. Database Architecture

```
User ───────────────< PlayerProfile
                            │
                            ├───< PlayerShip (Ownership & Upgrade Levels)
                            ├───< PlayerMissionProgress (Stars & High Scores)
                            ├───< WalletTransaction (Audit Ledger)
                            ├───< RewardedAdSession (9-State Ad Verification Log)
                            └───< GameSession (Combat Sessions & Anti-Cheat)
```

* **User**: Authentication credentials, email, bcrypt password hash.
* **PlayerProfile**: Pilot level, XP progression, selected ship, wallet balances, login streak state, completed quests, and claimed achievements.
* **PlayerShip**: Starship ownership and upgrade tiers for Weapon, Shield, Engine, and Special modules.
* **GameSession**: Lifecycle tracking, session start timestamp, duration, telemetry, validation status.
* **WalletTransaction**: Immutable double-entry financial ledger records (`CREDIT` vs `DEBIT`).
* **RewardedAdSession**: 9-state tracking for rewarded video opportunities (`OFFERED` $\to$ `GRANTED`).

---

## 🧪 11. Automated Invariant & Security Test Suite

The repository includes an end-to-end automated verification script (`server/tests/test_invariants.ps1`) validating the core architectural guarantees of the engine:

1. **Double-Entry Balance Conservation**:
   $$\sum \text{Credits Minted} - \sum \text{Credits Sunk} = \text{Net Credits In Circulation}$$
2. **Anti-Cheat Duration Interception**:
   Sessions submitted under the minimum physical duration threshold ($< 10\text{s}$) are rejected with `CHEAT_DETECTED_INVALID_DURATION`.
3. **Session Completion Idempotency**:
   A completed session cannot be re-submitted or double-claimed.
4. **Zero Ledger Discrepancies**:
   Validates ledger mathematical consistency across all pilot profiles and transactions.

### Running the Test Suite:
```powershell
powershell -ExecutionPolicy Bypass -File server/tests/test_invariants.ps1
```

---

## ⚡ 12. Quickstart & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free MongoDB Atlas URI

### 1. Clone Repository
```bash
git clone https://github.com/kiranchaudhary18/void-hunter.git
cd void-hunter
```

### 2. Configure Backend Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
# Server running at http://localhost:5000
```

### 3. Configure Frontend Client
```bash
cd ../client
cp .env.example .env
npm install
npm run dev
# Vite client running at http://localhost:5173
```

---

<div align="center">
  <b>Developed for VELOOP Rewards • Full-Stack Game Development Internship Assignment</b><br/>
  <i>Engineered with React 19, Phaser 3, Node.js, Express, and MongoDB.</i>
</div>