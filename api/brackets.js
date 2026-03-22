// Shared bracket storage via Vercel KV (Upstash Redis)
// Env vars KV_REST_API_URL and KV_REST_API_TOKEN are auto-set when you connect a KV store

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvCommand(...args) {
  const res = await fetch(`${KV_URL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: 'KV not configured. Add a KV store in Vercel Dashboard → Storage.' });
  }

  // GET: Return all shared (locked) brackets
  if (req.method === 'GET') {
    try {
      const result = await kvCommand('GET', 'miq:brackets');
      const brackets = result.result ? JSON.parse(result.result) : [];
      return res.status(200).json({ brackets });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST: Save a locked bracket
  if (req.method === 'POST') {
    try {
      const bracket = req.body;
      if (!bracket || !bracket.name || !bracket.picks || !bracket.locked) {
        return res.status(400).json({ error: 'Must send a locked bracket with name and picks.' });
      }

      // Get existing brackets
      const result = await kvCommand('GET', 'miq:brackets');
      const brackets = result.result ? JSON.parse(result.result) : [];

      // Update if name exists, otherwise add
      const idx = brackets.findIndex(b => b.name === bracket.name);
      if (idx >= 0) {
        brackets[idx] = bracket;
      } else {
        brackets.push(bracket);
      }

      // Save back
      await kvCommand('SET', 'miq:brackets', JSON.stringify(brackets));
      return res.status(200).json({ success: true, count: brackets.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
