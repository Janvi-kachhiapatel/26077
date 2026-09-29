'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  CloudLightning,
  Droplets,
  Gauge,
  Info,
  Layers3,
  MapPin,
  Menu,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Waves,
  Wind,
  X,
} from 'lucide-react'

const horizons = [0, 1, 2, 3, 4, 5, 6]
const hazardOptions = [
  { id: 'all', label: 'All hazards', icon: Layers3, color: 'cyan' },
  { id: 'storm', label: 'Thunderstorm', icon: CloudLightning, color: 'yellow' },
  { id: 'rain', label: 'Heavy rainfall', icon: Droplets, color: 'blue' },
  { id: 'flood', label: 'Flash flood', icon: Waves, color: 'orange' },
]

const signals = [
  { label: 'IWV accumulation', value: '+18.4 mm / 3h', score: 86, color: 'cyan' },
  { label: 'CAPE / CIN', value: '2,140 / 42 J kg⁻¹', score: 78, color: 'yellow' },
  { label: 'Low-level convergence', value: 'Strong · 0.82', score: 82, color: 'violet' },
  { label: 'CTT drop rate', value: '−7.2 °C / 15m', score: 91, color: 'orange' },
]

const alerts = [
  { time: '14:42', area: 'North Bengaluru', type: 'Thunderstorm', level: 'SEVERE', tone: 'red' },
  { time: '14:18', area: 'Whitefield corridor', type: 'Heavy rainfall', level: 'WATCH', tone: 'yellow' },
  { time: '13:55', area: 'KR Puram basin', type: 'Flash flood', level: 'ADVISORY', tone: 'blue' },
]

