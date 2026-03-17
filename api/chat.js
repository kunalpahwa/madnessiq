export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  try {
    const { message } = req.body;
    const systemPrompt = "You are MadnessIQ, an elite 2026 NCAA Tournament analyst. Champion: Duke. F4: Duke, Arizona, Houston, Michigan. Key upsets: USF over Louisville, UCF over UCLA, Akron Sweet 16 run, Houston over Florida E8. Be specific with KenPom data and player names. 2-3 paragraphs.";
    let data;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2025-03-05" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system: systemPrompt, messages: [{ role: "user", content: message }], tools: [{ type: "web_search_20250305", name: "web_search" }] }) });
      data = await r.json();
    } catch(e) { data = { error: { message: e.message } }; }
    if (data.error) {
      try {
        const r2 = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system: systemPrompt, messages: [{ role: "user", content: message }] }) });
        data = await r2.json();
      } catch(e2) { return res.status(500).json({ error: e2.message }); }
    }
    if (data.error) return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    res.status(200).json({ text: text || "No response. Try a different question." });
  } catch(error) { res.status(500).json({ error: error.message }); }
}