import { useMemo } from 'react'
import { trip, TODAY_OVERRIDE } from './data.js'
import Hero from './components/Hero.jsx'
import Section from './components/Section.jsx'
import PhaseTimeline from './components/PhaseTimeline.jsx'
import People from './components/People.jsx'
import EventCard from './components/EventCard.jsx'
import WeatherCard from './components/WeatherCard.jsx'
import Itinerary from './components/Itinerary.jsx'
import Logistics from './components/Logistics.jsx'
import Ideas from './components/Ideas.jsx'
import PackingList from './components/PackingList.jsx'

export default function App() {
  const today = useMemo(() => {
    if (TODAY_OVERRIDE) return TODAY_OVERRIDE
    const d = new Date()
    return d.toISOString().slice(0, 10)
  }, [])

  const seattle = trip.phases[0].coords
  const orcas   = trip.phases[1].coords

  return (
    <div className="app">
      <nav className="topnav">
        <div className="brand">SEA × ORCAS · ’26</div>
        <div className="navlinks">
          <a href="#phases">Phases</a>
          <a href="#events">Events</a>
          <a href="#weather">Weather</a>
          <a href="#itinerary">Itinerary</a>
          <a href="#ideas">Ideas</a>
          <a href="#logistics">Logistics</a>
          <a href="#packing">Packing</a>
        </div>
      </nav>

      <Hero now={today} />

      <main className="container">
        <Section id="phases" eyebrow="The plan" title="Three phases">
          <PhaseTimeline today={today} />
        </Section>

        <Section id="people" eyebrow="The crew" title="Who's coming">
          <People />
        </Section>

        <Section id="events" eyebrow="Don't miss" title="Big-ticket moments">
          <div className="events-grid">
            {trip.bigEvents.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </Section>

        <Section id="weather" eyebrow="Live" title="Weather">
          <div className="weather-grid">
            <WeatherCard label="Phinney Ridge, Seattle" lat={seattle.lat} lon={seattle.lon} />
            <WeatherCard label="Orcas Island"           lat={orcas.lat}   lon={orcas.lon} />
          </div>
        </Section>

        <Section id="itinerary" eyebrow="Day by day" title="Draft itinerary">
          <Itinerary today={today} />
        </Section>

        <Section id="ideas" eyebrow="Bank of options" title="Things to do">
          <Ideas />
        </Section>

        <Section id="logistics" eyebrow="Don't forget" title="Logistics">
          <Logistics />
        </Section>

        <Section id="packing" eyebrow="Bring it" title="Packing list">
          <PackingList />
        </Section>
      </main>

      <footer className="foot">
        <div>{trip.meta.title} · {trip.meta.dateRange}</div>
        <div className="foot-sub">Edit the trip in <code>src/data.js</code></div>
      </footer>
    </div>
  )
}