export default function Page() {
  const [horizon, setHorizon] = useState(3)
  const [hazard, setHazard] = useState('all')
  const [showLayers, setShowLayers] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [location, setLocation] = useState('Bengaluru Urban')

  const forecast = useMemo(() => ({
    storm: Math.min(94, 61 + horizon * 5),
    rain: Math.min(96, 74 + horizon * 3),
    flood: Math.min(88, 38 + horizon * 7),
  }), [horizon])

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><span>V</span></div>
          <div><p className="brand-name">VAJRA<span>NOW</span></p><p className="brand-sub">SEVERE WEATHER INTELLIGENCE</p></div>
        </div>
        <div className="topbar-status"><span className="live-dot" /> REPLAY MODE <span className="status-divider" /> <span className="muted">Last sync</span> 14:45:12 IST</div>
        <div className="topbar-actions"><button className="icon-button mobile-menu" aria-label="Open menu"><Menu size={18} /></button><button className="location-button"><MapPin size={15} /> {location} <ChevronDown size={14} /></button><button className="icon-button" aria-label="Alerts" onClick={() => setShowAlert(true)}><Bell size={17} /><span className="notification-dot" /></button><div className="avatar">DM</div></div>
      </header>

      <div className="dashboard-grid">
        <aside className="left-rail">
          <div className="rail-section"><p className="eyebrow">Operational view</p><button className="rail-item active"><Gauge size={17} /> Situation overview</button><button className="rail-item"><Radio size={17} /> Live observations <span className="rail-badge">18</span></button><button className="rail-item"><Bell size={17} /> Alert history</button></div>
          <div className="rail-section"><p className="eyebrow">Forecast layers</p>{hazardOptions.slice(1).map(({ id, label, icon: Icon, color }) => <button key={id} onClick={() => setHazard(hazard === id ? 'all' : id)} className={`rail-item ${hazard === id ? 'selected' : ''}`}><span className={`layer-icon ${color}`}><Icon size={14} /></span>{label}<span className={`toggle ${hazard === id ? 'on' : ''}`}><i /></span></button>)}</div>
          <div className="rail-footer"><ShieldCheck size={17} /><div><strong>Prototype safe mode</strong><p>Simulated / replay data only</p></div></div>
        </aside>

        <section className="workspace">
          <div className="workspace-heading"><div><p className="eyebrow">Regional command view · 30 Sep 2026</p><h1>Hyper-local nowcast</h1><p className="heading-caption">Bengaluru Metropolitan Region <span>·</span> 12.97°N, 77.59°E</p></div><button className="outline-button" onClick={() => setShowLayers(!showLayers)}><SlidersHorizontal size={15} /> Configure layers</button></div>
          <div className="map-card">
            <div className="map-toolbar"><div className="segmented">{hazardOptions.map(({ id, label, icon: Icon }) => <button key={id} className={hazard === id ? 'active' : ''} onClick={() => setHazard(id)}><Icon size={14} /> <span>{label}</span></button>)}</div><div className="map-actions"><button className="map-action"><Search size={15} /></button><button className="map-action" onClick={() => setShowLayers(!showLayers)}><Layers3 size={15} /></button></div></div>
            <div className="map-canvas" aria-label="Simulated forecast map of Bengaluru">
              <div className="map-gridlines" /><div className="map-river" /><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" />
              <div className="map-label label-yelahanka">YELAHANKA</div><div className="map-label label-whitefield">WHITEFIELD</div><div className="map-label label-city">BENGALURU</div><div className="map-label label-electronic">ELECTRONIC CITY</div>
              <div className="risk-ring ring-one" /><div className="risk-ring ring-two" /><div className="risk-ring ring-three" /><div className="storm-cell"><CloudLightning size={19} /><span>0.86</span></div><div className="map-pin pin-a"><MapPin size={20} fill="currentColor" /></div><div className="map-pin pin-b"><MapPin size={16} fill="currentColor" /></div>
              {showLayers && <div className="layer-popover"><p className="eyebrow">Visible layers</p><label><i className="swatch cyan" /> Hazard probability <b>ON</b></label><label><i className="swatch violet" /> Uncertainty envelope <b>ON</b></label><label><i className="swatch grey" /> Terrain / drainage <b>ON</b></label></div>}
              <div className="map-scale">0 <span /> 5 km</div><div className="map-source">ILLUSTRATIVE REPLAY · NOT LIVE IMD DATA</div>
            </div>
            <div className="map-legend"><span><i className="legend-gradient" /> Probability of event</span><span><i className="legend-line" /> Uncertainty boundary</span><span><MapPin size={13} /> Selected location</span><span className="legend-note"><Info size={13} /> Values are illustrative</span></div>
          </div>

          <div className="forecast-strip"><div className="strip-head"><div><p className="eyebrow">Replay timeline</p><strong>Forecast window</strong></div><span className="confidence-chip"><Sparkles size={13} /> Confidence: {horizon < 4 ? 'High' : 'Moderate'}</span></div><div className="timeline">{horizons.map((h) => <button key={h} onClick={() => setHorizon(h)} className={`time-node ${horizon === h ? 'active' : ''}`}><span>{h === 0 ? 'NOW' : `+${h}H`}</span><i /></button>)}</div><input className="timeline-range" aria-label="Forecast hour" type="range" min="0" max="6" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} /><div className="timeline-caption"><span>30 Sep · 14:45</span><span>30 Sep · 20:45 IST</span></div></div>

          <div className="metrics-grid"><MetricCard icon={<CloudLightning />} label="Thunderstorm risk" value={`${forecast.storm}%`} status="SEVERE" tone="yellow" detail="Peak near east corridor" /><MetricCard icon={<Droplets />} label="Rainfall intensity" value="64.8" unit="mm/h" status="HIGH" tone="cyan" detail="90th percentile cell" /><MetricCard icon={<Waves />} label="Flash flood risk" value={`${forecast.flood}%`} status="WATCH" tone="orange" detail="Low-lying basins exposed" /><MetricCard icon={<Wind />} label="Max gust forecast" value="48" unit="km/h" status="MODERATE" tone="violet" detail="From southwest sector" /></div>
        </section>

        <aside className="right-panel">
          <div className="panel-header"><div><p className="eyebrow">Selected location</p><h2>Whitefield basin</h2><p className="panel-muted">12.9698°N, 77.7500°E</p></div><button className="icon-button" onClick={() => setShowAlert(false)} aria-label="Close panel"><X size={16} /></button></div>
          <div className="risk-summary"><div className="risk-score"><span>OVERALL RISK</span><strong>{Math.round((forecast.storm + forecast.rain + forecast.flood) / 3)}<small>%</small></strong><em>Elevated</em></div><div className="risk-bars"><RiskBar label="Thunderstorm" value={forecast.storm} color="yellow" /><RiskBar label="Heavy rainfall" value={forecast.rain} color="cyan" /><RiskBar label="Flash flood" value={forecast.flood} color="orange" /></div></div>
          <section className="insight-section"><div className="section-heading"><div><p className="eyebrow">Model-supported signals</p><h3>Why this forecast?</h3></div><Info size={15} /></div>{signals.map((signal) => <div className="signal" key={signal.label}><div className="signal-top"><span>{signal.label}</span><strong>{signal.value}</strong></div><div className="signal-track"><i className={signal.color} style={{ width: `${signal.score}%` }} /></div><span className="signal-score">{signal.score}/100 signal strength</span></div>)}<p className="method-note"><Sparkles size={13} /> Baseline fusion of replay inputs. No live model inference connected.</p></section>
          <section className="insight-section alert-section"><div className="section-heading"><div><p className="eyebrow">Alert engine</p><h3>Recent alerts <span className="count">3</span></h3></div><button className="text-button" onClick={() => setShowAlert(true)}>View all</button></div>{alerts.map((alert) => <div className="alert-row" key={alert.time}><div className={`alert-icon ${alert.tone}`}><AlertTriangle size={14} /></div><div><strong>{alert.area}</strong><p>{alert.type} · {alert.time} IST</p></div><span className={`severity ${alert.tone}`}>{alert.level}</span></div>)}</section>
          <button className="primary-button" onClick={() => setShowAlert(true)}><Bell size={16} /> Preview localized alert</button>
        </aside>
      </div>
      {showAlert && <div className="toast"><div className="toast-icon"><Bell size={16} /></div><div><strong>Alert preview generated</strong><p>Whitefield basin · severe thunderstorm risk at +3h</p></div><button onClick={() => setShowAlert(false)} aria-label="Dismiss alert"><X size={15} /></button></div>}
    </main>
  )
}

function MetricCard({ icon, label, value, unit, status, tone, detail }: { icon: React.ReactNode; label: string; value: string; unit?: string; status: string; tone: string; detail: string }) { return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-label">{label}<span className={`metric-status ${tone}`}>{status}</span></div><div className="metric-value">{value} <small>{unit}</small></div><p>{detail}</p></div> }
function RiskBar({ label, value, color }: { label: string; value: number; color: string }) { return <div className="risk-bar"><div><span>{label}</span><b>{value}%</b></div><div className="bar-track"><i className={color} style={{ width: `${value}%` }} /></div></div> }
