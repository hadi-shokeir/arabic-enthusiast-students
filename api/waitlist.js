const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(cmd) {
  if (!KV || !KV_TOKEN) throw new Error('KV_NOT_CONFIGURED');
  const r = await fetch(KV, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const d = await r.json();
  return d.result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const { name, email, phone, interest } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const entry = {
        name: name || '',
        email: email.toLowerCase().trim(),
        phone: phone || '',
        interest: interest || 'Arabic Group',
        submittedAt: new Date().toISOString(),
      };

      const raw = await kv(['GET', 'group_waitlist']);
      const list = raw ? JSON.parse(raw) : [];
      // Avoid duplicates by email
      const filtered = list.filter(e => e.email !== entry.email);
      filtered.push(entry);
      await kv(['SET', 'group_waitlist', JSON.stringify(filtered)]);

      return res.json({ ok: true });
    } catch (err) {
      if (err.message === 'KV_NOT_CONFIGURED') return res.status(503).json({ error: 'kv_not_configured' });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
