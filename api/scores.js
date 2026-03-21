export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: `You are a sports data API for the 2026 NCAA men's basketball tournament. Search for the latest scores and results.

Here are the EXACT matchups with game IDs. For each game that has been completed or is in progress, return the result. Return ONLY a JSON array with no markdown or backticks.

EAST R64: E0: Duke vs Siena | E1: Ohio State vs TCU | E2: St Johns vs Northern Iowa | E3: Kansas vs Cal Baptist | E4: Louisville vs South Florida | E5: Michigan State vs North Dakota State | E6: UCLA vs UCF | E7: UConn vs Furman
WEST R64: W0: Arizona vs Long Island | W1: Villanova vs Utah State | W2: Wisconsin vs High Point | W3: Arkansas vs Hawaii | W4: BYU vs Texas/NC State | W5: Gonzaga vs Kennesaw State | W6: Miami FL vs Missouri | W7: Purdue vs Queens
SOUTH R64: S0: Florida vs Lehigh/Prairie View | S1: Clemson vs Iowa | S2: Vanderbilt vs McNeese | S3: Nebraska vs Troy | S4: North Carolina vs VCU | S5: Illinois vs Penn | S6: Saint Marys vs Texas A&M | S7: Houston vs Idaho
MIDWEST R64: M0: Michigan vs Howard/UMBC | M1: Georgia vs Saint Louis | M2: Texas Tech vs Akron | M3: Alabama vs Hofstra | M4: Tennessee vs SMU/Miami OH | M5: Virginia vs Wright State | M6: Kentucky vs Santa Clara | M7: Iowa State vs Tennessee State

R32 games: ER0: winner E0 vs winner E1 | ER1: winner E2 vs winner E3 | ER2: winner E4 vs winner E5 | ER3: winner E6 vs winner E7
WR0: winner W0 vs winner W1 | WR1: winner W2 vs winner W3 | WR2: winner W4 vs winner W5 | WR3: winner W6 vs winner W7
SR0: winner S0 vs winner S1 | SR1: winner S2 vs winner S3 | SR2: winner S4 vs winner S5 | SR3: winner S6 vs winner S7
MR0: winner M0 vs winner M1 | MR1: winner M2 vs winner M3 | MR2: winner M4 vs winner M5 | MR3: winner M6 vs winner M7

Return format: [{"id":"E0","team1":"Duke","score1":71,"team2":"Siena","score2":65,"status":"FINAL","winner":"Duke"},{"id":"E2","status":"UPCOMING","time":"7:10 PM ET"}]
Only include games that have results, are live, or are scheduled for today. Do NOT make up scores.`,
        messages: [{ role: 'user', content: 'Search for all 2026 NCAA tournament scores. What games have been played and what are today\'s scheduled games?' }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });
    let data = await response.json();
    if (data.error) {
      // Fallback without search
      const r2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 2000,
          system: 'Return an empty JSON array: []',
          messages: [{ role: 'user', content: 'Return []' }],
        }),
      });
      data = await r2.json();
    }
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const scores = JSON.parse(clean);
      res.status(200).json({ scores, updated: new Date().toISOString() });
    } catch {
      res.status(200).json({ raw: text, updated: new Date().toISOString() });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
