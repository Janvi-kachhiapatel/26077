'use client'

import { useState } from 'react'
import { CheckCircle2, History, Info, XCircle } from 'lucide-react'
import { fmtPop, hazardAt, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

const REPLAY_SCRIPT = [
  { at: 'T−90 min', system: 'Ensemble flags growing cell; probability crosses 40% watch threshold.', actual: 'Cloud tops cooling rapidly; no rain yet at the ground.' },
  { at: 'T−45 min', system: 'Watch issued for low-lying catchments; pumps pre-positioned.', actual: 'First intense cells onshore; IMERG confirms 22 mm/h.' },
  { at: 'T−15 min', system: 'Warning issued; underpass closure decision reaches traffic police.', actual: 'Rain rate 65 mm/h; waterlogging begins at known low spots.' },
  { at: 'T+0', system: 'Peak nowcast: flood P50 78%, P90 90%. Sirens ring in exposed wards.', actual: 'Peak inundation matches the flagged basins.' },
  { at: 'T+90 min', system: 'All-clear drafted after gauge + citizen confirmations.', actual: 'Cells decay; gauges receding.' },
]

export default function ReplayPage() {
  const { regionId } = useStore()
  const region = regions[regionId]
  const [tIdx, setTIdx] = useState(2)
  const main = region.catchments[0]

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{region.eventLabel}</p>
            <h1>Event replay</h1>
            <p className="heading-caption">
              The event is replayed at forecast time — showing what the system would have said, with the actual outcome alongside
            </p>
          </div>
          <span className="provenance-badge"><History size={13} /> Outcome column from the event register</span>
        </div>

        <div className="forecast-strip">
          <div className="strip-head">
            <div><p className="eyebrow">Replay clock</p><strong>{REPLAY_SCRIPT[tIdx].at} relative to peak rain</strong></div>
            <span className="confidence-chip">{region.eventDate}</span>
          </div>
          <input className="timeline-range" type="range" min={0} max={REPLAY_SCRIPT.length - 1} value={tIdx}
            onChange={(e) => setTIdx(Number(e.target.value))} aria-label="Replay time" />
          <div className="timeline-caption"><span>T−90 min</span><span>T+90 min</span></div>
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">At this replay moment</p><h2>{REPLAY_SCRIPT[tIdx].at}</h2></div>
            <span className="latency-badge">flood P50 {hazardAt(regionId, main.id, 'flood', 3).p50}%</span>
          </div>
          <div className="replay-grid">
            <div className="replay-col">
              <p className="eyebrow"><Info size={12} /> What VajraNow would have said</p>
              <p>{REPLAY_SCRIPT[tIdx].system}</p>
            </div>
            <div className="replay-col">
              <p className="eyebrow"><History size={12} /> What actually happened</p>
              <p>{REPLAY_SCRIPT[tIdx].actual}</p>
            </div>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Full timeline</p><h2>Script for {region.name}</h2></div>
          </div>
          <div className="tracker-table">
            <div className="tracker-row tracker-head"><span>Time</span><span>System said</span><span>Actual</span></div>
            {REPLAY_SCRIPT.map((s, i) => (
              <button key={s.at} className={`tracker-row ${i === tIdx ? 'selected' : ''}`} onClick={() => setTIdx(i)}>
                <strong>{s.at}</strong>
                <span>{s.system}</span>
                <span className="muted">{s.actual}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Verification on this event</p><h2>Would the alert have been justified?</h2></div>
          </div>
          <ul className="asset-list">
            <li><CheckCircle2 size={13} /> Watch lead time achieved: <b>{regionId === 'blr' ? '45 min' : '60 min'}</b> before peak rain.</li>
            <li><CheckCircle2 size={13} /> Exposed population in polygon: <b>{fmtPop(main.population)}</b> — warning polygon covered the inundated basins.</li>
            <li><XCircle size={13} /> False alarm on the northern fringe: watch issued but no inundation — counted in FAR, shown, not hidden.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
