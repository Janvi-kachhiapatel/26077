# SkySentinel — SIH26077 prototype

**A probabilistic 0–6 h hazard → alert platform.** One sentence: turn satellite / radar / model data into calibrated micro-catchment risk, convert risk into impact- and cost-aware alert drafts, and dispatch human-approved CAP 1.2 alerts — while showing the system's own skill and data health.

> **Read this first (honesty statement).** Every number in this prototype is **simulated** from a replayed event script and labelled as such. The value here is the *decision layer*: the CAP alert chain, four-eyes approval, verification methodology, and data-health degradation — clickable end-to-end. No live model inference is connected; no real message is ever sent. Mock gateway only.

## Two engines, clearly separated

| | Replay engine (what runs today) | AI inference engine (the build target) |
|---|---|---|
| **What it is** | Deterministic TypeScript event script (`skysentinel-replay`) that replays recorded/constructed events | Multi-modal spatio-temporal model on INSAT + IMDAA/NWP + radar + lightning → multi-task storm/rain/flood heads |
| **Purpose** | Guaranteed offline demo of the full decision chain | Real 2–6 h probabilistic risk maps with published skill |
| **Honesty** | Every number it emits is illustrative, never claimed as model performance | Replaces replay metrics with a reproducible train/eval pipeline |

The replay engine exists so the decision layer can be demonstrated end-to-end without live data. It is not the weather AI, and nothing in the UI or docs claims it is.

---

## Why this is structured the way it is

SIH26077 (MoES/NCMRWF) asks for severe thunderstorm, cloudburst and flash-flood nowcasting with a 2–6 h actionable lead time. The whole point is the **alert path**: getting an actionable, human-approved message to people in the storm's path. So this prototype gives the chain equal billing with the forecast:

```
Ingest → QC + data-age → Nowcast ensemble → Calibration → Impact layer
      → Cost-loss decision thresholds → Human approval (four-eyes for severe)
      → CAP 1.2 → Channels (mock) → Delivery tracking + ground truth → Verification → Retraining
```

## Screens (13)

| # | Screen | What it proves |
|---|--------|----------------|
| 1 | **Situation overview** | Active watches/warnings, data-health strip, catchment risk board (overall = max of hazards, *defined*, not averaged) |
| 2 | **Nowcast map** | Lead-window toggle (0–2/2–4/4–6 h), P10–P90 ensemble bands, storm-cell tracker, ETA table |
| 3 | **Location intelligence** | Calibrated probabilities per hazard, plain-language drivers, recommended action |
| 4 | **Exposure & impact** | Population/hospitals/schools/underpasses inside the polygon; probability → consequence wording |
| 5 | **Alert composer** | Auto-draft from engine values, multilingual preview, channel choice, cost-loss rationale |
| 6 | **Approval queue** | Four-eyes rule with role gate, rejection with audited reasons |
| 7 | **Alert lifecycle** | Draft → pending → approved → dispatched; delivery tracking; fatigue guard; full audit trail |
| 8 | **Data feed health** | Per-source latency/status + the degradation policy the engine follows |
| 9 | **Verification** | CSI/POD/FAR/Brier vs persistence & optical flow, by lead window, + reliability diagram |
| 10 | **Event replay** | What the system *would have said* vs what actually happened, minute by minute |
| 11 | **Ground truth** | Citizen/responder reports feeding POD/FAR updates and retraining labels |
| 12 | **Drill mode** | Inject a synthetic storm; walk draft → approve → CAP → mock dispatch; nothing real is sent |
| 13 | **About & limits** | Model card, data register with licences, known failure cases, honesty statement |

Role switcher (top bar): Forecaster, District manager, Responder, Analyst, Citizen. Region switcher: **Bengaluru Metropolitan** (urban flash-flood basin) and **Nilgiris–Wayanad segment** (terrain-driven cloudburst) — two contrasting hazard regimes to show generality.

## Verification (what judges should probe)

