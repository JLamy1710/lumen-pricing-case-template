import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const cities = [
  { name: 'Berlin', share: 18, cagr: 9, intent: 7.4, target: 50.6, dtc: 35.8, gym: 16.0, note: 'Largest named launch market; strongest urban-wellness concentration.' },
  { name: 'Munich', share: 15, cagr: 9, intent: 7.3, target: 42.1, dtc: 31.6, gym: 24.6, note: 'High-growth second city with balanced channel openness.' },
  { name: 'Hamburg', share: 10, cagr: 7, intent: 7.52, target: 50.0, dtc: 22.9, gym: 22.9, note: 'Highest sampled intent, but a smaller addressable market.' },
  { name: 'Cologne', share: 9, cagr: 7, intent: 7.04, target: 48.9, dtc: 28.9, gym: 26.7, note: 'Wellness-led audience with moderate market opportunity.' },
  { name: 'Frankfurt', share: 8, cagr: 7, intent: 7.18, target: 46.9, dtc: 21.9, gym: 25.0, note: 'A viable commuter-led test market, but lower scale.' },
  { name: 'Other Germany', share: 40, cagr: 7, intent: 7.05, target: 43.9, dtc: 26.1, gym: 30.6, note: 'Large but diffuse; unsuitable for a focused first-city pilot.' },
]

const channels = [
  { name: 'DTC Online', contribution: 1.16, margin: 65.1, phase: 'Phase 1', fit: 85, detail: 'Subscription and direct feedback create the clearest learning loop.' },
  { name: 'Gym & Office', contribution: 1.13, margin: 64.6, phase: 'Phase 1', fit: 88, detail: 'Puts LUMEN in front of fitness and wellness-led consumers.' },
  { name: 'Retail / Grocery', contribution: 0.63, margin: 50.3, phase: 'Phase 2', fit: 62, detail: 'Builds reach, but gives up contribution and pilot control.' },
]

const defaults = { growth: 40, fit: 35, margin: 25 }
const clamp = (number, min, max) => Math.max(min, Math.min(max, number))
const normalizeWeights = (weights) => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, (value / total) * 100]))
}
const cityScore = (city, weights) => {
  const w = normalizeWeights(weights)
  const growth = ((city.share / 40) * 65 + ((city.cagr - 7) / 2) * 35)
  const fit = ((city.intent / 7.6) * 55 + (city.target / 51) * 45)
  return growth * (w.growth / 100) + fit * (w.fit / 100) + 72 * (w.margin / 100)
}
const channelScore = (channel, weights) => {
  const w = normalizeWeights(weights)
  const margin = (channel.contribution / 1.16) * 100
  return 76 * (w.growth / 100) + channel.fit * (w.fit / 100) + margin * (w.margin / 100)
}
const fmt = (number) => new Intl.NumberFormat('en-DE', { maximumFractionDigits: 1 }).format(number)

function WeightControl({ label, value, onChange, tone }) {
  return <label className="weight-control">
    <span><strong>{label}</strong><output>{value}%</output></span>
    <input aria-label={`${label} weight`} type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ '--accent': tone }} />
  </label>
}

