// All trip data lives here. Edit freely — the UI reads from this file.
// Anything marked TODO is a guess or placeholder.

export const trip = {
  meta: {
    title: 'Seattle + Orcas',
    dateRange: 'June 16–29, 2026',
    subtitle: 'Phinney HQ → Orcas Island → back to Phinney',
    homeBase: 'Phinney Ridge, Seattle',
    orcasBase: 'Orcas Island Airbnb', // TODO: paste exact address
  },

  // ---------- People ----------
  people: {
    host: {
      label: 'Host family (Phinney)',
      adults: [
        { name: 'You',  role: 'Host' },     // TODO: name
        { name: 'Wife', role: 'Host' },     // TODO: name
      ],
      kids: [
        { name: 'Daughter', age: 8 },       // TODO: name
        { name: 'Daughter', age: 6 },       // TODO: name
      ],
    },
    guests: {
      label: 'Guests (from DC)',
      adults: [
        { name: 'Early guest', role: 'Adult', arrives: '2026-06-16', leaves: '2026-06-28' }, // TODO: name + exact leave date
        { name: 'Parent 1',    role: 'Adult', arrives: '2026-06-18', leaves: '2026-06-28' }, // TODO
        { name: 'Parent 2',    role: 'Adult', arrives: '2026-06-18', leaves: '2026-06-28' }, // TODO
      ],
      kids: [
        { name: 'Girl', age: 8, arrives: '2026-06-18', leaves: '2026-06-28' }, // TODO: name
        { name: 'Girl', age: 5, arrives: '2026-06-18', leaves: '2026-06-28' }, // TODO: name
      ],
    },
  },

  totals: { adults: 5, kids: 4 },

  // ---------- Cars ----------
  cars: [
    { name: 'BMW X5',         seats: 5, owner: 'Host', notes: 'Primary family hauler' },
    { name: 'Subaru Crosstrek', seats: 5, owner: 'Host', notes: 'Better for trail / ferry deck' },
  ],

  // ---------- Trip phases ----------
  phases: [
    {
      id: 'seattle-1',
      label: 'Seattle — arrivals + World Cup',
      start: '2026-06-16',
      end:   '2026-06-20',
      location: 'Phinney Ridge',
      coords: { lat: 47.6794, lon: -122.3536 },
      tz: 'America/Los_Angeles',
      color: 'blue',
      summary: 'Guests trickle in, settle in Phinney. Juneteenth + USA v Australia at Lumen.',
    },
    {
      id: 'orcas',
      label: 'Orcas Island',
      start: '2026-06-20',
      end:   '2026-06-26',
      location: 'Orcas Island',
      coords: { lat: 48.6628, lon: -122.9302 },
      tz: 'America/Los_Angeles',
      color: 'green',
      summary: 'Big Airbnb. Hikes, lake swims, Eastsound, slow island days.',
    },
    {
      id: 'seattle-2',
      label: 'Seattle — return + departures',
      start: '2026-06-26',
      end:   '2026-06-29',
      location: 'Phinney Ridge',
      coords: { lat: 47.6794, lon: -122.3536 },
      tz: 'America/Los_Angeles',
      color: 'amber',
      summary: 'Back at the house. Pike Place, brunches, goodbyes.',
    },
  ],

  // ---------- Big events to countdown ----------
  bigEvents: [
    {
      id: 'world-cup',
      datetime: '2026-06-19T19:00:00-07:00', // TODO: confirm actual kickoff time
      name: 'USA vs Australia — FIFA World Cup 2026',
      venue: 'Lumen Field, Seattle',
      notes: 'Group stage. Juneteenth holiday. Sort transit + parking early.',
    },
    {
      id: 'orcas-ferry',
      datetime: '2026-06-20T11:00:00-07:00', // TODO: actual reservation time
      name: 'Ferry to Orcas',
      venue: 'Anacortes Terminal',
      notes: 'Reserve well ahead via WSDOT. Arrive 60+ min early.',
    },
  ],

  // ---------- Day-by-day (draft — edit anything) ----------
  days: [
    {
      date: '2026-06-16', phaseId: 'seattle-1', title: 'Early guest arrives',
      items: [
        { time: 'PM',     text: 'Airport pickup → Phinney' },
        { time: 'Dinner', text: 'Easy dinner at home or 74th Street Ale House' },
      ],
    },
    {
      date: '2026-06-17', phaseId: 'seattle-1', title: 'Phinney warm-up',
      items: [
        { time: 'AM', text: 'Woodland Park Zoo (literally next door)' },
        { time: 'PM', text: 'Green Lake loop / ice cream at Frankie & Jo\'s' },
      ],
    },
    {
      date: '2026-06-18', phaseId: 'seattle-1', title: 'Rest of the DC crew arrives',
      items: [
        { time: 'Afternoon', text: 'Pickups → home' },
        { time: 'Evening',   text: 'Welcome dinner at the house. Easy.' },
      ],
    },
    {
      date: '2026-06-19', phaseId: 'seattle-1', title: 'Juneteenth + USA vs Australia',
      items: [
        { time: 'AM', text: 'Slow morning. Pack for Orcas tonight.' },
        { time: 'Midday', text: 'Discovery Park or Ballard Locks (low-key, kid-friendly)' },
        { time: 'Evening', text: 'USA v Australia at Lumen Field. Light Rail from Westlake.' },
      ],
    },
    {
      date: '2026-06-20', phaseId: 'orcas', title: 'Ferry day → Orcas',
      items: [
        { time: 'Early AM', text: 'Drive Phinney → Anacortes (~90 min, leave buffer)' },
        { time: 'Midday',   text: 'Ferry to Orcas. Both cars on board.' },
        { time: 'Afternoon', text: 'Groceries in Eastsound (Island Market). Check in to Airbnb.' },
      ],
    },
    {
      date: '2026-06-21', phaseId: 'orcas', title: 'Cascade Lake + easy hike',
      items: [
        { time: 'AM', text: 'Swim / paddle at Cascade Lake (Moran State Park)' },
        { time: 'PM', text: 'Short loop hike — Cascade Falls (kid-friendly)' },
      ],
    },
    {
      date: '2026-06-22', phaseId: 'orcas', title: 'Eastsound morning',
      items: [
        { time: 'AM', text: 'Brown Bear Bakery, shop the town' },
        { time: 'PM', text: 'Beach time at North Beach or Indralaya' },
      ],
    },
    {
      date: '2026-06-23', phaseId: 'orcas', title: 'Mt Constitution + Doe Bay',
      items: [
        { time: 'AM', text: 'Drive up Mt Constitution lookout' },
        { time: 'Lunch', text: 'Doe Bay Cafe' },
        { time: 'PM', text: 'Hot tub / Doe Bay sauna for adults if open' },
      ],
    },
    {
      date: '2026-06-24', phaseId: 'orcas', title: 'Water day',
      items: [
        { time: 'AM', text: 'Kayak or whale-watch out of Deer Harbor (5yo may sit out kayak)' },
        { time: 'Dinner', text: 'Pizza night in at the Airbnb' },
      ],
    },
    {
      date: '2026-06-25', phaseId: 'orcas', title: 'Slow day',
      items: [
        { time: 'AM', text: 'Crow Valley Pottery, scenic drive west side' },
        { time: 'Lunch', text: 'Buck Bay Shellfish — oysters for adults' },
        { time: 'Dinner', text: 'BBQ at the Airbnb' },
      ],
    },
    {
      date: '2026-06-26', phaseId: 'seattle-2', title: 'Ferry back → Seattle',
      items: [
        { time: 'AM', text: 'Pack, ferry off Orcas' },
        { time: 'PM', text: 'Drive Anacortes → Phinney' },
        { time: 'Evening', text: 'Easy dinner at home or takeout' },
      ],
    },
    {
      date: '2026-06-27', phaseId: 'seattle-2', title: 'Seattle proper',
      items: [
        { time: 'AM', text: 'Pike Place Market + waterfront' },
        { time: 'PM', text: 'MoPOP or Seattle Center fountain' },
        { time: 'Dinner', text: 'Bongos or El Chupacabra in Phinney' },
      ],
    },
    {
      date: '2026-06-28', phaseId: 'seattle-2', title: 'Wind-down + first departures',
      items: [
        { time: 'AM', text: 'Brunch — Portage Bay Cafe or Tilth' },
        { time: 'PM', text: 'Some guests fly out' },
      ],
    },
    {
      date: '2026-06-29', phaseId: 'seattle-2', title: 'Last departures',
      items: [
        { time: 'AM', text: 'Final airport runs (anyone still here)' },
      ],
    },
  ],

  // ---------- Idea pools by location ----------
  ideas: {
    phinney: [
      { name: 'Woodland Park Zoo', tag: 'kids', notes: 'Walking distance from the house' },
      { name: 'Green Lake loop', tag: 'all', notes: '~3 mi flat, ice cream stops' },
      { name: 'Red Mill Burgers', tag: 'food', notes: 'Cash-only counter classic' },
      { name: '74th Street Ale House', tag: 'food', notes: 'Pub, kid-friendly early' },
      { name: 'Bongos', tag: 'food', notes: 'Cuban, mojitos, casual' },
      { name: 'El Chupacabra', tag: 'food', notes: 'Mexican, divey, fun' },
      { name: 'Frankie & Jo\'s', tag: 'food', notes: 'Vegan ice cream — kids love it' },
    ],
    seattle: [
      { name: 'Pike Place Market', tag: 'classic', notes: 'Mornings beat the crowd' },
      { name: 'Discovery Park', tag: 'outdoor', notes: 'Beach + lighthouse loop' },
      { name: 'Ballard Locks', tag: 'kids', notes: 'Salmon ladder if running' },
      { name: 'MoPOP', tag: 'indoor', notes: 'Music + sci-fi, good rainy backup' },
      { name: 'Seattle Center fountain', tag: 'kids', notes: 'Free, kids love running through' },
      { name: 'Bainbridge ferry day-trip', tag: 'outing', notes: 'Walk-on, lunch, walk back' },
    ],
    orcas: [
      { name: 'Mount Constitution', tag: 'view', notes: 'Drive-up. Best view in the islands.' },
      { name: 'Cascade Lake', tag: 'kids', notes: 'Swim, paddle boats, easy' },
      { name: 'Cascade Falls trail', tag: 'kids', notes: 'Short out-and-back, stroller-ish' },
      { name: 'Eastsound village', tag: 'town', notes: 'Brown Bear Bakery, shops' },
      { name: 'Doe Bay Cafe', tag: 'food', notes: 'Reserve. Worth the drive.' },
      { name: 'Buck Bay Shellfish', tag: 'food', notes: 'Oysters at picnic tables' },
      { name: 'Crow Valley Pottery', tag: 'shop', notes: 'Historic cabin' },
      { name: 'Kayak / whale watch', tag: 'water', notes: 'Outer Island, Deer Harbor. Age limits — check.' },
    ],
  },

  // ---------- Logistics ----------
  logistics: {
    ferry: {
      route: 'Anacortes ↔ Orcas Island',
      operator: 'WA State Ferries',
      bookingUrl: 'https://wsdot.com/ferries/reservations/',
      tips: [
        'Reserve vehicle space well in advance — summer fills up.',
        'Arrive at the terminal 60+ minutes ahead. 90 min on a Saturday.',
        'Both cars on board — book each separately.',
      ],
    },
    worldCup: {
      venue: 'Lumen Field',
      transitTip: 'Light Rail to Stadium station. Don\'t drive.',
      kickoff: 'TBD — confirm and update data.js',
    },
    parking: {
      notes: 'Phinney has plentiful street parking. Lumen — use transit.',
    },
  },

  // ---------- Packing ----------
  packing: {
    everyone: [
      'Layers — Seattle mornings are 55°F even in June',
      'Rain shell (just in case, especially Orcas)',
      'Sunglasses + sunscreen',
      'Reusable water bottle',
    ],
    kids: [
      'Swimsuit + towel (Cascade Lake)',
      'Closed-toe shoes for the zoo + hikes',
      'Stuffed animal / comfort thing',
      'Snacks for the ferry',
    ],
    adults: [
      'Hiking shoes',
      'Daypack for Mt Constitution + town',
      'World Cup gear (USA kit)',
    ],
    orcasOnly: [
      'Binoculars (whales, eagles)',
      'Reef-safe sunscreen',
      'Card games / dominoes for Airbnb nights',
      'Reusable grocery bags',
    ],
  },
}

export const TODAY_OVERRIDE = null // set to a string like '2026-06-18' to test
