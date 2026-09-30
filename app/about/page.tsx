'use client'

import { AlertTriangle, BookOpen, Cpu, Database, Info, Target } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">SIH26077 · MoES / NCMRWF · severe weather nowcasting</p>
            <h1>About &amp; limits</h1>
            <p className="heading-caption">
              What this is, what it is not, and every dataset and model behind it
            </p>
          </div>
          <span className="provenance-badge"><Info size={13} /> Honest prototype — replay data only</span>
        </div>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow"><Target size={12} /> The pitch</p><h2>One sentence</h2></div>
          </div>
          <p className="big-pitch">
            A probabilistic 0–6 hour hazard engine that turns satellite, radar and model data into calibrated
            micro-catchment risk, converts risk into impact- and cost-aware alert drafts, and dispatches
            human-approved CAP 1.2 alerts — while showing its own skill and data health.
          </p>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow"><Cpu size={12} /> Architecture</p><h2>Pipeline</h2></div>
          </div>
          <div className="lifecycle-pipeline wrap">
            {['Ingest', 'QC + data age', 'Nowcast ensemble', 'Calibration', 'Impact layer', 'Decision thresholds', 'Human approval', 'CAP 1.2', 'Channels', 'Delivery + feedback', 'Verification', 'Retraining'].map((s) => (
              <div className="pipeline-stage" key={s}><span>{s}</span></div>
            ))}
          </div>
          <p className="method-note"><Info size={13} /> This prototype implements the decision layer, alert chain, verification and data-health surfaces end-to-end in simulation; the ingest and ML training rows are the documented next build phase.</p>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow"><BookOpen size={12} /> Model card</p><h2>skysentinel-replay v0.9.2 (simulated decision layer)</h2></div>
          </div>
          <div className="cap-grid">
            <div><span>Task</span><strong>0–6 h probabilistic hazard nowcasting</strong></div>
            <div><span>Members</span><strong>24 shifted-extrapolation ensemble members</strong></div>
            <div><span>Calibration</span><strong>isotonic · reliability-checked</strong></div>
            <div><span>Intended use</span><strong>decision support — a human approves every severe alert</strong></div>
            <div><span>Out of scope</span><strong>hydrodynamic inundation modelling; nowcasting outside 0–6 h</strong></div>
            <div><span>Known failure cases</span><strong>very short-lived cells &lt; 20 min; orographic rows with stale radar; night-time visual confirmation gaps</strong></div>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow"><Database size={12} /> Data register</p><h2>Sources &amp; licences (to be verified at integration)</h2></div>
          </div>
          <div className="tracker-table">
            <div className="tracker-row tracker-head"><span>Source</span><span>Used for</span><span>Reality check</span></div>
            <DataRow src="INSAT-3DR/3DS (MOSDAC)" use="cloud-top temp, water vapour" note="registration; cadence & latency to verify" />
            <DataRow src="IMD Doppler radar network" use="precipitation echo, motion" note="access restricted — archive samples or roadmap" />
            <DataRow src="NASA GPM IMERG" use="rainfall labels + verification" note="free; hours of latency — not live" />
            <DataRow src="ERA5 / GFS / Open-Meteo" use="CAPE, shear, moisture" note="ERA5 lags days; live from GFS/Open-Meteo" />
            <DataRow src="Copernicus DEM / MERIT Hydro" use="terrain, flow accumulation, HAND" note="free" />
            <DataRow src="ESA WorldCover · WorldPop · OSM" use="land cover, population, assets" note="free" />
            <DataRow src="IITM lightning · India-WRIS" use="lightning, river gauges" note="limited access — marked roadmap" />
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div><p className="eyebrow"><AlertTriangle size={12} /> Honesty statement</p><h2>What is real in this prototype</h2></div>
          </div>
          <ul className="asset-list">
            <li><Info size={13} /> <b>Real:</b> the decision logic, CAP structure, lifecycle state machine, verification methodology and UI you can click through end-to-end.</li>
            <li><Info size={13} /> <b>Simulated:</b> all observations, forecasts and delivery numbers — generated deterministically from a replayed event script.</li>
            <li><Info size={13} /> <b>Next build phase:</b> real ingest (MOSDAC/IMERG), trained hazard model with published skill, Sachet-adapter integration, citizen PWA offline mode.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

function DataRow({ src, use, note }: { src: string; use: string; note: string }) {
  return (
    <div className="tracker-row">
      <strong>{src}</strong>
      <span>{use}</span>
      <span className="muted">{note}</span>
    </div>
  )
}
