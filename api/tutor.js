import { createHash } from 'crypto';

const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

async function getSessions() {
  const raw = await kv(['GET', 'sessions']);
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI Tutor is not configured yet. Ask Hadi to set up the API key.' });
  }

  try {
    const { token, messages, studentProfile, systemPrompt } = req.body;

    // Validate session
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const sessions = await getSessions();
    const session = sessions[token];
    if (!session) return res.status(401).json({ error: 'Session expired. Please log in again.' });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    // Build system prompt with student context
    let sysPrompt = systemPrompt || 'You are a helpful Arabic language tutor.';
    if (studentProfile && studentProfile.name) {
      sysPrompt += `\n\nStudent context:\n- Name: ${studentProfile.name}`;
      if (studentProfile.level) sysPrompt += `\n- Level: ${studentProfile.level}`;
      if (studentProfile.type) sysPrompt += `\n- Learning type: ${studentProfile.type}`;
      if (studentProfile.learnType) sysPrompt += `\n- Learner type: ${studentProfile.learnType}`;
      if (studentProfile.goals) sysPrompt += `\n- Goals: ${studentProfile.goals}`;
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: sysPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err.error?.message || 'AI service error' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '';
    return res.json({ reply });

  } catch (err) {
    if (err.message === 'KV_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'kv_not_configured' });
    }
    return res.status(500).json({ error: err.message });
  }
}
