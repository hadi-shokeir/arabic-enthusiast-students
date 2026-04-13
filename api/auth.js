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
async function saveSessions(s) { await kv(['SET', 'sessions', JSON.stringify(s)]); }

function hashPw(pw, salt) {
  if (!salt) salt = randomBytes(16).toString('hex');
  return { hash: createHash('sha256').update(pw + salt).digest('hex'), salt };
}
function checkPw(pw, hash, salt) {
  return createHash('sha256').update(pw + salt).digest('hex') === hash;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action } = req.body;

    // ── LOGIN ──────────────────────────────────────────────
    if (action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const users = await getUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      if (user.status === 'pending') return res.status(403).json({ error: 'pending' });
      if (user.status === 'rejected') return res.status(403).json({ error: 'rejected' });
      if (!checkPw(password, user.passwordHash, user.passwordSalt)) return res.status(401).json({ error: 'Invalid email or password' });

      const token = randomBytes(32).toString('hex');
      const sessions = await getSessions();
      // Prune old sessions if too many
      const keys = Object.keys(sessions);
      if (keys.length > 200) { keys.slice(0, 50).forEach(k => delete sessions[k]); }
      sessions[token] = { email: user.email, role: user.role, name: user.name, createdAt: new Date().toISOString() };
      await saveSessions(sessions);
      return res.json({ token, role: user.role, name: user.name, email: user.email });
    }

    // ── VALIDATE SESSION ───────────────────────────────────
    if (action === 'validate') {
      const { token } = req.body;
      if (!token) return res.json({ valid: false });
      const sessions = await getSessions();
      const s = sessions[token];
      if (!s) return res.json({ valid: false });
      return res.json({ valid: true, ...s });
    }

    // ── LOGOUT ─────────────────────────────────────────────
    if (action === 'logout') {
      const { token } = req.body;
      if (token) {
        const sessions = await getSessions();
        delete sessions[token];
        await saveSessions(sessions);
      }
      return res.json({ ok: true });
    }

    // ── REQUEST ACCESS (student signup) ────────────────────
    if (action === 'request') {
      const { name, email, password, message, gender } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
      const users = await getUsers();
      if (users.find(u => u.email === email.toLowerCase().trim())) {
        return res.status(409).json({ error: 'An account with this email already exists or is awaiting approval' });
      }
      const { hash, salt } = hashPw(password);
      users.push({
        id: randomBytes(8).toString('hex'),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        role: 'student',
        status: 'pending',
        gender: gender || '',
        message: (message || '').trim(),
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
      return res.json({ ok: true });
    }

    // ── FIRST SETUP (create tutor account) ────────────────
    if (action === 'setup') {
      const { name, email, password } = req.body;
      const users = await getUsers();
      if (users.find(u => u.role === 'tutor')) return res.status(409).json({ error: 'Tutor account already exists. Log in instead.' });
      if (users.find(u => u.email === email.toLowerCase().trim())) return res.status(409).json({ error: 'Email already in use' });
      const { hash, salt } = hashPw(password);
      users.push({
        id: randomBytes(8).toString('hex'),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        role: 'tutor',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
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