function App() {
  const [weights, setWeights] = useState(defaults)
  const isDefault = Object.keys(defaults).every((key) => weights[key] === defaults[key])
  const sortedCities = useMemo(() => [...cities].map((city) => ({ ...city, score: cityScore(city, weights) })).sort((a, b) => b.score - a.score), [weights])
  const sortedChannels = useMemo(() => [...channels].map((channel) => ({ ...channel, score: channelScore(channel, weights) })).sort((a, b) => b.score - a.score), [weights])
  const recommendation = sortedCities.find((city) => city.name !== 'Other Germany')
  const strongestWeight = Object.entries(normalizeWeights(weights)).sort((a, b) => b[1] - a[1])[0][0]
  const scenarioMessage = strongestWeight === 'growth'
    ? `This scenario favours market opportunity. ${recommendation.name} is the leading focused-city pilot because it combines the largest named-city share with 9% growth.`
    : strongestWeight === 'fit'
      ? 'This scenario favours audience fit. The city ranking responds most to intent and target-segment concentration.'
      : 'This scenario favours contribution. DTC and Gym & Office lead because each earns roughly €1.13+ per unit at the €2.19 price.'

  return <main>
    <nav className="nav"><a className="brand" href="#top" aria-label="LUMEN LaunchLens home"><span className="brand-mark">L</span> LUMEN <em>LaunchLens</em></a><span className="nav-status">Germany market entry · city & channel module</span></nav>
    <header id="top" className="hero">
      <div><p className="eyebrow">Decision cockpit / 01</p><h1>Launch where learning<br />compounds.</h1><p className="lede">An executive recommendation for LUMEN’s first German city and channel mix, grounded in market opportunity, customer fit, and contribution economics.</p></div>
      <aside className="price-context"><span>Fixed case context</span><strong>€2.19</strong><small>per 330ml can · accessible premium</small></aside>
    </header>

    <section className="recommendation" aria-labelledby="recommendation-title">
      <div className="section-heading"><p className="eyebrow">{isDefault ? 'Recommended plan' : 'Scenario result'}</p><h2 id="recommendation-title">{isDefault ? 'Pilot Berlin. Learn through direct and fitness-led channels.' : `${recommendation.name} leads under this scenario.`}</h2></div>
      <div className="recommendation-grid">
        <article><span className="step">01 / Pilot</span><strong>{isDefault ? 'Berlin' : recommendation.name}</strong><p>{isDefault ? 'DTC Online + Gym & Office' : `${sortedChannels.slice(0, 2).map((channel) => channel.name).join(' + ')}`}</p></article>
        <article><span className="step">02 / Review</span><strong>Measure repeat</strong><p>Validate CAC recovery, repeat purchase, and product-market fit before expanding reach.</p></article>
        <article><span className="step">03 / Expand</span><strong>Munich + grocery</strong><p>Add selective grocery only after the focused pilot establishes the right retail proposition.</p></article>
      </div>
      <p className="tradeoff"><b>The deliberate trade-off:</b> choose healthier contribution and faster customer learning over immediate mass-market grocery volume.</p>
    </section>

    <section className="controls-section" aria-labelledby="controls-title">
      <div><p className="eyebrow">Scenario controls</p><h2 id="controls-title">Change the decision lens.</h2><p>Weights are normalized automatically. The default balance is 40% growth, 35% fit, and 25% margin.</p></div>
      <div className="controls-card">
        <WeightControl label="Growth opportunity" value={weights.growth} tone="#d5b56a" onChange={(growth) => setWeights((current) => ({ ...current, growth }))} />
        <WeightControl label="Customer & channel fit" value={weights.fit} tone="#8ebd9d" onChange={(fit) => setWeights((current) => ({ ...current, fit }))} />
        <WeightControl label="Contribution margin" value={weights.margin} tone="#b7c6a4" onChange={(margin) => setWeights((current) => ({ ...current, margin }))} />
        <button className="reset" type="button" onClick={() => setWeights(defaults)} disabled={isDefault}>Reset recommendation</button>
      </div>
    </section>

    <section className="insight" aria-live="polite"><span>Decision readout</span><p>{isDefault ? 'Berlin wins the default model: 18% of the illustrative market, 9% growth, and a 50.6% urban-wellness / fitness audience share.' : scenarioMessage}</p></section>

    <section className="evidence-section" aria-labelledby="city-title">
      <div className="section-heading split"><div><p className="eyebrow">City evidence</p><h2 id="city-title">Six routes into Germany.</h2></div><p>Market share and CAGR are illustrative 2026 planning inputs. Customer measures are aggregated from 420 German survey responses.</p></div>
      <div className="city-grid">
        {sortedCities.map((city, index) => <article className={`city-card ${index === 0 ? 'leading' : ''}`} key={city.name}>
          <div className="card-top"><span>{String(index + 1).padStart(2, '0')}</span>{city.name === recommendation.name && <span className="tag">Current lead</span>}</div>
          <h3>{city.name}</h3><p>{city.note}</p>
          <div className="metrics"><span><b>{city.share}%</b> market share</span><span><b>{city.cagr}%</b> CAGR</span><span><b>{city.intent}/10</b> intent</span></div>
          <div className="score-row"><span>Composite score</span><b>{fmt(city.score)}</b></div><div className="score-bar"><i style={{ width: `${clamp(city.score, 0, 100)}%` }} /></div>
        </article>)}
      </div>
    </section>

    <section className="channel-section" aria-labelledby="channel-title">
      <div className="section-heading split"><div><p className="eyebrow">Channel economics</p><h2 id="channel-title">Start close to the customer.</h2></div><p>All figures use the case’s €2.19 price test. Contribution is what LUMEN earns per unit after channel costs.</p></div>
      <div className="channel-grid">
        {sortedChannels.map((channel, index) => <article className={`channel-card ${channel.phase === 'Phase 2' ? 'phase-two' : ''}`} key={channel.name}>
          <div className="card-top"><span className="tag">{channel.phase}</span><span>Rank {index + 1}</span></div><h3>{channel.name}</h3><p>{channel.detail}</p>
          <strong className="contribution">€{channel.contribution.toFixed(2)} <small>contribution / unit</small></strong>
          <div className="channel-bottom"><span>{channel.margin}% contribution margin</span><b>{fmt(channel.score)}</b></div>
        </article>)}
      </div>
    </section>

    <section className="method"><p className="eyebrow">Method & guardrails</p><h2>A decision framework, not a prediction.</h2><p>LaunchLens synthesizes market context, price-test economics, and aggregated survey signals. It does not include names, emails, or raw respondent records; it does not claim post-launch German performance.</p></section>
    <footer><span>Built from LUMEN case exhibits 1, 4, 9 and 11.</span><span>City & channel module · v1</span></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)

