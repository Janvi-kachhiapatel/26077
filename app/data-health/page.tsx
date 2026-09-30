'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Info, RefreshCw } from 'lucide-react'
import { regions, simTime } from '@/lib/engine'
import { useStore } from '@/lib/store'

export default function DataHealthPage() {
  const { regionId, setRegionId } = useStore()
  const [tick, setTick] = useState(0)
  const region = regions[regionId]
  const stale = region.feeds.filter((f) => f.status !== 'fresh')

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{simTime(regionId)} · region: {region.name}</p>
            <h1>Data feed health</h1>
            <p className="heading-caption">
              Every source's latency, last update and gaps — with the degradation mode the engine falls back to
            </p>
          </div>
          <button className="outline-button" onClick={() => setTick(tick + 1)}><RefreshCw size={14} /> Recheck (simulated)</button>
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Source register</p><h2>Feeds driving this region's nowcast</h2></div>
            <span className="latency-badge"><Activity size={12} /> {region.feeds.length - stale.length}/{region.feeds.length} fresh</span>
          </div>
          <div className="tracker-table">
            <div className="tracker-row tracker-head"><span>Source</span><span>Last packet</span><span>Status</span><span>Engine fallback</span></div>
            {region.feeds.map((f) => (
              <div className="tracker-row" key={f.id}>
                <strong>{f.name}</strong>
                <span>{f.ageMin < 60 ? `${f.ageMin} min` : `${Math.floor(f.ageMin / 60)} h ${f.ageMin % 60} m`} ago</span>
                <span className={`freshness ${f.status}`}>{f.status.toUpperCase()}</span>
                <span className="muted">{f.note ?? '—'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Degradation policy</p><h2>What happens when a feed drops</h2></div>
            <AlertTriangle size={16} />
          </div>
          <ul className="asset-list">
            <li><CheckCircle2 size={13} /> The engine keeps the last good forecast, <b>stamps its age</b>, and widens the uncertainty band.</li>
            <li><CheckCircle2 size={13} /> Severe-level dispatch is <b>disabled automatically</b> until a duty officer reviews the degraded basis.</li>
            <li><CheckCircle2 size={13} /> The mode badge on every screen says <b>DEGRADED</b> — never silently wrong.</li>
          </ul>
          {stale.length > 0 && (
            <div className="role-hint">
              <Info size={14} />
              <span>
                Current degraded inputs: <b>{stale.map((f) => f.name).join(', ')}</b>. The nowcast for this region is
                carried by the remaining fresh feeds; confidence labels on the map screen already reflect this.
              </span>
            </div>
          )}
          <p className="method-note"><Info size={13} /> In the real system each row is a monitored pipeline (Prefect/Celery job) with alerting on staleness; here the register is seeded per region to demonstrate the behaviour honestly.</p>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Provenance rule</p><h2>Every number carries its source</h2></div>
          </div>
          <div className="cap-grid">
            <div><span>Timestamp</span><strong>{simTime(regionId)}</strong></div>
            <div><span>Engine version</span><strong>vajra-engine v0.9.2</strong></div>
            <div><span>Region</span><strong>{region.name}</strong></div>
            <div><span>Mode</span><strong>{region.mode.toUpperCase()} / simulated</strong></div>
          </div>
        </section>
      </div>
    </main>
  )
}
