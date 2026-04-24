import webpush from 'web-push';

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

async function getSessions() {
  const raw = await kv(['GET', 'sessions']);
  return raw ? JSON.parse(raw) : {};
}

async function sendToEmail(email, payload) {
  const raw = await kv(['GET', `push_sub_${email}`]);
  if (!raw) return { sent: false, reason: 'no_subscription' };
  const subscription = JSON.parse(raw);
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { sent: true };
  } catch (err) {
    // Remove stale subscription
    if (err.statusCode === 410) await kv(['DEL', `push_sub_${email}`]);
    return { sent: false, reason: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Guard: VAPID keys must be present
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(503).json({ error: 'push_not_configured' });
  }

  // Guard: KV must be present
  if (!KV || !KV_TOKEN) {
    return res.status(503).json({ error: 'kv_not_configured' });
  }

  try {
    webpush.setVapidDetails(
      'mailto:hadishokeir@gmail.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const { token, email, to, title, body, tag } = req.body;

    const sessions = await getSessions();
    const session = sessions[token];
    if (!session) return res.status(403).json({ error: 'Unauthorized' });

    // Student → Tutor: any authenticated user can notify the tutor
    if (to === 'tutor') {
      const tutorSession = Object.values(sessions).find(s => s.role === 'tutor');
      if (!tutorSession) return res.json({ sent: false, reason: 'no_tutor_session' });
      const result = await sendToEmail(tutorSession.email, { title, body, tag: tag || 'arabic-notif' });
      return res.json(result);
    }

    // Tutor → Student: only tutor can send to a specific student email
    if (session.role !== 'tutor') return res.status(403).json({ error: 'Unauthorized' });
    const result = await sendToEmail(email, { title, body, tag: tag || 'arabic-notif' });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
