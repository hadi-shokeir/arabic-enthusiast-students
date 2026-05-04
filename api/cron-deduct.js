// Runs every 30 minutes via Vercel cron.
// Finds all booked slots whose class has ended → deducts 1 credit → marks completed.
// This is a safety net; the same logic also runs lazily on every getSlots call.

const KV       = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
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

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

const FREE_EXPIRY_WEEKS = 6;
function freeLessonExpiry(s, now = new Date()) {
  if (!s?.startDate || !(s.freeTotal || 0)) return { expired: false };
  const [sy, sm, sd] = String(s.startDate).split('-').map(Number);
  if (!sy || !sm || !sd) return { expired: false };
  const expiry = new Date(sy, sm - 1, sd + FREE_EXPIRY_WEEKS * 7, 23, 59, 59);
  return { expired: now > expiry };
}
function freeLessonsLeft(s, now = new Date()) {
  if (freeLessonExpiry(s, now).expired) return 0;
  return Math.max(0, (s?.freeTotal || 0) - (s?.freeTaken || 0));
}
function paidCreditsLeft(s) {
  if (typeof s?.remainingClasses === 'number') return Math.max(0, s.remainingClasses || 0);
  return Math.max(0, (s?.lessonsTotal || 0) - (s?.lessonsTaken || 0));
}
function deductLessonCredit(s, now = new Date()) {
  const paidBefore = paidCreditsLeft(s);
  const freeBefore = freeLessonsLeft(s, now);
  const before = paidBefore + freeBefore;
  if (paidBefore > 0) {
    const paidAfter = Math.max(0, paidBefore - 1);
    return {
      student: { ...s, remainingClasses: paidAfter, lessonsTaken: (s.lessonsTaken || 0) + 1 },
      before,
      after: paidAfter + freeBefore,
      creditType: 'paid'
    };
  }
  if (freeBefore > 0) {
    return {
      student: { ...s, freeTaken: Math.min(s.freeTotal || 0, (s.freeTaken || 0) + 1) },
      before,
      after: Math.max(0, before - 1),
      creditType: 'free'
    };
  }
  return {
    student: { ...s, remainingClasses: typeof s.remainingClasses === 'number' ? 0 : s.remainingClasses, lessonsOverdue: Math.max(0, (s.lessonsOverdue || 0) + 1) },
    before,
    after: 0,
    creditType: 'overdue'
  };
}

export default async function handler(req, res) {
  // Guard: must come from Vercel cron (Authorization header)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!KV || !KV_TOKEN) return res.status(503).json({ error: 'kv_not_configured' });

  try {
    const [slotsRaw, dataRaw, dedsRaw] = await Promise.all([
      kv(['GET', 'sched_slots']),
      kv(['GET', 'student_data']),
      kv(['GET', 'sched_deductions'])
    ]);

    let slots       = slotsRaw  ? JSON.parse(slotsRaw)  : [];
    let studentData = dataRaw   ? JSON.parse(dataRaw)   : null;
    let deductions  = dedsRaw   ? JSON.parse(dedsRaw)   : [];

    const now     = new Date();
    let changed   = false;
    let processed = 0;

    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (s.status !== 'booked' || s.autoDeducted) continue;

      const slotEnd = new Date(`${s.date}T${s.time}:00`);
      slotEnd.setMinutes(slotEnd.getMinutes() + (s.duration || 60));
      if (slotEnd > now) continue;

      // Find and update student
      const stu = (studentData?.students || []).find(st => st.id === s.studentId);
      if (stu && studentData) {
        const credit = deductLessonCredit(stu, now);
        studentData = {
          ...studentData,
          students: studentData.students.map(st =>
            st.id === stu.id ? credit.student : st
          )
        };
        deductions = [...deductions, {
          id: uid(), studentId: stu.id, studentName: stu.name, slotId: s.id,
          date: s.date, time: s.time, duration: s.duration,
          deductedAt: now.toISOString(), classesBefore: credit.before, classesAfter: credit.after, type: 'auto', creditType: credit.creditType
        }];
      }

      slots = [...slots];
      slots[i] = { ...s, status: 'completed', autoDeducted: true, completedAt: now.toISOString() };
      changed = true;
      processed++;
    }

    if (changed) {
      await Promise.all([
        kv(['SET', 'sched_slots', JSON.stringify(slots)]),
        kv(['SET', 'student_data', JSON.stringify(studentData)]),
        kv(['SET', 'student_data_saved_at', now.toISOString()]),
        kv(['SET', 'sched_deductions', JSON.stringify(deductions)])
      ]);
    }

    return res.json({ ok: true, processed });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
