// VajraNow — shared types.
// Everything on screen is either computed here or explicitly labelled ILLUSTRATIVE.

export type HazardId = 'storm' | 'rain' | 'flood'

export type Mode = 'live' | 'replay' | 'drill'

export type RegionId = 'blr' | 'ghats'

export type Lifecycle = 'draft' | 'pending' | 'approved' | 'dispatched' | 'cancelled'

export type FeedStatus = 'fresh' | 'degraded' | 'stale'

export interface Region {
  id: RegionId
  name: string
  subtitle: string
  coords: string
  mode: Mode
  /** Simulated wall-clock of the replayed event — per region, not global. */
  simTime: string
  /** Short event label shown in headers. */
  eventLabel: string
  eventDate: string
  catchments: Catchment[]
  feeds: Feed[]
}

export interface Catchment {
  id: string
  name: string
  kind: 'urban basin' | 'valley' | 'ghat slope' | 'underpass corridor'
  x: number // % position on the schematic map
  y: number
  /** Hazard probabilities at the peak of the event (percent). */
  hazards: Record<HazardId, { p50: number; band: [number, number] }>
  population: number
  drivers: string[]
  action: string
  hospitals: number
  schools: number
  underpasses: number
}

export interface Feed {
  id: string
  name: string
  /** minutes since last good packet */
  ageMin: number
  status: FeedStatus
  note?: string
}

export interface Signal {
  label: string
  value: string
  /** 0–100, defined as percentile rank of the driver across the event's lead window. */
  score: number
  color: string
  /** what the driver actually is, so judges are not guessing */
  meaning: string
}

export interface SkillRow {
  metric: 'CSI' | 'POD' | 'FAR' | 'Brier'
  vajra: number
  persistence: number
  optical: number
  betterWhenLower?: boolean
}

export interface CapAddress {
  name: string
  role: string
  at: string
  note?: string
}

export interface CapMessage {
  id: string
  region: RegionId
  catchment: string
  hazard: HazardId
  level: 'ADVISORY' | 'WATCH' | 'WARNING' | 'IMMINENT'
  lifecycle: Lifecycle
  windowMin: [number, number]
  headline: string
  instruction: string
  /** calibrated probability, from the engine, not invented per screen */
  probability: number
  population: number
  language: 'en' | 'hi' | 'kn'
  channels: string[]
  preparedBy: string
  approvals: CapAddress[]
  audit: { at: string; by: string; action: string }[]
  createdAt: string
}

export interface DeliveryStat {
  channel: string
  sent: number
  reachEst: number
  acknowledged: number
}
