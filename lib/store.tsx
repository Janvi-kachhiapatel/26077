'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CapMessage, Lifecycle, RegionId } from './types'
import { regions } from './engine'

// ─────────────────────────────────────────────────────────────────────────────
// Roles
// ───────────────────────────────────────── what-the-review-asked-for: screen 1
export type Role = 'forecaster' | 'district' | 'responder' | 'analyst' | 'citizen'

export const ROLES: { id: Role; label: string; blurb: string }[] = [
  { id: 'forecaster', label: 'Forecaster / Duty officer', blurb: 'Compose alerts, send to approval queue' },
  { id: 'district', label: 'District disaster manager', blurb: 'Second pair of eyes — approves severe alerts' },
  { id: 'responder', label: 'Responder', blurb: 'Sees tasks, shelters, delivery feedback' },
  { id: 'analyst', label: 'Analyst / Admin', blurb: 'Verification, data health, model card' },
  { id: 'citizen', blurb: 'No login · my-location risk, safety actions', label: 'Citizen (no login)' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Alert seed data
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_AT = '30 Aug 2022 · 14:38 IST'

const seedAlerts: CapMessage[] = [
  {
    id: 'VJ-2022-0830-01',
    region: 'blr',
    catchment: 'Whitefield basin',
    hazard: 'storm',
    level: 'WARNING',
    lifecycle: 'dispatched',
    windowMin: [30, 90],
    headline: 'Severe thunderstorm likely over Whitefield basin',
    instruction: 'Move vehicles out of underpasses; pause outdoor work; shelter indoors.',
    probability: 78,
    population: 310000,
    language: 'en',
    channels: ['SMS', 'Cell broadcast', 'App push', 'Sirens'],
    preparedBy: 'Duty Officer A. Rao',
    approvals: [
      { name: 'D. Fernandes', role: 'District disaster manager', at: AUDIT_AT },
      { name: 'S. Iyengar', role: 'Forecaster (second signatory)', at: AUDIT_AT },
    ],
    audit: [
      { at: '14:05', by: 'Engine (auto-draft)', action: 'Draft generated from 78% calibrated probability' },
      { at: '14:22', by: 'A. Rao (Forecaster)', action: 'Edited wording, chose channels' },
      { at: '14:38', by: 'D. Fernandes (District)', action: 'Approved (four-eyes complete)' },
      { at: '14:39', by: 'Gateway (mock)', action: 'Dispatched to 4 channels — delivery tracking on' },
    ],
    createdAt: '30 Aug 2022 · 14:05 IST',
  },
  {
    id: 'VJ-2022-0830-02',
    region: 'blr',
    catchment: 'KR Puram low-lying belt',
    hazard: 'flood',
    level: 'WATCH',
    lifecycle: 'pending',
    windowMin: [60, 180],
    headline: 'Flash-flood watch for KR Puram low-lying belt',
    instruction: 'Ward staff to verify pump status; residents in ground floors to prepare.',
    probability: 58,
    population: 185000,
    language: 'en',
    channels: ['SMS', 'App push'],
    preparedBy: 'Engine (auto-draft)',
    approvals: [],
    audit: [{ at: '14:40', by: 'Engine (auto-draft)', action: 'Draft generated, awaiting forecaster review' }],
    createdAt: '30 Aug 2022 · 14:40 IST',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface Store {
  role: Role
  setRole: (r: Role) => void
  regionId: RegionId
  setRegionId: (r: RegionId) => void
  mode: 'live' | 'replay' | 'drill'
  setMode: (m: 'live' | 'replay' | 'drill') => void
  catchmentId: string
  setCatchmentId: (c: string) => void
  alerts: CapMessage[]
  createDraft: (partial: Partial<CapMessage>) => CapMessage
  sendToApproval: (id: string) => void
  approve: (id: string, by: string) => void
  reject: (id: string, by: string, reason: string) => void
  dispatch: (id: string) => void
  cancel: (id: string, by: string, reason: string) => void
  drillArmed: boolean
  setDrillArmed: (v: boolean) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('forecaster')
  const [regionId, setRegionId] = useState<RegionId>('blr')
  const [mode, setMode] = useState<'live' | 'replay' | 'drill'>('replay')
  const [catchmentId, setCatchmentId] = useState<string>('blr-whitefield')
  const [alerts, setAlerts] = useState<CapMessage[]>(seedAlerts)
  const [drillArmed, setDrillArmed] = useState(false)

  const store = useMemo<Store>(() => ({
    role, setRole,
    regionId, setRegionId,
    mode, setMode,
    catchmentId, setCatchmentId,
    alerts,
    drillArmed, setDrillArmed,
    createDraft: (partial) => {
      const region = regions[regionId]
      const c = region.catchments.find((k) => k.id === catchmentId) ?? region.catchments[0]
      const msg: CapMessage = {
        id: `VJ-DRILL-${String(alerts.length + 1).padStart(3, '0')}`,
        region: regionId,
        catchment: c.name,
        hazard: 'storm',
        level: 'WARNING',
        lifecycle: 'draft',
        windowMin: [30, 90],
        headline: `Severe thunderstorm likely over ${c.name}`,
        instruction: 'Move vehicles out of underpasses; pause outdoor work; shelter indoors.',
        probability: c.hazards.storm.p50,
        population: c.population,
        language: 'en',
        channels: ['SMS', 'Cell broadcast', 'App push', 'Sirens'],
        preparedBy: `${roleLabel(role)} (you)`,
        approvals: [],
        audit: [{ at: 'now', by: 'You', action: 'Draft created' }],
        createdAt: 'now',
        ...partial,
      }
      setAlerts((a) => [msg, ...a])
      return msg
    },
    sendToApproval: (id) => updateAlert(id, (m) => ({ ...m, lifecycle: 'pending' as Lifecycle })),
    approve: (id, by) => updateAlert(id, (m) => ({
      ...m,
      lifecycle: 'approved' as Lifecycle,
      approvals: [...m.approvals, { name: by, role: 'District disaster manager', at: 'now' }],
      audit: [...m.audit, { at: 'now', by, action: 'Approved — four-eyes complete' }],
    })),
    reject: (id, by, reason) => updateAlert(id, (m) => ({
      ...m,
      lifecycle: 'draft' as Lifecycle,
      audit: [...m.audit, { at: 'now', by, action: `Rejected: ${reason}` }],
    })),
    dispatch: (id) => updateAlert(id, (m) => ({ ...m, lifecycle: 'dispatched' as Lifecycle })),
    cancel: (id, by, reason) => updateAlert(id, (m) => ({
      ...m,
      lifecycle: 'cancelled' as Lifecycle,
      audit: [...m.audit, { at: 'now', by, action: `Cancelled: ${reason}` }],
    })),
  }), [role, regionId, mode, catchmentId, alerts, drillArmed])

  function updateAlert(id: string, fn: (m: CapMessage) => CapMessage) {
    setAlerts((list) => list.map((m) => (m.id === id ? fn(m) : m)))
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

function roleLabel(r: Role): string {
  return ROLES.find((x) => x.id === r)?.label ?? 'Forecaster'
}

/** Switching region snaps the catchment selection to that region's first catchment. */
export function selectRegion(
  store: { setRegionId: (r: RegionId) => void; setCatchmentId: (c: string) => void },
  id: RegionId,
) {
  store.setRegionId(id)
  store.setCatchmentId(regions[id].catchments[0].id)
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside <StoreProvider>')
  return s
}
