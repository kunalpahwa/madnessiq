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
        max_tokens: 2000,
        system: `You are a sports data API. Search for the latest 2026 NCAA men's tournament scores. Return ONLY a JSON array, no markdown, no backticks, no preamble. Format: [{"team1":"Duke","seed1":1,"score1":71,"team2":"Siena","seed2":16,"score2":65,"status":"FINAL","region":"EAST","round":"R64"},{"team1":"St. Johns","seed1":5,"score1":null,"team2":"Northern Iowa","seed2":12,"score2":null,"status":"UPCOMING","time":"7:10 PM ET","region":"EAST","round":"R64"}] Include ALL games: completed (FINAL), in progress (LIVE with current scores), and upcoming (UPCOMING with tip time). Search for today's games specifically.`,
        messages: [{ role: 'user', content: 'Search for all 2026 NCAA men\'s tournament scores today. Include completed games, games in progress, and upcoming games.' }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    let data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

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
