import { useEffect, useState } from 'react'

// Open-Meteo — no API key required.
// Docs: https://open-meteo.com/en/docs
export function useWeather(lat, lon) {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    if (lat == null || lon == null) return
    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
                `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
                `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=5`

    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setState({ loading: false, error: null, data }) })
      .catch(err => { if (!cancelled) setState({ loading: false, error: err.message, data: null }) })

    return () => { cancelled = true }
  }, [lat, lon])

  return state
}

// WMO weather code → short label + simple icon shape
export const wmoCode = (code) => {
  const map = {
    0:  ['Clear', 'sun'],
    1:  ['Mainly clear', 'sun'],
    2:  ['Partly cloudy', 'cloud-sun'],
    3:  ['Overcast', 'cloud'],
    45: ['Fog', 'fog'],
    48: ['Rime fog', 'fog'],
    51: ['Light drizzle', 'drizzle'],
    53: ['Drizzle', 'drizzle'],
    55: ['Heavy drizzle', 'drizzle'],
    61: ['Light rain', 'rain'],
    63: ['Rain', 'rain'],
    65: ['Heavy rain', 'rain'],
    71: ['Light snow', 'snow'],
    73: ['Snow', 'snow'],
    75: ['Heavy snow', 'snow'],
    80: ['Showers', 'rain'],
    81: ['Showers', 'rain'],
    82: ['Heavy showers', 'rain'],
    95: ['Thunderstorm', 'storm'],
    96: ['T-storm + hail', 'storm'],
    99: ['T-storm + hail', 'storm'],
  }
  return map[code] || ['—', 'cloud']
}
