'use client'

import { AlertTriangle, Building2, GraduationCap, HeartPulse, Info, ShieldCheck, Users } from 'lucide-react'
import { SIM_TIMESTAMP, fmtPop, hazardAt, overallRisk, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

export default function ExposurePage() {
  const { regionId, catchmentId, setCatchmentId } = useStore()
  const region = regions[regionId]
  const c = region.catchments.find((x) => x.id === catchmentId) ?? region.catchments[0]
  const overall = overallRisk(regionId, c.id, 3)
  const flood = hazardAt(regionId, c.id, 'flood', 3)

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{region.eventLabel} · {SIM_TIMESTAMP}</p>
            <h1>Exposure &amp; impact</h1>
            <p className="heading-caption">
              What is inside the alert polygon — the difference between a forecast and a decision
            </p>
          </div>
          <span className="provenance-badge"><Info size={13} /> Counts from catchment register · illustrative</span>
        </div>

        {/* Catchment switcher */}
        <div className="chip-row">
          {region.catchments.map((k) => (
            <button key={k.id} className={`chip ${k.id === c.id ? 'active' : ''}`} onClick={() => setCatchmentId(k.id)}>
              {k.name}
            </button>
          ))}
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon cyan"><Users size={15} /></div>
            <div className="metric-label">Population in polygon</div>
            <div className="metric-value">{fmtPop(c.population)}</div>
            <p>{Math.round(c.population * 0.18).toLocaleString('en-IN')} in vulnerable groups (18% share)</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon red"><HeartPulse size={15} /></div>
            <div className="metric-label">Hospitals</div>
            <div className="metric-value">{c.hospitals}</div>
            <p>Access routes checked against flood susceptibility</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon yellow"><GraduationCap size={15} /></div>
            <div className="metric-label">Schools</div>
            <div className="metric-value">{c.schools}</div>
            <p>Early-closure candidates at WATCH level and above</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon orange"><Building2 size={15} /></div>
            <div className="metric-label">Underpasses / low spots</div>
            <div className="metric-value">{c.underpasses}</div>
            <p>Traffic-exposure candidates for pre-emptive closure</p>
          </div>
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Impact-based translation</p>
              <h2>What the probability means for {c.name}</h2>
            </div>
            <span className="latency-badge">Overall {overall}% · flood P50 {flood.p50}%</span>
          </div>
          <div className="impact-table">
            <div className="impact-row impact-head"><span>If probability is</span><span>Consequence wording</span><span>Default action</span></div>
            <ImpactRow from={0} to={40} wording="Usual monsoon behaviour. No alert." action="Monitor" />
            <ImpactRow from={40} to={60} wording="Waterlogging possible in known low spots." action="ADVISORY to ward staff" />
            <ImpactRow from={60} to={80} wording="Underpass on the main corridor likely to flood in 60–90 min; avoid." action="WATCH · prep pumps, warn traffic" />
            <ImpactRow from={80} to={101} wording="Flash flooding of ground floors and underpasses expected; move out now." action="WARNING / IMMINENT · four-eyes approval" />
          </div>
          <p className="method-note">
            <Info size={13} /> Thresholds come from an explicit cost-loss ratio per audience (hospital vs commuter vs school),
            not one global cutoff. The wording leads with the consequence, not the hazard name.
          </p>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Critical asset notes</p>
              <h2>Responder-relevant specifics</h2>
            </div>
            <ShieldCheck size={16} />
          </div>
          <ul className="asset-list">
            <li><AlertTriangle size={13} /> {c.action}</li>
            <li><Info size={13} /> Hospitals: {c.hospitals} · Schools: {c.schools} · Underpasses: {c.underpasses} in this catchment.</li>
            <li><Info size={13} /> Vulnerable groups: elderly living alone + ground-floor settlements near the drainage line (register-derived share, illustrative).</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

function ImpactRow({ from, to, wording, action }: { from: number; to: number; wording: string; action: string }) {
  return (
    <div className="impact-row">
      <strong>{from}–{to === 101 ? '100' : to}%</strong>
      <span>{wording}</span>
      <span className="impact-action">{action}</span>
    </div>
  )
}
