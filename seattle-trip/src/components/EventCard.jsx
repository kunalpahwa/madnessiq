import { useCountdown } from '../hooks/useCountdown.js'

const fmtFull = (iso) => new Date(iso).toLocaleString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
})

export default function EventCard({ event }) {
  const cd = useCountdown(event.datetime)
  return (
    <div className="event-card">
      <div className="event-head">
        <h3>{event.name}</h3>
        <div className="event-when">{fmtFull(event.datetime)}</div>
      </div>
      <div className="event-venue">{event.venue}</div>
      {event.notes && <p className="event-notes">{event.notes}</p>}
      <div className="event-cd">
        {cd.past ? (
          <span className="cd-pill cd-past">happened</span>
        ) : (
          <>
            <span className="cd-pill">{cd.days}d</span>
            <span className="cd-pill">{cd.hours}h</span>
            <span className="cd-pill">{cd.minutes}m</span>
            <span className="cd-pill">{cd.seconds}s</span>
          </>
        )}
      </div>
    </div>
  )
}
