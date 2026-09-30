'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { regions } from '@/lib/engine'
import { ROLES, selectRegion, useStore } from '@/lib/store'

const NAV = [
  { href: '/', label: 'Situation overview' },
  { href: '/nowcast', label: 'Nowcast map' },
  { href: '/location', label: 'Location intelligence' },
  { href: '/exposure', label: 'Exposure & impact' },
  { href: '/composer', label: 'Alert composer' },
  { href: '/approvals', label: 'Approval queue' },
  { href: '/alerts', label: 'Alert lifecycle' },
  { href: '/data-health', label: 'Data feed health' },
  { href: '/verification', label: 'Verification' },
  { href: '/replay', label: 'Event replay' },
  { href: '/ground-truth', label: 'Ground truth' },
  { href: '/drill', label: 'Drill mode' },
  { href: '/about', label: 'About & limits' },
]

export function Topbar() {
  const { role, setRole, regionId, setRegionId, setCatchmentId, mode, setMode } = useStore()
  const region = regions[regionId]

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-mark"><span>V</span></div>
        <div>
          <p className="brand-name">VAJRA<span>NOW</span></p>
          <p className="brand-sub">SEVERE WEATHER INTELLIGENCE</p>
        </div>
      </div>

      <div className="topbar-status">
        <span className={`mode-dot ${mode}`} />
        {mode === 'replay' && `REPLAY · ${region.eventLabel}`}
        {mode === 'drill' && 'DRILL — SYNTHETIC STORM INJECTED'}
        {mode === 'live' && 'LIVE (SIMULATED FEED)'}
        <span className="status-divider" />
        <span className="muted">Region</span>
        <select
          className="region-select"
          value={regionId}
          onChange={(e) => selectRegion({ setRegionId, setCatchmentId }, e.target.value as 'blr' | 'ghats')}
          aria-label="Select region"
        >
          <option value="blr">{regions.blr.name}</option>
          <option value="ghats">{regions.ghats.name}</option>
        </select>
      </div>

      <div className="topbar-actions">
        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          aria-label="Active role"
        >
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
        <button
          className={`mode-chip ${mode === 'drill' ? 'armed' : ''}`}
          onClick={() => setMode(mode === 'drill' ? 'replay' : 'drill')}
          title="Toggle drill mode"
        >
          {mode === 'drill' ? 'EXIT DRILL' : 'DRILL'}
        </button>
      </div>
    </header>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { mode } = useStore()

  return (
    <>
      <button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      <aside className={`left-rail ${open ? 'open' : ''}`}>
        <div className="rail-section">
          <p className="eyebrow">Operate</p>
          {NAV.slice(0, 4).map((n) => <NavItem key={n.href} {...n} pathname={pathname} onGo={() => setOpen(false)} />)}
        </div>
        <div className="rail-section">
          <p className="eyebrow">Alert chain</p>
          {NAV.slice(4, 7).map((n) => <NavItem key={n.href} {...n} pathname={pathname} onGo={() => setOpen(false)} />)}
        </div>
        <div className="rail-section">
          <p className="eyebrow">Prove it</p>
          {NAV.slice(7, 10).map((n) => <NavItem key={n.href} {...n} pathname={pathname} onGo={() => setOpen(false)} />)}
        </div>
        <div className="rail-section">
          <p className="eyebrow">Test & govern</p>
          {NAV.slice(10).map((n) => <NavItem key={n.href} {...n} pathname={pathname} onGo={() => setOpen(false)} />)}
        </div>
        <div className="rail-footer">
          <span className={`mode-dot ${mode}`} />
          <div>
            <strong>Prototype safe mode</strong>
            <p>Simulated / replay data only · nothing real is sent</p>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({ href, label, pathname, onGo }: { href: string; label: string; pathname: string; onGo: () => void }) {
  const active = pathname === href
  return (
    <Link href={href} className={`rail-item ${active ? 'active' : ''}`} onClick={onGo}>
      {label}
    </Link>
  )
}
