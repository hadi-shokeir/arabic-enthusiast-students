import { put, del } from '@vercel/blob';

const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(cmd) {
  if (!KV || !KV_TOKEN) throw new Error('KV_NOT_CONFIGURED');
  const r = await fetch(KV, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not configured' });
  }

  try {
    const { token, action } = req.body;
    const sessions = await getSessions();
    const session = sessions[token];
    if (!session) return res.status(403).json({ error: 'Unauthorized' });
    if (session.role !== 'tutor') return res.status(403).json({ error: 'Tutor access required' });

    if (action === 'upload') {
      const { audioBase64, mimeType, fileName } = req.body;
      if (!audioBase64 || !fileName) return res.status(400).json({ error: 'audioBase64 and fileName required' });

      const cleanMime = mimeType || 'audio/mpeg';
      const buf = Buffer.from(audioBase64, 'base64');
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const blobName = `verbs/${Date.now()}_${safeFileName}`;

      const blob = await put(blobName, buf, {
        access: 'public',
        contentType: cleanMime,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.json({ ok: true, url: blob.url });
    }

    if (action === 'delete') {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'url required' });
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
