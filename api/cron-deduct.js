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
        const before = typeof stu.remainingClasses === 'number' ? stu.remainingClasses : Math.max(0, (stu.lessonsTotal || 0) - (stu.lessonsTaken || 0));
        const after  = Math.max(0, before - 1);
        studentData = {
          ...studentData,
          students: studentData.students.map(st =>
            st.id === stu.id ? { ...st, remainingClasses: after, lessonsTaken: (st.lessonsTaken || 0) + 1 } : st
          )
        };
        deductions = [...deductions, {
          id: uid(), studentId: stu.id, studentName: stu.name, slotId: s.id,
          date: s.date, time: s.time, duration: s.duration,
          deductedAt: now.toISOString(), classesBefore: before, classesAfter: after, type: 'auto'
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
