const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const FAST_MODEL = process.env.ANTHROPIC_FAST_MODEL || 'claude-haiku-4-5-20251001';

function sanitizeValue(value, depth = 0) {
  if (depth > 5) return '';
  if (typeof value === 'string') {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').slice(0, 6000);
  }
  if (Array.isArray(value)) return value.slice(0, 40).map(item => sanitizeValue(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 60).map(([key, val]) => [key, sanitizeValue(val, depth + 1)]));
  }
  return value;
}

async function validateToken(token) {
  if (!token || !KV || !KV_TOKEN) return false;
  try {
    const r = await fetch(KV, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', 'sessions'])
    });
    const d = await r.json();
    const sessions = d.result ? JSON.parse(d.result) : {};
    const s = sessions[token];
    if (!s) return false;
    if (s.createdAt && (Date.now() - new Date(s.createdAt).getTime()) > SESSION_MAX_AGE_MS) return false;
    return true;
  } catch { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { token, messages, studentProfile, systemPrompt } = req.body;
    messages = sanitizeValue(messages);
    studentProfile = sanitizeValue(studentProfile || {});
    systemPrompt = sanitizeValue(systemPrompt || '');

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages' });
    }

    const authed = await validateToken(token);
    if (!authed) return res.status(403).json({ error: 'Unauthorized' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });

    const prof = studentProfile || {};
    const profileNote = prof.name
      ? `\n\nStudent profile: ${prof.name}, ${prof.level || 'beginner'} level, studying ${prof.type || 'Arabic'}${prof.goals ? ', goals: ' + prof.goals : ''}.`
      : '';

    const system = (systemPrompt || '') + profileNote;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: FAST_MODEL,
        max_tokens: 1024,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content[0].text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
