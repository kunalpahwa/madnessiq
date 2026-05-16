import { trip } from '../data.js'

const fmt = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
  weekday: 'long', month: 'short', day: 'numeric'
})

export default function Itinerary({ today }) {
  return (
    <div className="itinerary">
      {trip.days.map(day => {
        const phase = trip.phases.find(p => p.id === day.phaseId)
        const isToday = day.date === today
        return (
          <article
            key={day.date}
            id={`day-${day.date}`}
            className={`day phase-${phase?.color || 'blue'} ${isToday ? 'is-today' : ''}`}
          >
            <div className="day-rail" />
            <div className="day-head">
              <div className="day-date">{fmt(day.date)}</div>
              <div className="day-phase">{phase?.location}</div>
              {isToday && <div className="day-today">today</div>}
            </div>
            <h3 className="day-title">{day.title}</h3>
            <ul className="day-items">
              {day.items.map((it, i) => (
                <li key={i}>
                  <span className="when">{it.time}</span>
                  <span className="what">{it.text}</span>
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}
