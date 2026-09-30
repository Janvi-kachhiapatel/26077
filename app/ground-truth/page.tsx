'use client'

import { useState } from 'react'
import { Camera, CheckCircle2, MessageSquarePlus, Info } from 'lucide-react'
import { SIM_TIMESTAMP, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

const SEED_REPORTS = [
  { who: 'Citizen · WhatsApp bot', what: 'Water above ankle on the service road near the underpass.', where: 'Silk Board corridor', at: '14:52', tag: 'FLOOD' },
  { who: 'Responder · ward staff', what: 'Pump #2 running; inlet partially clogged, cleared.', where: 'KR Puram canal mouth', at: '14:47', tag: 'OPS' },
  { who: 'Citizen · app report', what: 'No rain here for the last 20 min.', where: 'Yelahanka fringe', at: '14:41', tag: 'NO-RAIN' },
  { who: 'Gauge · BBMP #14', what: '62 mm/h instantaneous; rising.', where: 'Whitefield basin', at: '14:39', tag: 'GAUGE' },
]

const TAGS = ['RAIN', 'NO-RAIN', 'FLOOD', 'NO-FLOOD', 'HAIL', 'WIND DAMAGE', 'OPS']

export default function GroundTruthPage() {
  const { regionId, catchmentId } = useStore()
  const region = regions[regionId]
  const c = region.catchments.find((x) => x.id === catchmentId) ?? region.catchments[0]
  const [reports, setReports] = useState(SEED_REPORTS)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('FLOOD')
  const [thanks, setThanks] = useState(false)

  function submit() {
    if (!text.trim()) return
    setReports((r) => [{ who: 'You · ground-truth form', what: text.trim(), where: c.name, at: 'now', tag }, ...r])
    setText('')
    setThanks(true)
  }

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{region.eventLabel} · {SIM_TIMESTAMP}</p>
            <h1>Ground truth &amp; feedback</h1>
            <p className="heading-caption">
              Citizen and responder reports close the loop: they verify alerts and become training labels
            </p>
          </div>
          <span className="provenance-badge"><Info size={13} /> Reports stay in the demo — nothing is uploaded</span>
        </div>

        <div className="gt-layout">
          {/* Report form */}
          <div className="panel-card">
            <div className="section-heading">
              <div><p className="eyebrow">Report what you see</p><h2>{c.name}</h2></div>
              <Camera size={15} />
            </div>
            <label className="form-label">Observation tag</label>
            <div className="chip-row">
              {TAGS.map((t) => (
                <button key={t} className={`chip ${tag === t ? 'active' : ''}`} onClick={() => setTag(t)}>{t}</button>
              ))}
            </div>
            <label className="form-label">What is happening?</label>
            <textarea
              className="text-input area"
              rows={4}
              placeholder="e.g. Water entering shop fronts; traffic diverted at the junction."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="primary-button" onClick={submit} disabled={!text.trim()}>
              <MessageSquarePlus size={15} /> Submit report
            </button>
            {thanks && (
              <p className="method-note"><CheckCircle2 size={13} /> Logged. Confirmed reports join the verification set; “did it happen here?” answers update POD/FAR on the verification screen.</p>
            )}
            <p className="method-note"><Info size={13} /> In the citizen PWA this form is one tap from the alert, works offline, and accepts photos. Reports are geostamped to the catchment.</p>
          </div>

          {/* Feed */}
          <div className="panel-card wide">
            <div className="section-heading">
              <div><p className="eyebrow">Live feed (simulated)</p><h2>Reports arriving this event</h2></div>
              <span className="latency-badge">{reports.length} reports</span>
            </div>
            <div className="report-list">
              {reports.map((r, i) => (
                <div className="report-row" key={i}>
                  <span className={`report-tag ${r.tag.startsWith('NO') ? 'neg' : 'pos'}`}>{r.tag}</span>
                  <div>
                    <strong>{r.where}</strong>
                    <p>{r.what}</p>
                    <span className="muted">{r.who} · {r.at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow">Where reports go</p><h2>From confirmation to calibration</h2></div>
          </div>
          <div className="lifecycle-pipeline">
            <div className="pipeline-stage"><strong>1</strong><span>report arrives</span></div>
            <div className="pipeline-stage"><strong>2</strong><span>geo-matched to catchment</span></div>
            <div className="pipeline-stage"><strong>3</strong><span>compares against active alert</span></div>
            <div className="pipeline-stage"><strong>4</strong><span>hit/miss updates POD·FAR</span></div>
            <div className="pipeline-stage"><strong>5</strong><span>queued as training label</span></div>
          </div>
        </section>
      </div>
    </main>
  )
}
