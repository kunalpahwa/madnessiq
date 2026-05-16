import { trip } from '../data.js'

const fmt = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric'
})

export default function PhaseTimeline({ today }) {
  return (
    <div className="phases">
      {trip.phases.map(p => {
        const active = today >= p.start && today < p.end
        return (
          <div key={p.id} className={`phase-card phase-${p.color} ${active ? 'is-active' : ''}`}>
            <div className="phase-dates">{fmt(p.start)} → {fmt(p.end)}</div>
            <h3>{p.label}</h3>
            <div className="phase-location">{p.location}</div>
            <p>{p.summary}</p>
            {active && <div className="phase-pill">currently here</div>}
          </div>
        )
      })}
    </div>
  )
}
