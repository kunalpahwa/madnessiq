import { trip } from '../data.js'
import { useCountdown } from '../hooks/useCountdown.js'

function CountdownTile({ label, value }) {
  return (
    <div className="cd-tile">
      <div className="cd-value">{String(value).padStart(2, '0')}</div>
      <div className="cd-label">{label}</div>
    </div>
  )
}

export default function Hero({ now }) {
  // First arrival is the earliest event we care about
  const firstArrival = trip.people.guests.adults
    .map(a => a.arrives)
    .filter(Boolean)
    .sort()[0]

  const target = firstArrival ? `${firstArrival}T12:00:00-07:00` : trip.bigEvents[0].datetime
  const cd = useCountdown(target)

  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-tag">{trip.meta.dateRange}</div>
        <h1>{trip.meta.title}</h1>
        <p className="hero-sub">{trip.meta.subtitle}</p>

        <div className="hero-stats">
          <div><strong>{trip.totals.adults}</strong> adults</div>
          <div><strong>{trip.totals.kids}</strong> kids</div>
          <div><strong>{trip.phases.length}</strong> phases</div>
          <div><strong>{trip.cars.length}</strong> cars</div>
        </div>

        <div className="hero-countdown">
          <div className="cd-caption">
            {cd.past ? 'Trip in progress' : 'Countdown to first arrival'}
          </div>
          <div className="cd-row">
            <CountdownTile label="days"    value={cd.days} />
            <CountdownTile label="hours"   value={cd.hours} />
            <CountdownTile label="minutes" value={cd.minutes} />
            <CountdownTile label="seconds" value={cd.seconds} />
          </div>
        </div>
      </div>
    </header>
  )
}
