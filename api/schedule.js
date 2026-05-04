import { createSign } from 'crypto';

const KV       = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const GCAL_SA  = process.env.GOOGLE_SERVICE_ACCOUNT_JSON; // full JSON string
const GCAL_ID  = process.env.GOOGLE_CALENDAR_ID;          // e.g. "hadishokeir@gmail.com"

// ── KV helpers ──────────────────────────────────────────────────────────────
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

async function getSlots()           { const r = await kv(['GET','sched_slots']);       return r ? JSON.parse(r) : []; }
async function saveSlots(v)         { await kv(['SET','sched_slots', JSON.stringify(v)]); }
async function getDeductions()      { const r = await kv(['GET','sched_deductions']);  return r ? JSON.parse(r) : []; }
async function saveDeductions(v)    { await kv(['SET','sched_deductions', JSON.stringify(v)]); }
async function getStudentData()     { const r = await kv(['GET','student_data']);      return r ? JSON.parse(r) : null; }
async function saveStudentData(v)   { await kv(['SET','student_data', JSON.stringify(v)]); await kv(['SET','student_data_saved_at', new Date().toISOString()]); }
async function getSessions()        { const r = await kv(['GET','sessions']);          return r ? JSON.parse(r) : {}; }

async function upsertBookingNotice(studentData, slot, student, status = 'booked') {
  if (!studentData || !slot || !student) return;
  const noticeId = `booking_${slot.id}`;
  const now = new Date().toISOString();
  const requests = Array.isArray(studentData.lessonRequests) ? studentData.lessonRequests : [];
  const notice = {
    id: noticeId,
    slotId: slot.id,
    source: 'scheduler',
    studentId: student.id,
    preferredDate: slot.date,
    preferredTime: slot.time,
    duration: slot.duration || 60,
    message: status === 'cancelled' ? 'Student cancelled this booking.' : 'Booked directly by student.',
    status,
    requestedAt: slot.bookedAt || now,
    bookedAt: slot.bookedAt || now,
    updatedAt: now
  };
  studentData.lessonRequests = requests.some(r => r.id === noticeId || r.slotId === slot.id)
    ? requests.map(r => (r.id === noticeId || r.slotId === slot.id) ? { ...r, ...notice, id: r.id || noticeId } : r)
    : [...requests, notice];
  await saveStudentData(studentData);
}

// ── Google Calendar JWT auth ─────────────────────────────────────────────────
async function getGoogleToken() {
  if (!GCAL_SA) return null;
  try {
    const sa  = JSON.parse(GCAL_SA);
    const now = Math.floor(Date.now() / 1000);
    const b64u = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const hdr  = b64u({ alg: 'RS256', typ: 'JWT' });
    const clm  = b64u({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/calendar', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now });
    const unsigned = `${hdr}.${clm}`;
    const sign = createSign('RSA-SHA256');
    sign.update(unsigned);
    const jwt = `${unsigned}.${sign.sign(sa.private_key, 'base64url')}`;
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
      signal: AbortSignal.timeout(10000)
    });
    const d = await r.json();
    return d.access_token || null;
  } catch { return null; }
}

async function createGCalEvent(gtoken, slot, studentName) {
  if (!gtoken || !GCAL_ID) return null;
  try {
    const start = new Date(`${slot.date}T${slot.time}:00`);
    const end   = new Date(start.getTime() + (slot.duration || 60) * 60000);
    const r = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events`,
      { method: 'POST', headers: { Authorization: `Bearer ${gtoken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: `Arabic Lesson — ${studentName}`, description: 'Booked via Arabic Enthusiast',
          start: { dateTime: start.toISOString(), timeZone: 'Asia/Beirut' },
          end:   { dateTime: end.toISOString(),   timeZone: 'Asia/Beirut' } }),
        signal: AbortSignal.timeout(10000) }
    );
    const d = await r.json(); return d.id || null;
  } catch { return null; }
}

