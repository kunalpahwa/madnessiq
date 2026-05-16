import { useWeather, wmoCode } from '../hooks/useWeather.js'

const fmtDay = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
  weekday: 'short', month: 'numeric', day: 'numeric',
})

function Icon({ kind }) {
  // Tiny inline SVG so we avoid an icon dep
  const stroke = 'currentColor'
  switch (kind) {
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
        </svg>
      )
    case 'cloud-sun':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 2v2M2 8h2M3.5 3.5l1.4 1.4" />
          <path d="M6 17h11a3 3 0 0 0 0-6 4 4 0 0 0-7.7-1.4" />
        </svg>
      )
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M6 17h11a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 17z" />
        </svg>
      )
    case 'rain':
    case 'drizzle':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M6 14h11a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 14z" />
          <path d="M8 18v2M12 18v3M16 18v2" />
        </svg>
      )
    case 'snow':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19" />
        </svg>
      )
    case 'fog':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M3 9h18M3 13h18M5 17h14" />
        </svg>
      )
    case 'storm':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={stroke} strokeWidth="1.6">
          <path d="M6 14h11a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 14z" />
          <path d="M11 16l-2 4h3l-1 4" />
        </svg>
      )
    default:
      return null
  }
}

export default function WeatherCard({ label, lat, lon }) {
  const { loading, error, data } = useWeather(lat, lon)

  if (loading) return <div className="wx-card"><div className="wx-loc">{label}</div><div>loading…</div></div>
  if (error)   return <div className="wx-card"><div className="wx-loc">{label}</div><div className="wx-err">weather offline</div></div>
  if (!data)   return null

  const cur = data.current
  const daily = data.daily
  const [curLabel, curIcon] = wmoCode(cur.weather_code)

  return (
    <div className="wx-card">
      <div className="wx-head">
        <div className="wx-loc">{label}</div>
        <div className="wx-icon"><Icon kind={curIcon} /></div>
      </div>

      <div className="wx-now">
        <div className="wx-temp">{Math.round(cur.temperature_2m)}°</div>
        <div className="wx-meta">
          <div>{curLabel}</div>
          <div className="wx-sub">wind {Math.round(cur.wind_speed_10m)} mph · hum {Math.round(cur.relative_humidity_2m)}%</div>
        </div>
      </div>

      <div className="wx-forecast">
        {daily.time.slice(0, 5).map((d, i) => {
          const [, ic] = wmoCode(daily.weather_code[i])
          return (
            <div className="wx-day" key={d}>
              <div className="wx-day-name">{fmtDay(d)}</div>
              <div className="wx-day-icon"><Icon kind={ic} /></div>
              <div className="wx-day-temps">
                {Math.round(daily.temperature_2m_max[i])}° / {Math.round(daily.temperature_2m_min[i])}°
              </div>
              <div className="wx-day-pop">{daily.precipitation_probability_max[i] ?? 0}%</div>
            </div>
          )
        })}
      </div>
      <div className="wx-credit">powered by open-meteo · 5-day forecast updates today</div>
    </div>
  )
}
