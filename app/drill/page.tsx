'use client'

import { useState } from 'react'
import { CheckCircle2, FlaskConical, Info, Play } from 'lucide-react'
import { SIM_TIMESTAMP, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

const STEPS = [
  { id: 'inject', label: 'Inject synthetic storm', cta: 'Engine detects threshold crossing →', note: 'A fictitious cell is grown over the selected catchment — real feeds are untouched.' },
  { id: 'detect', label: 'Engine auto-drafts alert', cta: 'Review auto-draft → send to approval', note: 'Threshold crossing produces a draft with calibrated probability and impact wording.' },
  { id: 'approve', label: 'Four-eyes approval', cta: 'Approve as district manager →', note: 'Forecaster drafts, district manager approves. Rejection path is available and audited.' },
  { id: 'dispatch', label: 'Dispatch via mock gateway', cta: 'Dispatch via mock gateway →', note: 'CAP 1.2 XML is written to the demo log; no channel is contacted.' },
  { id: 'verify', label: 'Drill report generated', cta: '', note: 'Chain latency, decision points, and who-signed-what are summarised below.' },
]

export default function DrillPage() {
  const { mode, setMode, regionId, catchmentId, createDraft, sendToApproval, approve, dispatch } = useStore()
  const region = regions[regionId]
  const c = region.catchments.find((x) => x.id === catchmentId) ?? region.catchments[0]
  // -1 idle; 0..4 = index of the active step
  const [step, setStep] = useState(-1)
  const [drillAlertId, setDrillAlertId] = useState<string | null>(null)

  function startDrill() {
    setMode('drill')
    const msg = createDraft({
      catchment: c.name,
      hazard: 'storm',
      level: 'WARNING',
      headline: `DRILL · synthetic storm over ${c.name}`,
      instruction: 'This is a drill message. Verify sirens, IVR pickup and school closure checklist.',
      probability: 84,
      audit: [{ at: 'now', by: 'Drill harness', action: 'Synthetic storm injected; auto-draft generated' }],
    })
    setDrillAlertId(msg.id)
    setStep(0)
  }

  function advance() {
    if (step === 1 && drillAlertId) sendToApproval(drillAlertId)
    if (step === 2 && drillAlertId) approve(drillAlertId, 'You (Drill approver)')
    if (step === 3 && drillAlertId) dispatch(drillAlertId)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{SIM_TIMESTAMP} · region: {region.name}</p>
            <h1>Drill / exercise mode</h1>
            <p className="heading-caption">
              Exercise the full alert chain — draft → approve → CAP → simulated delivery — without sending anything real
            </p>
          </div>
          {mode === 'drill' && <span className="provenance-badge drill"><FlaskConical size={13} /> DRILL ACTIVE</span>}
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Target</p><h2>{c.name}</h2></div>
            <button className="primary-button inline" disabled={step >= 0} onClick={startDrill}>
              <Play size={14} /> {step >= 0 ? 'Drill running' : 'Start drill'}
            </button>
          </div>

          <div className="drill-steps">
            {STEPS.map((s, i) => {
              const done = i < step || (step === STEPS.length - 1 && i === step)
              const active = step === i && i !== STEPS.length - 1
              return (
                <div className={`drill-step ${done ? 'done' : ''} ${active ? 'active' : ''}`} key={s.id}>
                  <span className="drill-dot">{done ? '✓' : i + 1}</span>
                  <div>
                    <strong>{s.label}</strong>
                    <p>{s.note}</p>
                    {step === i && s.cta && (
                      <div className="drill-actions">
                        <button className="outline-button" onClick={advance}>{s.cta}</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {step === STEPS.length - 1 && (
            <div className="drill-report">
              <p className="eyebrow"><CheckCircle2 size={13} /> Drill report</p>
              <ul className="asset-list">
                <li>Chain latency (inject → dispatch): <b>4 m 12 s</b> — target &lt; 6 m.</li>
                <li>Auto-draft probability used: <b>84%</b> (synthetic cell, engine-consistent).</li>
                <li>Four-eyes approval: <b>recorded</b> — signatories and timestamps are in the alert's audit trail.</li>
                <li>CAP 1.2 XML: written to mock gateway log. Zero real messages sent.</li>
                <li>The drill alert appears on the lifecycle screen tagged DRILL.</li>
              </ul>
              <button className="outline-button" onClick={() => { setMode('replay'); setStep(-1); setDrillAlertId(null) }}>
                End drill and reset
              </button>
            </div>
          )}

          <p className="method-note"><Info size={13} /> The drill alert is a real record in this demo's state, so you can follow it on the lifecycle screen — but dispatch only ever reaches the mock gateway.</p>
        </section>
      </div>
    </main>
  )
}
