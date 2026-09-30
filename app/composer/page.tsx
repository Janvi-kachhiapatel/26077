'use client'

import { useState } from 'react'
import { Bell, CheckCircle2, Info, Languages, Send, ShieldAlert } from 'lucide-react'
import { SIM_TIMESTAMP, fmtPop, hazardAt, overallRisk, recommendedAction, regions } from '@/lib/engine'
import { useStore } from '@/lib/store'

const LANGS: { id: 'en' | 'hi' | 'kn'; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'kn', label: 'ಕನ್ನಡ' },
]

const CHANNELS = ['SMS', 'Cell broadcast', 'App push', 'IVR voice', 'Sirens', 'Social']

const HAZARD_LABEL = { storm: 'Severe thunderstorm', rain: 'Heavy rainfall', flood: 'Flash flood' } as const

export default function ComposerPage() {
  const { regionId, catchmentId, setCatchmentId, createDraft, sendToApproval, alerts, role } = useStore()
  const region = regions[regionId]
  const c = region.catchments.find((x) => x.id === catchmentId) ?? region.catchments[0]
  const overall = overallRisk(regionId, c.id, 3)

  const [hazard, setHazard] = useState<'storm' | 'rain' | 'flood'>('storm')
  const [level, setLevel] = useState<'ADVISORY' | 'WATCH' | 'WARNING' | 'IMMINENT'>('WARNING')
  const [language, setLanguage] = useState<'en' | 'hi' | 'kn'>('en')
  const [channels, setChannels] = useState<string[]>(['SMS', 'App push'])
  const [lastDraftId, setLastDraftId] = useState<string | null>(null)

  const prob = hazardAt(regionId, c.id, hazard, 3).p50
  const headline = `${HAZARD_LABEL[hazard]} likely over ${c.name}`
  const instruction = recommendedAction(regionId, c.id)
  const draft = alerts.find((a) => a.id === lastDraftId)

  const toggleChannel = (ch: string) =>
    setChannels((list) => (list.includes(ch) ? list.filter((x) => x !== ch) : [...list, ch]))

  function handleCreate() {
    const msg = createDraft({
      hazard, level, language, channels, catchment: c.name,
      headline: `${HAZARD_LABEL[hazard]} likely over ${c.name}`,
      instruction, probability: prob, windowMin: [30, 90],
      audit: [{ at: 'now', by: 'You', action: 'Draft created in composer' }],
    })
    setLastDraftId(msg.id)
  }

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{region.eventLabel} · {SIM_TIMESTAMP}</p>
            <h1>Alert composer</h1>
            <p className="heading-caption">
              Impact-based wording · cost-loss thresholds · CAP 1.2 output (mock gateway)
            </p>
          </div>
          <span className="provenance-badge"><Info size={13} /> Nothing is sent — mock gateway only</span>
</div>

        <div className="composer-layout">
          {/* Form column */}
          <div className="panel-card">
            <div className="section-heading">
              <div><p className="eyebrow">Step 1 · Select</p><h2>Target, hazard, severity</h2></div>
            </div>

            <label className="form-label">Catchment</label>
            <div className="chip-row">
              {region.catchments.map((k) => (
                <button key={k.id} className={`chip ${k.id === c.id ? 'active' : ''}`} onClick={() => setCatchmentId(k.id)}>{k.name}</button>
              ))}
            </div>

            <label className="form-label">Hazard</label>
            <div className="chip-row">
              {(['storm', 'rain', 'flood'] as const).map((h) => (
                <button key={h} className={`chip ${hazard === h ? 'active' : ''}`} onClick={() => setHazard(h)}>
                  {HAZARD_LABEL[h]} · {hazardAt(regionId, c.id, h, 3).p50}%
                </button>
              ))}
            </div>

            <label className="form-label">Severity level</label>
            <div className="chip-row">
              {(['ADVISORY', 'WATCH', 'WARNING', 'IMMINENT'] as const).map((l) => (
                <button key={l} className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
              ))}
            </div>

            <label className="form-label">Channels</label>
            <div className="chip-row">
              {CHANNELS.map((ch) => (
                <button key={ch} className={`chip ${channels.includes(ch) ? 'active' : ''}`} onClick={() => toggleChannel(ch)}>{ch}</button>
              ))}
            </div>

            <div className="costloss-box">
              <p className="eyebrow">Cost-loss rationale (why this level)</p>
              <p>
                At {prob}% calibrated probability and a cost-loss ratio of ~0.25 for {level === 'WARNING' || level === 'IMMINENT' ? 'protective action (evacuation/traffic control)' : 'passive preparation'},
                alerting is the cheaper side of the expected-loss equation for {fmtPop(c.population)} residents.
              </p>
            </div>

            <button className="primary-button" onClick={handleCreate}>
              <Bell size={15} /> Create draft (from engine values)
            </button>
            {draft && (
              <p className="method-note"><CheckCircle2 size={13} /> Draft <b>{draft.id}</b> created — send it to the approval queue below.</p>
            )}
          </div>

          {/* Preview column */}
          <div className="panel-card wide">
            <div className="section-heading">
              <div><p className="eyebrow">Step 2 · Review</p><h2>CAP message preview</h2></div>
              <div className="lang-switch">
                <Languages size={13} />
                {LANGS.map((l) => (
                  <button key={l.id} className={`lang-chip ${language === l.id ? 'active' : ''}`} onClick={() => setLanguage(l.id)}>{l.label}</button>
                ))}
              </div>
            </div>

            <div className="cap-preview">
              <div className="cap-head">
                <span className={`cap-level ${level.toLowerCase()}`}>{level}</span>
                <span className="cap-id">{draft ? draft.id : 'VJ-DRAFT-PREVIEW'}</span>
              </div>
              <p className="cap-headline">{draft ? draft.headline : headline}</p>
              <div className="cap-grid">
                <div><span>Window</span><strong>+{draft ? draft.windowMin[0] : 30}–{draft ? draft.windowMin[1] : 90} min</strong></div>
                <div><span>Calibrated probability</span><strong>{prob}%</strong></div>
                <div><span>Population</span><strong>{fmtPop(c.population)}</strong></div>
                <div><span>Language</span><strong>{LANGS.find((l) => l.id === language)?.label}</strong></div>
              </div>
              <div className="cap-instruction">
                <p className="eyebrow">What to do</p>
                <p>{language === 'en' ? instruction : language === 'hi' ? translatedHi(instruction) : translatedKn(instruction)}</p>
              </div>
              <div className="cap-channels">
                <p className="eyebrow">Channels</p>
                <div className="chip-row">
                  {(draft ? draft.channels : channels).map((ch) => <span className="chip" key={ch}>{ch}</span>)}
                </div>
              </div>
              <p className="method-note">
                <Info size={13} /> CAP 1.2 XML is generated on dispatch (mock gateway logs it). Adapter path to NDMA's Sachet
                platform is the documented integration plan — not claimed as done.
              </p>
            </div>

            <div className="approval-flow">
              <p className="eyebrow">Step 3 · Four-eyes approval</p>
              <p className="method-note">
                <ShieldAlert size={13} /> {level === 'WARNING' || level === 'IMMINENT'
                  ? 'Severe levels require a second signatory (district disaster manager) before dispatch. Advisory/Watch can dispatch on single sign-off.'
                  : 'Advisory/Watch can dispatch on the forecaster\'s sign-off alone.'}
              </p>
              <button
                className="primary-button"
                disabled={!draft || draft.lifecycle !== 'draft'}
                onClick={() => { if (draft) { sendToApproval(draft.id); setLastDraftId(draft.id) } }}
              >
                <Send size={15} /> Send to approval queue
              </button>
              {draft?.lifecycle === 'pending' && (
                <p className="method-note"><CheckCircle2 size={13} /> In queue. Open <b>Approval queue</b> and switch to the district role to approve.</p>
              )}
              {alerts.filter((a) => a.lifecycle === 'pending').length > 0 && (
                <p className="method-note"><Info size={13} /> {alerts.filter((a) => a.lifecycle === 'pending').length} alert(s) waiting in the queue.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/** Placeholder translations — flagged as templates, not claimed as production i18n. */
function translatedHi(s: string): string {
  return `[हिन्दी अनुवाद — टेम्पलेट] ${s}`
}
function translatedKn(s: string): string {
  return `[ಕನ್ನಡ ಅನುವಾದ — ಟೆಂಪ್ಲೇಟ್] ${s}`
}
