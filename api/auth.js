import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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

// Hash with scrypt (Node.js built-in — no npm package needed)
function hashPw(pw) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(pw, salt, 64).toString('hex');
  return { hash: salt + ':' + hash, salt: null, hashType: 'scrypt' };
}

// Verify password — handles SHA-256 (legacy), scrypt (current)
function checkPw(pw, user) {
  if (user.hashType === 'scrypt') {
    const [salt, storedHash] = user.passwordHash.split(':');
    const hash = scryptSync(pw, salt, 64).toString('hex');
    // timing-safe comparison to prevent timing attacks
    try {
      return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
    } catch {
      return false;
    }
  }
  // bcrypt hashes (hashType === 'bcrypt'): bcryptjs was removed — treat as invalid,
  // user will need to reset. This only affects accounts created during the broken period.
  if (user.hashType === 'bcrypt') return false;
  // Legacy SHA-256 check
  const legacyHash = createHash('sha256').update(pw + user.passwordSalt).digest('hex');
  return legacyHash === user.passwordHash;
}

// Prune expired sessions (older than 30 days) — fall back to oldest-50 if none are expired
function pruneSessions(sessions) {
  const now = Date.now();
  const keys = Object.keys(sessions);
  const expired = keys.filter(k => {
    const s = sessions[k];
    if (!s.createdAt) return false;
    return (now - new Date(s.createdAt).getTime()) > SESSION_MAX_AGE_MS;
  });
  expired.forEach(k => delete sessions[k]);
  const remaining = Object.keys(sessions);
  if (remaining.length > 200) {
    remaining
      .sort((a, b) => new Date(sessions[a].createdAt || 0) - new Date(sessions[b].createdAt || 0))
      .slice(0, 50)
      .forEach(k => delete sessions[k]);
  }
  return sessions;
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

      const valid = checkPw(password, user);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      // Upgrade legacy hashes to scrypt on successful login
      if (user.hashType !== 'scrypt') {
        const { hash } = hashPw(password);
        user.passwordHash = hash;
        user.passwordSalt = null;
        user.hashType = 'scrypt';
        await saveUsers(users);
      }

      const token = randomBytes(32).toString('hex');
      let sessions = await getSessions();
      sessions = pruneSessions(sessions);
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
      if (s.createdAt && (Date.now() - new Date(s.createdAt).getTime()) > SESSION_MAX_AGE_MS) {
        return res.json({ valid: false });
      }
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
      const { name, email, password, message, gender, phone } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
      const users = await getUsers();
      if (users.find(u => u.email === email.toLowerCase().trim())) {
        return res.status(409).json({ error: 'An account with this email already exists or is awaiting approval' });
      }
      const { hash } = hashPw(password);
      users.push({
        id: randomBytes(8).toString('hex'),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: (phone || '').trim(),
        passwordHash: hash,
        passwordSalt: null,
        hashType: 'scrypt',
        role: 'student',
        status: 'pending',
        gender: gender || '',
        message: (message || '').trim(),
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
      return res.json({ ok: true });
    }

    // ── VERIFY WHATSAPP CODE ───────────────────────────────
    // ── FIRST SETUP (create tutor account) ────────────────
    if (action === 'setup') {
      const { name, email, password } = req.body;
      const users = await getUsers();
      if (users.find(u => u.role === 'tutor')) return res.status(409).json({ error: 'Tutor account already exists. Log in instead.' });
      if (users.find(u => u.email === email.toLowerCase().trim())) return res.status(409).json({ error: 'Email already in use' });
      const { hash } = hashPw(password);
      users.push({
        id: randomBytes(8).toString('hex'),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: null,
        hashType: 'scrypt',
        role: 'tutor',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
      return res.json({ ok: true });
    }

    // ── RESET PASSWORD (for accounts stuck with old bcrypt hash) ──
    if (action === 'resetPassword') {
      const { email, password, adminToken } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      // Only allow if caller is an authenticated tutor
      const sessions = await getSessions();
      const session = sessions[adminToken];
      if (!session || session.role !== 'tutor') return res.status(403).json({ error: 'Unauthorized' });
      const users = await getUsers();
      const idx = users.findIndex(u => u.email === email.toLowerCase().trim());
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      const { hash } = hashPw(password);
      users[idx].passwordHash = hash;
      users[idx].passwordSalt = null;
      users[idx].hashType = 'scrypt';
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
