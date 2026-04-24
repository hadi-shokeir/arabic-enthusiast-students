import { createHash, randomBytes } from 'crypto';

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

async function getUsers() {
  const raw = await kv(['GET', 'users']);
  return raw ? JSON.parse(raw) : [];
}
async function saveUsers(u) { await kv(['SET', 'users', JSON.stringify(u)]); }

async function getSessions() {
  const raw = await kv(['GET', 'sessions']);
  return raw ? JSON.parse(raw) : {};
}

function hashPw(pw, salt) {
  if (!salt) salt = randomBytes(16).toString('hex');
  return { hash: createHash('sha256').update(pw + salt).digest('hex'), salt };
}

function strip(u) {
  const { passwordHash, passwordSalt, ...safe } = u;
  return safe;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token, action } = req.body;

    // Validate tutor token
    const sessions = await getSessions();
    const session = sessions[token];
    if (!session || session.role !== 'tutor') return res.status(403).json({ error: 'Unauthorized' });

    const users = await getUsers();

    if (action === 'list') {
      return res.json({ users: users.map(strip) });
    }

    if (action === 'approve') {
      const { email } = req.body;
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      users[idx].status = 'approved';
      users[idx].approvedAt = new Date().toISOString();
      await saveUsers(users);
      return res.json({ ok: true });
    }

    if (action === 'reject') {
      const { email } = req.body;
      await saveUsers(users.filter(u => u.email !== email));
      return res.json({ ok: true });
    }

    if (action === 'create') {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
      if (users.find(u => u.email === email.toLowerCase().trim())) return res.status(409).json({ error: 'Email already in use' });
      const { hash, salt } = hashPw(password);
      users.push({
        id: randomBytes(8).toString('hex'),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        role: role || 'student',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
      return res.json({ ok: true });
    }

    if (action === 'setPassword') {
      const { email, password } = req.body;
      if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      const idx = users.findIndex(u => u.email === email.toLowerCase().trim());
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      const { hash, salt } = hashPw(password);
      users[idx].passwordHash = hash;
      users[idx].passwordSalt = salt;
      await saveUsers(users);
      return res.json({ ok: true });
    }

    if (action === 'delete') {
      const { email } = req.body;
      await saveUsers(users.filter(u => u.email !== email));
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    if (err.message === 'KV_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'kv_not_configured' });
    }
    return res.status(500).json({ error: err.message });
  }
}
