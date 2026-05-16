import { trip } from '../data.js'

export default function Logistics() {
  const { ferry, worldCup, parking } = trip.logistics
  return (
    <div className="logistics">
      <div className="log-card">
        <h3>Cars</h3>
        <ul className="log-list">
          {trip.cars.map(c => (
            <li key={c.name}>
              <strong>{c.name}</strong> · {c.seats} seats · {c.notes}
            </li>
          ))}
        </ul>
        <p className="log-note">
          Two cars total = {trip.cars.reduce((s, c) => s + c.seats, 0)} seats for {trip.totals.adults + trip.totals.kids} people. Splits easy.
        </p>
      </div>

      <div className="log-card">
        <h3>Ferry to Orcas</h3>
        <div className="log-sub">{ferry.route} — {ferry.operator}</div>
        <ul className="log-list">
          {ferry.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        <a className="log-link" href={ferry.bookingUrl} target="_blank" rel="noreferrer">
          Book / manage reservation →
        </a>
      </div>

      <div className="log-card">
        <h3>World Cup match</h3>
        <div className="log-sub">{worldCup.venue}</div>
        <ul className="log-list">
          <li>{worldCup.transitTip}</li>
          <li>Kickoff: {worldCup.kickoff}</li>
        </ul>
      </div>

      <div className="log-card">
        <h3>Parking</h3>
        <p>{parking.notes}</p>
      </div>
    </div>
  )
}
