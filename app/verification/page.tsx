'use client'

import { useState } from 'react'
import { BarChart3, CheckCircle2, Info } from 'lucide-react'
import { reliabilityBins, skillByLead, verificationMeta } from '@/lib/engine'

type LeadKey = keyof typeof skillByLead

export default function VerificationPage() {
  const [lead, setLead] = useState<LeadKey>('0-2h')
  const rows = skillByLead[lead]

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">Backtest snapshot · run {verificationMeta.lastRun}</p>
            <h1>Verification &amp; proof</h1>
            <p className="heading-caption">
              Real backtest numbers from the replayed event set — shown against baselines, degrading with lead time
            </p>
          </div>
          <span className="provenance-badge"><CheckCircle2 size={13} /> Event-split · no random-row leakage</span>
        </div>

        <div className="chip-row">
          {(Object.keys(skillByLead) as LeadKey[]).map((k) => (
            <button key={k} className={`chip ${lead === k ? 'active' : ''}`} onClick={() => setLead(k)}>Lead {k}</button>
          ))}
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Skill scores · lead {lead}</p><h2>SkySentinel vs persistence vs optical flow</h2></div>
            <span className="latency-badge"><BarChart3 size={12} /> {verificationMeta.events}</span>
          </div>
          <div className="verification-table">
            <div className="verification-row verification-head">
              <span>Metric</span><span>SkySentinel</span><span>Persistence</span><span>Optical flow</span>
            </div>
            {rows.map((row) => (
              <div className="verification-row" key={row.metric}>
                <strong>{row.metric}{row.betterWhenLower ? ' ↓' : ''}</strong>
                <span className="model-score">{row.sky.toFixed(2)}</span>
                <span>{row.persistence.toFixed(2)}</span>
                <span>{row.optical.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="method-note">
            <Info size={13} /> ↓ = lower is better (FAR, Brier). CSI/POD: higher is better. Event defined as
            IMD cloudburst ≈100 mm/h or ≥50 mm/h with a flood report — every event has a source and date in the register.
          </p>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Calibration</p><h2>Reliability diagram — forecast vs observed frequency</h2></div>
          </div>
          <div className="reliability">
            {reliabilityBins.map((b) => (
              <div className="rel-col" key={b.bin}>
                <div className="rel-bars">
                  <div className="rel-bar forecast" style={{ height: `${b.forecast * 100}%` }} />
                  <div className="rel-bar observed" style={{ height: `${b.observed * 100}%` }} />
                </div>
                <small>{b.bin}</small>
                <span className="rel-n">n={b.n}</span>
              </div>
            ))}
          </div>
          <p className="method-note">
            <Info size={13} /> Bars: forecast mean (cyan) vs observed frequency (yellow) per probability bin.
            Close bars = calibrated. Only the top bin claims “high confidence”, and the reliability plot is what backs it.
          </p>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Methodology</p><h2>How the numbers are produced</h2></div>
          </div>
          <div className="cap-grid">
            <div><span>Event set</span><strong>{verificationMeta.events}</strong></div>
            <div><span>Split</span><strong>{verificationMeta.split}</strong></div>
            <div><span>Event definition</span><strong>{verificationMeta.eventsDefinedAs}</strong></div>
            <div><span>Baselines</span><strong>persistence · optical-flow extrapolation</strong></div>
          </div>
          <p className="method-note">
            <Info size={13} /> Known limits: 21 events is a small sample; the Ghats subset (7 events) is smaller still.
            Numbers are reported modestly and will move as the event register grows. We publish what we have rather
            than what a pitch deck would want.
          </p>
        </section>
      </div>
    </main>
  )
}
