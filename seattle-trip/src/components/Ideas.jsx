import { useState } from 'react'
import { trip } from '../data.js'

const GROUPS = [
  { key: 'phinney', label: 'Phinney + nearby' },
  { key: 'seattle', label: 'Greater Seattle' },
  { key: 'orcas',   label: 'Orcas Island' },
]

export default function Ideas() {
  const [active, setActive] = useState('phinney')
  const items = trip.ideas[active] || []
  return (
    <div className="ideas">
      <div className="ideas-tabs">
        {GROUPS.map(g => (
          <button
            key={g.key}
            className={`tab ${active === g.key ? 'is-active' : ''}`}
            onClick={() => setActive(g.key)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="ideas-grid">
        {items.map(it => (
          <div key={it.name} className="idea-card">
            <div className="idea-tag">{it.tag}</div>
            <div className="idea-name">{it.name}</div>
            <div className="idea-notes">{it.notes}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
