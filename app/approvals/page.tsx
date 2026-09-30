'use client'

import { useState } from 'react'
import { CheckCircle2, Info, ShieldCheck, XCircle } from 'lucide-react'
import { SIM_TIMESTAMP, fmtPop, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

export default function ApprovalsPage() {
  const { alerts, approve, reject, dispatch, role, mode } = useStore()
  const pending = alerts.filter((a) => a.lifecycle === 'pending')
  const [reason, setReason] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  const isDistrict = role === 'district'
  const drillSafety = mode === 'drill' ? 'DRILL MODE — nothing leaves the building even if approved.' : null

  function handleApprove(id: string) {
    approve(id, role === 'district' ? 'You (District)' : 'You (Forecaster)')
    setFlash(`approved:${id}`)
  }
  function handleReject(id: string) {
    reject(id, role === 'district' ? 'You (District)' : 'You (Forecaster)', reason || 'no reason recorded')
    setFlash(`rejected:${id}`)
    setReason('')
  }

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{SIM_TIMESTAMP} · role: {role}</p>
            <h1>Approval queue</h1>
            <p className="heading-caption">
              Four-eyes rule — severe alerts need forecaster + district manager before dispatch
            </p>
          </div>
          {drillSafety && <span className="provenance-badge"><Info size={13} /> {drillSafety}</span>}
        </div>

        {!isDistrict && (
          <div className="role-hint">
            <Info size={14} />
            <span>
              You are acting as <b>{role}</b>. Severe-alert approval requires the <b>district disaster manager</b> role —
              switch roles in the top bar to exercise the four-eyes flow.
            </span>
          </div>
        )}

        {pending.length === 0 && (
          <section className="panel-card">
            <p className="empty-note">Queue is empty. Create a draft in the composer and send it for approval.</p>
          </section>
        )}

        {pending.map((a) => (
          <section className="panel-card" key={a.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{a.id} · {a.catchment}</p>
                <h2>{a.headline}</h2>
              </div>
              <span className={`cap-level ${a.level.toLowerCase()}`}>{a.level}</span>
            </div>
            <div className="cap-grid">
              <div><span>Probability</span><strong>{a.probability}%</strong></div>
              <div><span>Window</span><strong>+{a.windowMin[0]}–{a.windowMin[1]} min</strong></div>
              <div><span>Population</span><strong>{fmtPop(a.population)}</strong></div>
              <div><span>Prepared by</span><strong>{a.preparedBy}</strong></div>
            </div>
            <div className="cap-instruction"><p className="eyebrow">Instruction</p><p>{a.instruction}</p></div>
            <div className="cap-channels"><p className="eyebrow">Channels</p><div className="chip-row">{a.channels.map((ch) => <span className="chip" key={ch}>{ch}</span>)}</div></div>

            <div className="reject-row">
              <input
                className="text-input"
                placeholder="Rejection reason (recorded in audit trail)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button className="outline-button" onClick={() => handleReject(a.id)}><XCircle size={14} /> Reject</button>
              <button className="primary-button inline" onClick={() => handleApprove(a.id)}><CheckCircle2 size={14} /> Approve{isDistrict ? ' (second signatory)' : ''}</button>
            </div>

            <div className="audit-list">
              <p className="eyebrow">Audit trail</p>
              {a.audit.map((e, i) => (
                <div className="audit-entry" key={i}><span>{e.at}</span><b>{e.by}</b><p>{e.action}</p></div>
              ))}
            </div>

            {flash === `approved:${a.id}` && (
              <p className="method-note"><CheckCircle2 size={13} /> Approved. Severe dispatch now waits only if a second signatory is still required (see lifecycle screen).</p>
            )}
            {flash === `rejected:${a.id}` && (
              <p className="method-note"><XCircle size={13} /> Rejected — back to draft with the reason appended to the audit trail.</p>
            )}
          </section>
        ))}

        {/* Already approved — one-click dispatch for the demo */}
        {alerts.filter((a) => a.lifecycle === 'approved').map((a) => (
          <section className="panel-card" key={a.id}>
            <div className="section-heading">
              <div><p className="eyebrow">{a.id}</p><h2>{a.headline}</h2></div>
              <span className="cap-level approved">APPROVED</span>
            </div>
            <p className="method-note"><ShieldCheck size={13} /> Four-eyes complete. Ready to dispatch through the mock gateway.</p>
            <button className="primary-button" onClick={() => dispatch(a.id)}>Dispatch via mock gateway</button>
          </section>
        ))}
      </div>
    </main>
  )
}
