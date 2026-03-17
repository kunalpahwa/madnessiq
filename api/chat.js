// /api/chat.js
// This is a Vercel serverless function. It runs on Vercel's servers, NOT in the browser.
// This is critical because it keeps your Anthropic API key secret.
//
// HOW IT WORKS:
// 1. The browser sends a request to /api/chat with the user's question
// 2. This function adds the secret API key and forwards it to Claude's API
// 3. Claude's response streams back through this function to the browser
// 4. The API key never touches the browser — it stays on the server
//
// COST: Each call costs ~$0.01-0.03 (Claude Sonnet). Total for the tournament: ~$10-25.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Add it in Vercel dashboard → Settings → Environment Variables.' });
  }

  try {
    const { message, mode } = req.body;

    // Different system prompts for different modes
    const systemPrompts = {
      chat: `You are MadnessIQ, an elite 2026 NCAA Tournament analyst powered by Claude with live web search.

KEY BRACKET PICKS:
- Champion: Duke (Cameron Boozer — best big man in college basketball)
- Final Four: Duke (East), Arizona (West), Houston (South), Michigan (Midwest)
- Top upsets: S. Florida over Louisville, UCF over UCLA, Akron over Texas Tech → Akron over Alabama (Sweet 16 Cinderella), Texas A&M over St. Mary's, St. John's over Kansas (R32), Michigan State over UConn (S16), Houston over Florida (E8 at Toyota Center)

KEY INJURIES (as of Selection Sunday):
- Duke: Foster OUT (broken foot), Ngongba DTD (foot soreness)
- UNC: Wilson OUT (thumb) — UNC 0-2 without him
- Louisville: Brown DTD (back) — 18.2 PPG, hasn't played since Feb 28
- UCLA: Bilodeau GTD (knee), Dent GTD (calf)
- Texas Tech: Toppin OUT (knee) — best player, season over
- BYU: Saunders OUT (shoulder surgery)
- Gonzaga: Huff OUT (knee) — could return Sweet 16
- Alabama: Holloway arrested Monday AM — status unclear
- Michigan: Cason OUT (torn ACL)
- Clemson: Welling OUT (torn ACL)
- Villanova: Hodge OUT (torn ACL)

STYLE: Be specific with numbers, player names, and KenPom data. Be opinionated — you're an analyst, not a hedge fund disclaimer. Use web search for the LATEST injury updates, scores, and news. Keep responses 2-3 paragraphs, punchy and valuable. When discussing games that have been played, search for actual results.`,
      
      scores: `You are a sports data assistant. Search for the latest 2026 NCAA Tournament scores and results. Return ONLY a JSON array (no markdown, no backticks, no preamble) of game objects: [{"team1":"Duke","score1":72,"team2":"Siena","score2":45,"status":"FINAL","region":"EAST"},...]
If no games have been played yet, return: [{"status":"NOT_STARTED","message":"First Four begins March 17 in Dayton. Round of 64 starts March 19."}]
Only include games actually played or in progress. Do NOT fabricate scores.`,
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompts[mode] || systemPrompts.chat,
        messages: [{ role: 'user', content: message }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    const data = await response.json();

    // Extract text from response
    const text = data.content
      ?.filter(block => block.type === 'text')
      ?.map(block => block.text)
      ?.join('\n') || 'No response generated. Try again.';

    res.status(200).json({ text });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: error.message });
  }
}
