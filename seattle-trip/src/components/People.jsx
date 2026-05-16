import { trip } from '../data.js'

function PersonChip({ name, sub }) {
  return (
    <div className="chip">
      <div className="chip-name">{name}</div>
      {sub && <div className="chip-sub">{sub}</div>}
    </div>
  )
}

function Family({ family }) {
  return (
    <div className="family">
      <h3>{family.label}</h3>
      <div className="chip-row">
        {family.adults.map((a, i) => (
          <PersonChip
            key={'a' + i}
            name={a.name}
            sub={a.arrives ? `${a.arrives.slice(5)} – ${a.leaves.slice(5)}` : a.role}
          />
        ))}
        {family.kids.map((k, i) => (
          <PersonChip key={'k' + i} name={k.name} sub={`age ${k.age}`} />
        ))}
      </div>
    </div>
  )
}

export default function People() {
  return (
    <div className="people">
      <Family family={trip.people.host} />
      <Family family={trip.people.guests} />
    </div>
  )
}
