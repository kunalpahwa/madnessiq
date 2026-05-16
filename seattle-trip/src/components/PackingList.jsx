import { useEffect, useState } from 'react'
import { trip } from '../data.js'

const STORAGE_KEY = 'seattle-trip-packing-v1'

function loadChecked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export default function PackingList() {
  const [checked, setChecked] = useState(loadChecked)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
  }, [checked])

  const toggle = (key) => setChecked(c => ({ ...c, [key]: !c[key] }))

  const sections = [
    { key: 'everyone',  label: 'Everyone' },
    { key: 'kids',      label: 'Kids' },
    { key: 'adults',    label: 'Adults' },
    { key: 'orcasOnly', label: 'Orcas extras' },
  ]

  return (
    <div className="packing">
      {sections.map(s => (
        <div key={s.key} className="pack-col">
          <h3>{s.label}</h3>
          <ul>
            {(trip.packing[s.key] || []).map(item => {
              const id = `${s.key}::${item}`
              const isOn = !!checked[id]
              return (
                <li key={id} className={isOn ? 'is-checked' : ''}>
                  <label>
                    <input type="checkbox" checked={isOn} onChange={() => toggle(id)} />
                    <span>{item}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