async function deleteGCalEvent(gtoken, eventId) {
  if (!gtoken || !GCAL_ID || !eventId) return;
  try {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events/${eventId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${gtoken}` }, signal: AbortSignal.timeout(10000) }
    );
  } catch {}
}

// ── Utilities ────────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function timeToMin(t) { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + (m || 0); }

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
function totalLessonCredits(s, now = new Date()) {
  return paidCreditsLeft(s) + freeLessonsLeft(s, now);
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

function hasConflict(slots, date, time, duration, excludeId = null) {
  const ns = timeToMin(time), ne = ns + (duration || 60);
  return slots.some(s => {
    if (s.date !== date || s.id === excludeId || s.status === 'cancelled') return false;
    const ss = timeToMin(s.time), se = ss + (s.duration || 60);
    return ns < se && ne > ss;
  });
}

// ── Lazy deduction — runs on every getSlots call ─────────────────────────────
// Finds booked slots whose class has ended → deducts 1 credit → marks completed
async function runDeductions(slots, studentData, deductions) {
  const now = new Date();
  let changed = false;

  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (s.status !== 'booked' || s.autoDeducted) continue;

    // Has the slot ended?
    const slotEnd = new Date(`${s.date}T${s.time}:00`);
    slotEnd.setMinutes(slotEnd.getMinutes() + (s.duration || 60));
    if (slotEnd > now) continue;

    // Find student
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

    slots = [...slots]; // copy before mutating
    slots[i] = { ...s, status: 'completed', autoDeducted: true, completedAt: now.toISOString() };
    changed = true;
  }

  return { slots, studentData, deductions, changed };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!KV || !KV_TOKEN) return res.status(503).json({ error: 'kv_not_configured' });

  try {
    const { token, action } = req.body;
    const sessions = await getSessions();
    const session  = sessions[token];
    if (!session) return res.status(403).json({ error: 'Unauthorized' });
    const isTutor  = session.role === 'tutor';

    // ─────────────────────────────────────────────────────────────────────────
    // GET SLOTS — any authenticated user
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'getSlots') {
      let [slots, studentData, deductions] = await Promise.all([getSlots(), getStudentData(), getDeductions()]);
      const result = await runDeductions(slots, studentData, deductions);
      if (result.changed) {
        await Promise.all([saveSlots(result.slots), saveStudentData(result.studentData), saveDeductions(result.deductions)]);
        slots = result.slots;
      }
      // Students see only open slots + their own bookings
      if (!isTutor) {
        const stu = (result.studentData?.students || []).find(s => s.email && s.email.toLowerCase() === session.email.toLowerCase());
        const stuId = stu?.id;
        slots = slots.filter(s => s.status === 'open' || s.studentId === stuId);
      }
      return res.json({ slots });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADD SLOT — tutor only
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'addSlot') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const { date, time, duration = 60, studentId: preBookStudentId } = req.body;
      if (!date || !time) return res.status(400).json({ error: 'date and time required' });
      let slots = await getSlots();
      if (hasConflict(slots, date, time, duration)) {
        return res.status(409).json({ error: 'conflict', message: `A slot already exists at ${time} on ${date}` });
      }
      // Optionally pre-book for a specific student
      let bookedStudentId = null, bookedStudentName = null, bookedStatus = 'open';
      if (preBookStudentId) {
        const studentData = await getStudentData();
        const stu = (studentData?.students || []).find(s => s.id === preBookStudentId);
        if (stu) { bookedStudentId = stu.id; bookedStudentName = stu.name; bookedStatus = 'booked'; }
      }
      const slot = { id: uid(), date, time, duration, status: bookedStatus, studentId: bookedStudentId, studentName: bookedStudentName, bookedAt: bookedStudentId ? new Date().toISOString() : null, gcEventId: null, createdAt: new Date().toISOString() };
      await saveSlots([...slots, slot]);
      return res.json({ ok: true, slot });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BULK ADD SLOTS — tutor only (used for "copy day")
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'bulkAddSlots') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const { slots: incoming } = req.body;
      if (!Array.isArray(incoming)) return res.status(400).json({ error: 'slots array required' });
      let slots = await getSlots();
      let added = 0, skipped = 0;
      for (const s of incoming) {
        if (!s.date || !s.time) { skipped++; continue; }
        if (hasConflict(slots, s.date, s.time, s.duration || 60)) { skipped++; continue; }
        slots.push({ id: uid(), date: s.date, time: s.time, duration: s.duration || 60, status: 'open', studentId: null, studentName: null, bookedAt: null, gcEventId: null, createdAt: new Date().toISOString() });
        added++;
      }
      await saveSlots(slots);
      return res.json({ ok: true, added, skipped });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE SLOT — tutor only, open slots only
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'deleteSlot') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const { slotId } = req.body;
      let slots = await getSlots();
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return res.status(404).json({ error: 'Not found' });
      if (slot.status === 'booked') return res.status(409).json({ error: 'Slot is booked — cancel it first.' });
      await saveSlots(slots.filter(s => s.id !== slotId));
      return res.json({ ok: true });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL SLOT — tutor cancels a booked or open slot
    // No credit change (credit deducted post-class by auto-deduction)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'cancelSlot') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const { slotId } = req.body;
      let slots = await getSlots();
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return res.status(404).json({ error: 'Not found' });
      if (slot.gcEventId) {
        const gt = await getGoogleToken();
        if (gt) await deleteGCalEvent(gt, slot.gcEventId);
      }
      await saveSlots(slots.map(s => s.id === slotId ? { ...s, status: 'cancelled', cancelledAt: new Date().toISOString() } : s));
      return res.json({ ok: true });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BOOK SLOT — two modes:
    //   1. {slotId}             → book a manually pre-created open slot
    //   2. {date, time, duration} → create + book in one step (weekday availability flow)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'bookSlot') {
      const { slotId, date, time, duration = 60 } = req.body;
      let [slots, studentData] = await Promise.all([getSlots(), getStudentData()]);

      let slot, slotIdx;

      if (slotId) {
        // Mode 1: existing pre-created slot
        slotIdx = slots.findIndex(s => s.id === slotId);
        if (slotIdx < 0) return res.status(404).json({ error: 'Slot not found' });
        slot = slots[slotIdx];
        if (slot.status !== 'open') return res.status(409).json({ error: 'Slot is no longer available' });
      } else {
        // Mode 2: book directly by date + time (generated from weekly availability)
        if (!date || !time) return res.status(400).json({ error: 'date and time required' });
        if (new Date(`${date}T${time}:00`) <= new Date()) return res.status(409).json({ error: 'That time has already passed' });
        if (hasConflict(slots, date, time, duration)) return res.status(409).json({ error: 'conflict', message: 'That time was just booked by someone else. Please pick another slot.' });
        // Create a new slot record on the fly
        slot = { id: uid(), date, time, duration, status: 'open', studentId: null, studentName: null, bookedAt: null, gcEventId: null, createdAt: new Date().toISOString() };
        slots = [...slots, slot];
        slotIdx = slots.length - 1;
      }

      // Resolve student
      let student;
      if (isTutor && req.body.studentId) {
        student = (studentData?.students || []).find(s => s.id === req.body.studentId);
      } else {
        student = (studentData?.students || []).find(s => s.email && s.email.toLowerCase() === session.email.toLowerCase());
      }
      if (!student) return res.status(404).json({ error: 'Student profile not found. Ask your tutor to link your email.' });

      // Credit check (students only — tutor can override)
      if (!isTutor) {
        const credits = totalLessonCredits(student);
        if (credits <= 0) {
          return res.status(402).json({ error: 'no_credits', message: 'No remaining classes. Ask Hadi to top up your balance.' });
        }
      }

      // Create Google Calendar event (non-fatal if it fails)
      let gcEventId = null;
      let calendarWarning = null;
      try {
        const gt = await getGoogleToken();
        if (gt) gcEventId = await createGCalEvent(gt, slot, student.name);
        else calendarWarning = 'Google Calendar not configured — event was not added to your calendar.';
      } catch (gcErr) {
        calendarWarning = 'Booking confirmed, but Google Calendar sync failed: ' + gcErr.message;
      }

      const updated = { ...slot, status: 'booked', studentId: student.id, studentName: student.name, bookedAt: new Date().toISOString(), gcEventId };
      await saveSlots(slots.map((s, i) => i === slotIdx ? updated : s));

      let noticeWarning = null;
      try {
        await upsertBookingNotice(studentData, updated, student, 'booked');
      } catch (noticeErr) {
        noticeWarning = 'Booking saved, but the tutor inbox notice could not be updated: ' + noticeErr.message;
      }

      return res.json({ ok: true, slot: updated, ...(calendarWarning ? { calendarWarning } : {}), ...(noticeWarning ? { noticeWarning } : {}) });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL BOOKING — student cancels their own booking (or tutor cancels for them)
    // Slot reverts to open; no credit impact (was never deducted)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'cancelBooking') {
      const { slotId } = req.body;
      let [slots, studentData] = await Promise.all([getSlots(), getStudentData()]);
      const slotIdx = slots.findIndex(s => s.id === slotId);
      if (slotIdx < 0) return res.status(404).json({ error: 'Not found' });
      const slot = slots[slotIdx];
      if (slot.status !== 'booked') return res.status(409).json({ error: 'Slot is not booked' });

      // Students may only cancel their own booking
      if (!isTutor) {
        const stu = (studentData?.students || []).find(s => s.email && s.email.toLowerCase() === session.email.toLowerCase());
        if (!stu || slot.studentId !== stu.id) return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete GCal event
      if (slot.gcEventId) {
        const gt = await getGoogleToken();
        if (gt) await deleteGCalEvent(gt, slot.gcEventId);
      }

      await saveSlots(slots.map((s, i) => i === slotIdx ? { ...s, status: 'open', studentId: null, studentName: null, bookedAt: null, gcEventId: null } : s));
      const student = (studentData?.students || []).find(st => st.id === slot.studentId);
      try {
        await upsertBookingNotice(studentData, slot, student, 'cancelled');
      } catch {}
      return res.json({ ok: true });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPLETE SLOT — tutor manually marks a slot completed + deducts credit
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'completeSlot') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const { slotId } = req.body;
      let [slots, studentData, deductions] = await Promise.all([getSlots(), getStudentData(), getDeductions()]);
      const slotIdx = slots.findIndex(s => s.id === slotId);
      if (slotIdx < 0) return res.status(404).json({ error: 'Not found' });
      const slot = slots[slotIdx];
      if (slot.status === 'completed') return res.status(409).json({ error: 'Already completed' });

      if (slot.studentId && studentData) {
        const stu = (studentData.students || []).find(s => s.id === slot.studentId);
        if (stu) {
          const now = new Date();
          const credit = deductLessonCredit(stu, now);
          studentData = { ...studentData, students: studentData.students.map(s => s.id === stu.id ? credit.student : s) };
          deductions  = [...deductions, { id: uid(), studentId: stu.id, studentName: stu.name, slotId: slot.id, date: slot.date, time: slot.time, duration: slot.duration, deductedAt: now.toISOString(), classesBefore: credit.before, classesAfter: credit.after, type: 'manual', creditType: credit.creditType }];
          await Promise.all([saveStudentData(studentData), saveDeductions(deductions)]);
        }
      }

      await saveSlots(slots.map((s, i) => i === slotIdx ? { ...s, status: 'completed', completedAt: new Date().toISOString(), autoDeducted: false } : s));
      return res.json({ ok: true });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADJUST CREDITS — tutor adds or removes classes from a student's balance
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'adjustCredits') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const { studentId, delta, note = '' } = req.body;
      if (!studentId || typeof delta !== 'number') return res.status(400).json({ error: 'studentId and delta required' });
      let [studentData, deductions] = await Promise.all([getStudentData(), getDeductions()]);
      if (!studentData) return res.status(404).json({ error: 'No student data' });
      const stu = (studentData.students || []).find(s => s.id === studentId);
      if (!stu) return res.status(404).json({ error: 'Student not found' });

      const before = typeof stu.remainingClasses === 'number' ? stu.remainingClasses : Math.max(0, (stu.lessonsTotal || 0) - (stu.lessonsTaken || 0));
      const after  = Math.max(0, before + delta);
      studentData = { ...studentData, students: studentData.students.map(s => s.id === studentId ? { ...s, remainingClasses: after } : s) };
      deductions  = [...deductions, { id: uid(), studentId: stu.id, studentName: stu.name, slotId: null, date: new Date().toISOString().split('T')[0], time: null, duration: null, deductedAt: new Date().toISOString(), classesBefore: before, classesAfter: after, type: delta > 0 ? 'top_up' : 'manual_deduct', note }];
      await Promise.all([saveStudentData(studentData), saveDeductions(deductions)]);
      return res.json({ ok: true, remaining: after });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET DEDUCTIONS — tutor only
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'getDeductions') {
      if (!isTutor) return res.status(403).json({ error: 'Unauthorized' });
      const deductions = await getDeductions();
      return res.json({ deductions: deductions.slice().reverse() }); // newest first
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    if (err.message === 'KV_NOT_CONFIGURED') return res.status(503).json({ error: 'kv_not_configured' });
    return res.status(500).json({ error: err.message });
  }
}
