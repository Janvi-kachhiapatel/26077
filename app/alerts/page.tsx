'use client'

import { ArrowRight, Bell, CheckCircle2, Info, Radio, XCircle } from 'lucide-react'
import Link from 'next/link'
import { SIM_TIMESTAMP, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

const DELIVERY: Record<string, { sent: number; reach: number; ack: number }> = {
  SMS: { sent: 41200, reach: 38700, ack: 12100 },
  'Cell broadcast': { sent: 128000, reach: 96400, ack: 0 },
  'App push': { sent: 9800, reach: 9100, ack: 6400 },
  'IVR voice': { sent: 6200, reach: 5100, ack: 2900 },
  Sirens: { sent: 14, reach: 14, ack: 14 },
  Social: { sent: 1, reach: 22400, ack: 0 },
}

export default function LifecyclePage() {
  const { alerts } = useStore()

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{SIM_TIMESTAMP}</p>
            <h1>Alert lifecycle &amp; history</h1>
            <p className="heading-caption">
              Draft → pending → approved → dispatched → cancelled/all-clear · full audit trail on every alert
            </p>
          </div>
          <Link className="outline-button" href="/composer">Compose new <ArrowRight size={14} /></Link>
        </div>

        {/* Pipeline strip */}
        <section className="panel-card">
          <div className="lifecycle-pipeline">
            {['draft', 'pending', 'approved', 'dispatched', 'cancelled'].map((stage) => {
              const n = alerts.filter((a) => a.lifecycle === stage).length
              return (
                <div className="pipeline-stage" key={stage}>
                  <strong className={n > 0 ? 'has-count' : ''}>{n}</strong>
                  <span>{stage}</span>
                </div>
              )
            })}
          </div>
        </section>

        {alerts.length === 0 && (
          <section className="panel-card"><p className="empty-note">No alerts yet — compose one to walk the chain.</p></section>
        )}

        {alerts.map((a) => (
          <section className="panel-card" key={a.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{a.id} · {a.createdAt}</p>
                <h2>{a.headline}</h2>
              </div>
              <span className={`cap-level ${a.level.toLowerCase()}`}>{a.level} · {a.lifecycle.toUpperCase()}</span>
            </div>

            <div className="cap-grid">
              <div><span>Catchment</span><strong>{a.catchment}</strong></div>
              <div><span>Probability</span><strong>{a.probability}%</strong></div>
              <div><span>Window</span><strong>+{a.windowMin[0]}–{a.windowMin[1]} min</strong></div>
              <div><span>Language</span><strong>{a.language.toUpperCase()}</strong></div>
            </div>

            {/* Delivery tracking — mock numbers, labelled */}
            {a.lifecycle === 'dispatched' && (
              <div className="delivery-box">
                <p className="eyebrow"><Radio size={12} /> Delivery tracking (mock gateway · illustrative numbers)</p>
                <div className="tracker-table">
                  <div className="tracker-row tracker-head"><span>Channel</span><span>Sent</span><span>Reach est.</span><span>Acknowledged</span></div>
                  {a.channels.filter((ch) => DELIVERY[ch]).map((ch) => {
                    const d = DELIVERY[ch]
                    return (
                      <div className="tracker-row" key={ch}>
                        <strong>{ch}</strong>
                        <span>{d.sent.toLocaleString('en-IN')}</span>
                        <span>{d.reach.toLocaleString('en-IN')}</span>
                        <span>{d.ack === 0 ? 'n/a' : d.ack.toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="method-note">
                  <Info size={13} /> Cell broadcast cannot acknowledge — shown as n/a, not zero. Alert-fatigue guard: this area's
                  30-day false-alarm ratio is 0.18; dedupe suppresses a second alert within 45 min unless severity rises.
                </p>
              </div>
            )}

            {/* Audit trail */}
            <div className="audit-list">
              <p className="eyebrow">Audit trail</p>
              {a.audit.map((e, i) => (
                <div className="audit-entry" key={i}><span>{e.at}</span><b>{e.by}</b><p>{e.action}</p></div>
              ))}
            </div>

            {/* Approvals shown explicitly */}
            {a.approvals.length > 0 && (
              <div className="cap-channels">
                <p className="eyebrow"><CheckCircle2 size={12} /> Signatories</p>
                <div className="chip-row">
                  {a.approvals.map((ap, i) => <span className="chip" key={i}>{ap.name} · {ap.role}</span>)}
                </div>
              </div>
            )}

            {a.lifecycle === 'cancelled' && (
              <p className="method-note"><XCircle size={13} /> All-clear was issued and delivery stopped.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