- **Event set:** 21 events, 2018–2024 — Bengaluru (14) + Western Ghats (7). Each event has a source and date.
- **Definition:** IMD cloudburst ≈100 mm/h, or ≥50 mm/h plus a flood report.
- **Split:** by event and season — never random rows.
- **Baselines:** persistence and optical-flow extrapolation. Skill is always shown *next to* them.
- **Reported (0–2 h lead):** CSI 0.58 (persistence 0.41), POD 0.71, FAR 0.24, Brier 0.11 — degrading with lead time, shown degrading.
- **⚠️ These are illustrative replay metrics — not measured model performance.** No trained model exists yet; the numbers demonstrate the verification methodology (event split, hazard definition, baseline comparison), not skill of a real model. A reproducible train/eval pipeline replaces them in Phase 3.
- **Limits:** 21 events is a small sample; the Ghats subset (7) is smaller. Numbers move as the register grows.

## Data register (to verify at integration)

| Source | Used for | Reality check |
|---|---|---|
| INSAT-3DR/3DS (MOSDAC) | cloud-top temp, water vapour | registration; cadence/latency to verify |
| IMD DWR network | radar echo, motion | access restricted — archive samples or roadmap |
| NASA GPM IMERG | rainfall labels + verification | free; hours of latency → not live |
| ERA5 / GFS / Open-Meteo | CAPE, shear, moisture | ERA5 lags days; live from GFS/Open-Meteo |
| Copernicus DEM / MERIT Hydro | terrain, flow accumulation, HAND | free |
| ESA WorldCover · WorldPop · OSM | land cover, population, assets | free |
| IITM lightning · India-WRIS | lightning, gauges | limited access — roadmap |

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
```

## Deploy

**Vercel (recommended):** push to GitHub, import the repo at vercel.com/new. Every push to `main` deploys.

The app lives at the **repository root**, so Vercel settings should be:

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** (also pinned in `vercel.json`) |
| Root Directory | `.` (leave as repo root — do **not** point at a subfolder) |
| Build Command | `pnpm build` (or auto-detected) |
| Output Directory | leave empty — **never** set `dist` or `build` for Next.js |

If the deployment 404s: open **Deployments → latest → Build Logs** and confirm you see `Detected Next.js`, `Compiled successfully`, and a `Route (app)` table containing `○ /`. A successful build serving 404 almost always means wrong Root Directory or a manually-set Output Directory.

Or use the deploy button:

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJanvi-kachhiapatel%2F26077)
```

## Roadmap — from replay to real

1. **Phase 1 — Deployment:** working public demo (done: repo builds clean, all 13 routes verified 200 locally; Vercel config pinned in `vercel.json`).
2. **Phase 2 — Engine separation:** replay engine clearly labelled and isolated from the future AI inference path (done: see "Two engines").
3. **Phase 3 — One real pipeline:** one hazard + one region — INSAT/NWP ingest → preprocessing → trained model → probability API → this dashboard; reproducible eval replaces illustrative metrics.
4. **Phase 4 — Multi-task model:** shared spatio-temporal encoder → storm / rain / flood risk heads.
5. **Phase 5 — Decision layer on live predictions:** uncertainty → impact → alert → human approval → CAP → verification, driven by real forecasts.

## Demo script for judges (3 minutes)

1. **Overview** — point at the data-health strip: one feed is degraded, and the confidence label already says so.
2. **Nowcast map** — drag the lead window 0–2 → 4–6 h; probabilities and bands widen honestly.
3. **Composer** — create a draft from engine values; note the cost-loss rationale and multilingual preview.
4. **Approvals** — switch role to district manager; approve; watch the audit trail grow.
5. **Lifecycle** — dispatch; delivery table with fatigue-guard stats.
6. **Verification** — skill vs baselines, reliability diagram.
7. **Replay** — the moment-by-moment "what we would have said vs what happened".
8. **Drill mode** — full chain with zero real messages.
