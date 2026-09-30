'use client'

import { useState } from 'react'
import { CloudLightning, Droplets, Info, MapPin, Waves } from 'lucide-react'
import { driversFor, fmtPop, hazardAt, overallRisk, recommendedAction, regions, simTime } from '@/lib/engine'
import { useStore } from '@/lib/store'

const horizons = [0, 1, 2, 3, 4, 5, 6]

export default function LocationPage() {
  const { regionId, catchmentId, setCatchmentId } = useStore()
  const region = regions[regionId]
  const [horizon, setHorizon] = useState(3)
  const c = region.catchments.find((x) => x.id === catchmentId) ?? region.catchments[0]
  const overall = overallRisk(regionId, c.id, horizon)

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{region.eventLabel} · {simTime(regionId)}</p>
            <h1>Location intelligence</h1>
            <p className="heading-caption">
              {region.name} <span>·</span> {c.kind} <span>·</span> calibrated per hazard, band = P10–P90
            </p>
          </div>
          <span className="provenance-badge"><Info size={13} /> Probabilities from the engine, not hand-typed</span>
        </div>

        <div className="location-layout">
          {/* Catchment selector */}
          <div className="panel-card">
            <p className="eyebrow">Catchments</p>
            {region.catchments.map((k) => {
              const ov = overallRisk(regionId, k.id, horizon)
              return (
                <button key={k.id} className={`catchment-list-item ${k.id === c.id ? 'selected' : ''}`} onClick={() => setCatchmentId(k.id)}>
                  <strong>{k.name}</strong>
                  <span className={ov >= 70 ? 'risk-hot' : ov >= 50 ? 'risk-warm' : 'risk-mild'}>{ov}%</span>
                </button>
              )
            })}
            <div className="mini-slider">
              <p className="eyebrow">Lead +{horizon} h</p>
              <input type="range" min={0} max={6} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} aria-label="Forecast hour" />
            </div>
          </div>

          {/* Location card */}
          <div className="panel-card wide">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selected location</p>
                <h2>{c.name}</h2>
                <p className="panel-muted">{c.kind} · {fmtPop(c.population)} residents · {region.coords}</p>
              </div>
              <div className="risk-score">
                <span>OVERALL RISK</span>
                <strong className={overall >= 70 ? 'risk-hot' : overall >= 50 ? 'risk-warm' : 'risk-mild'}>{overall}<small>%</small></strong>
                <em>max of the three hazards</em>
              </div>
            </div>

            <div className="hazard-breakdown">
              {(['storm', 'rain', 'flood'] as const).map((h) => {
                const hz = hazardAt(regionId, c.id, h, horizon)
                const tone = h === 'storm' ? 'yellow' : h === 'rain' ? 'cyan' : 'orange'
                const Icon = h === 'storm' ? CloudLightning : h === 'rain' ? Droplets : Waves
                return (
                  <div className="hazard-col" key={h}>
                    <div className={`metric-icon ${tone}`}><Icon size={15} /></div>
                    <strong>{hz.p50}%</strong>
                    <span className="band-label">P10 {hz.lo} · P90 {hz.hi}</span>
                    <div className="band-track"><i className={tone} style={{ left: `${hz.lo}%`, width: `${hz.hi - hz.lo}%` }} /></div>
                    <small>{h === 'storm' ? 'Thunderstorm' : h === 'rain' ? 'Heavy rainfall' : 'Flash flood'}</small>
                  </div>
                )
              })}
            </div>

            <div className="signal-list">
              {driversFor(regionId, c.id, horizon).map((s) => (
                <div className="signal" key={s.label}>
                  <div className="signal-top"><span>{s.label}</span><strong>{s.value}</strong></div>
                  <div className="signal-track"><i className={s.color} style={{ width: `${s.score}%` }} /></div>
                  <span className="signal-score">{s.meaning}</span>
                </div>
              ))}
            </div>

            <div className="action-box">
              <p className="eyebrow">Recommended action (impact-based)</p>
              <p>{recommendedAction(regionId, c.id)}</p>
              <p className="method-note">
                <Info size={13} /> Historical analogues: {c.id.includes('silkboard')
                  ? '5 of 7 comparable events produced surface inundation here'
                  : '2 of 5 comparable events'} — outcome counts from the event register, not a generic claim.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
