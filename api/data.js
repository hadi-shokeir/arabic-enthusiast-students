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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token, action, data } = req.body;

    const sessions = await getSessions();
    const session = sessions[token];
    if (!session) return res.status(403).json({ error: 'Unauthorized' });

    // Students can read the cloud data (needed for student portal on their own devices)
    if (action === 'studentRead') {
      const raw = await kv(['GET', 'student_data']);
      if (!raw) return res.json({ data: null });
      return res.json({ data: JSON.parse(raw) });
    }

    // Students can write their own changes back to cloud.
    // We do a server-side merge so Student A never overwrites Student B's data.
    if (action === 'studentWrite') {
      const { data } = req.body;
      if (!data) return res.status(400).json({ error: 'No data' });

      // Read current server state and merge
      const currentRaw = await kv(['GET', 'student_data']);
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      const studentEmail = session.email;

      // Merge strategy: only update this student's own record + their homework/lessons
      const merged = {
        ...current,
        students: (current.students || []).map(s => {
          if (s.email && s.email.toLowerCase() === studentEmail.toLowerCase()) {
            // Find the student's updated record in what they sent
            const mine = (data.students || []).find(x => x.email && x.email.toLowerCase() === studentEmail.toLowerCase());
            return mine ? mine : s;
          }
          return s; // other students: keep server version
        }),
        homework: (() => {
          const myStudent = (current.students || []).find(s => s.email && s.email.toLowerCase() === studentEmail.toLowerCase());
          const myId = myStudent?.id;
          // Update existing homework items for this student
          const merged = (current.homework || []).map(hw => {
            if (myId && hw.studentId === myId) {
              const updated = (data.homework || []).find(x => x.id === hw.id);
              return updated ? updated : hw;
            }
            return hw;
          });
          // Append any NEW homework items this student submitted (not yet on server)
          const existingIds = new Set((current.homework || []).map(h => h.id));
          const newItems = (data.homework || []).filter(hw => myId && hw.studentId === myId && !existingIds.has(hw.id));
          return [...merged, ...newItems];
        })(),
        lessons: (current.lessons || []).map(l => {
          // Only allow status updates to this student's own lessons (e.g. cancellation)
          const myStudent = (current.students || []).find(s => s.email && s.email.toLowerCase() === studentEmail.toLowerCase());
          if (myStudent && l.studentId === myStudent.id) {
            const updated = (data.lessons || []).find(x => x.id === l.id);
            return updated ? updated : l;
          }
          return l;
        }),
      };

      await kv(['SET', 'student_data', JSON.stringify(merged)]);
      await kv(['SET', 'student_data_saved_at', new Date().toISOString()]);
      return res.json({ ok: true });
    }

    if (session.role !== 'tutor') return res.status(403).json({ error: 'Unauthorized' });

    if (action === 'backup') {
      // Strip large blobs (images, files) to stay within KV payload limits
      const stripped = { ...data };
      if (stripped.curriculum) {
        stripped.curriculum = stripped.curriculum.map(c => ({ ...c, fileData: '' }));
      }
      // Strip background images from settings — these are stored locally only
      if (stripped.settings) {
        stripped.settings = { ...stripped.settings };
        const imgKeys = ['themeBackgroundImage','themeSidebarImage','themeSidebarHeaderImage','themeCardImage','tutorAvatar'];
        imgKeys.forEach(k => { if (stripped.settings[k]) stripped.settings[k] = ''; });
      }
      await kv(['SET', 'student_data', JSON.stringify(stripped)]);
      await kv(['SET', 'student_data_saved_at', new Date().toISOString()]);
      return res.json({ ok: true, savedAt: new Date().toISOString() });
    }

    if (action === 'restore') {
      const raw = await kv(['GET', 'student_data']);
      const savedAt = await kv(['GET', 'student_data_saved_at']);
      if (!raw) return res.json({ data: null });
      return res.json({ data: JSON.parse(raw), savedAt });
    }

    if (action === 'lastSaved') {
      const savedAt = await kv(['GET', 'student_data_saved_at']);
      return res.json({ savedAt });
    }

    // Store background images separately (they're too large for the main data blob)
    if (action === 'backupImages') {
      const { images } = req.body;
      const json = JSON.stringify(images || {});
      if (json.length > 950000) {
        return res.json({ ok: false, error: 'Images too large for cloud. Try using smaller images.' });
      }
      await kv(['SET', 'img_data', json]);
      return res.json({ ok: true });
    }

    if (action === 'restoreImages') {
      const raw = await kv(['GET', 'img_data']);
      if (!raw) return res.json({ images: {} });
      return res.json({ images: JSON.parse(raw) });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
