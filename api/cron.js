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

async function sendToEmail(email, payload) {
  const raw = await kv(['GET', `push_sub_${email}`]);
  if (!raw) return;
  try {
    await webpush.sendNotification(JSON.parse(raw), JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 410) await kv(['DEL', `push_sub_${email}`]);
  }
}

// Check if student's preferred study days/time overlaps with teacher availability
function findScheduleOverlap(student, availability) {
  const prefDays = student.studyPrefs?.days || [];
  const prefWindow = student.studyPrefs?.timeWindow || '';
  if (!prefDays.length || !prefWindow || !availability) return { matchedDays: [], teacherDays: [] };

  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const WIN_HOURS = { morning:[6,12], afternoon:[12,17], evening:[17,22] };
  const [wS, wE] = WIN_HOURS[prefWindow] || [0,24];

  const matchedDays = [], teacherDays = [];
  for (let d = 0; d <= 6; d++) {
    const da = availability[d];
    if (!da?.enabled || !da?.ranges?.length) continue;
    teacherDays.push(DAY_NAMES[d]);
    if (prefDays.includes(d)) {
      const overlap = da.ranges.some(r => {
        const rS = parseInt((r.from || '0:0').split(':')[0]);
        const rE = parseInt((r.to || '23:0').split(':')[0]);
        return rS < wE && rE > wS;
      });
      if (overlap) matchedDays.push(DAY_NAMES[d]);
    }
  }
  return { matchedDays, teacherDays };
}

export default async function handler(req, res) {
  // Guard: CRON_SECRET must match
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

    const raw = await kv(['GET', 'student_data']);
    if (!raw) return res.json({ ok: true, sent: 0 });

    let data;
    try { data = JSON.parse(raw); } catch {
      return res.status(500).json({ error: 'Corrupted student_data in KV' });
    }
    const students = data.students || [];
    const homework = data.homework || [];
    const availability = data.settings?.availability || {};
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon
    const isMonday = dayOfWeek === 1;
    let sent = 0;

    for (const s of students) {
      if (!s.email || !s.active) continue;

      const firstName = s.name.split(' ')[0];
      const pendingTasks = (s.weeklyTasks || []).filter(t => !t.doneAt);
      const pendingHw = homework.filter(hw => hw.studentId === s.id && hw.status === 'assigned');
      const overdueHw = pendingHw.filter(hw => hw.dueDate && hw.dueDate < today);

      // ── Daily: homework & task reminders ─────────────────────────────────
      const parts = [];
      if (overdueHw.length > 0) parts.push(`${overdueHw.length} overdue homework`);
      else if (pendingHw.length > 0) parts.push(`${pendingHw.length} homework due`);
      if (pendingTasks.length > 0) parts.push(`${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} to complete`);

      if (parts.length > 0) {
        await sendToEmail(s.email, {
          title: `Hey ${firstName}! 📚`,
          body: `Don't forget: ${parts.join(' & ')}. Open the app to check.`,
          tag: 'daily-reminder'
        });
        sent++;
      }

      // ── Weekly (Monday only): motivation + schedule nudge ─────────────────
      if (isMonday) {
        const { matchedDays, teacherDays } = findScheduleOverlap(s, availability);

        if (matchedDays.length > 0) {
          // Student's preferred days match Hadi's availability
          await sendToEmail(s.email, {
            title: `Good week ahead, ${firstName}! 🗓️`,
            body: `Your study days (${matchedDays.join(', ')}) are available with Hadi this week. Tap to book your Arabic lesson!`,
            tag: 'weekly-schedule-match',
            url: '/'
          });
          sent++;
        } else if (teacherDays.length > 0 && s.studyPrefs?.days?.length) {
          // Student has prefs set but no overlap
          await sendToEmail(s.email, {
            title: `Arabic this week? 📅`,
            body: `Hadi is available on ${teacherDays.join(', ')} this week. Can you make time for Arabic?`,
            tag: 'weekly-schedule-nudge',
            url: '/'
          });
          sent++;
        } else {
          // No prefs set yet — generic weekly motivation
          const MOTIVATIONS = [
            'A few minutes of Arabic today goes a long way. Open the app!',
            "Every great Arabic speaker started where you are. Keep going!",
            'New week, new Arabic skills. Your lesson with Hadi is waiting.',
            "Consistency beats intensity. Even 10 minutes of Arabic counts.",
          ];
          const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
          await sendToEmail(s.email, {
            title: `Arabic reminder 🌟`,
            body: msg,
            tag: 'weekly-motivation',
            url: '/'
          });
          sent++;
        }
      }
    }

    return res.json({ ok: true, sent });
  } catch (err) {
    if (err.message === 'KV_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'kv_not_configured' });
    }
    return res.status(500).json({ error: err.message });
  }
}
