const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

async function validateToken(token) {
  if (!token || !KV || !KV_TOKEN) return false;
  try {
    const r = await fetch(KV, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', 'sessions'])
    });
    const d = await r.json();
    const sessions = d.result ? JSON.parse(d.result) : {};
    const s = sessions[token];
    if (!s) return false;
    if (s.createdAt && (Date.now() - new Date(s.createdAt).getTime()) > SESSION_MAX_AGE_MS) return false;
    return true;
  } catch { return false; }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, context, token } = req.body;
    if (!type || !context) return res.status(400).json({ error: 'Missing type or context' });

    // Auth check — every AI call must have a valid session token
    const authed = await validateToken(token);
    if (!authed) return res.status(403).json({ error: 'Unauthorized' });

    let model, systemPrompt, userMessage;

    switch (type) {
      case 'student_analysis':
        model = 'claude-sonnet-4-6';
        systemPrompt = 'You are an expert Arabic language teaching assistant. Analyze the student data and respond with a concise bulleted list (max 8 bullets). Focus on: current level assessment, strengths, areas needing work, and 2-3 specific teaching recommendations. Be direct and actionable.';
        userMessage = `Student: ${context.name}
Level: ${context.level} | Type: ${context.type}
Lessons taken: ${context.lessonsTaken} | Attendance: ${context.attendance}%
Skills (1-5): Reading ${context.skillReading}, Writing ${context.skillWriting}, Listening ${context.skillListening}, Speaking ${context.skillSpeaking}
Goals: ${context.goals || 'Not specified'}
Next steps: ${context.nextSteps || 'Not specified'}
Teacher notes: ${context.teacherNotes || 'None'}
Homework notes: ${context.homeworkNotes || 'None'}`;
        break;

      case 'homework_feedback':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = 'You are an Arabic language teacher giving feedback on student homework. Be encouraging, specific, and concise. Max 5 bullet points. Point out what is good, what needs correction, and one tip for improvement.';
        userMessage = `Homework task: ${context.title}
Instructions: ${context.description || 'N/A'}
Student submission: ${context.submission}`;
        break;

      case 'student_chat':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are Hadi's AI — the digital version of Hadi, an Arabic language tutor and linguist. You teach ${context.type || 'Arabic'} dialect at ${context.level || 'beginner'} level.

Your personality mirrors Hadi exactly:
- Structured and methodical: give clear, step-by-step explanations when needed
- Fun and engaging: keep the energy up, use light humour, and occasionally tease or challenge the student to push them
- Confident and direct: say things clearly, no fluff
- Core belief: confidence is everything — the biggest barrier to Arabic is fear, so always make the student feel bold and capable

How you respond:
- Keep answers SHORT — max 3-4 sentences
- When relevant, always show: Arabic script → transliteration → meaning (e.g. كيف حالك؟ — Kif halak? — How are you?)
- If the student makes a mistake in Arabic, correct it and briefly explain WHY (the rule or reason), then move on
- End EVERY message with one of these (rotate naturally): a mini challenge ("Now you try saying X in Arabic"), a curious question to keep the conversation going, or asking them to repeat back what they learned
- Never let the conversation die — always keep the student engaged and moving forward

Student info: studying ${context.type || 'Arabic'} at ${context.level || 'beginner'} level. Goals: ${context.goals || 'general Arabic learning'}.${context.learningWhy ? ' Why they\'re learning: ' + context.learningWhy + '.' : ''}${context.interests ? ' Interests: ' + context.interests + '.' : ''}`;

        // Build multi-turn messages from history
        const history = (context.history || []).slice(-40); // last 40 messages (~20 exchanges)
        const chatMessages = [
          ...history.map(m => ({ role: m.r === 'user' ? 'user' : 'assistant', content: m.t })),
          { role: 'user', content: context.message }
        ];
        // For multi-turn, don't use userMessage — use chatMessages directly below
        userMessage = null;
        break;

      case 'homework_hint':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are Hadi's AI — the digital version of Hadi, a structured but fun Arabic tutor. A student is stuck on their homework. Give ONE hint only — do NOT give the full answer. Be encouraging but also challenge them: tell them they're close and push them to think harder. Keep it to 1-2 sentences max.`;
        userMessage = `Homework: ${context.title}\n${context.description || ''}`;
        break;

      case 'student_tasks':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are Hadi's AI — the digital version of Hadi, an Arabic tutor who is structured, methodical, fun, and occasionally challenging. Generate exactly 5 concrete, practical practice tasks for this student to do this week. Each task must be on its own line, starting with a checkbox emoji ☐. Be very specific — not generic. Match tasks to their weakest skills and goals. Make at least one task a speaking or confidence challenge. No explanations, no headers, just 5 lines.`;
        userMessage = `Student: ${context.name}
Level: ${context.level} | Dialect: ${context.type}
Skills (1=weakest, 5=best): Reading ${context.skillReading}/5, Writing ${context.skillWriting}/5, Listening ${context.skillListening}/5, Speaking ${context.skillSpeaking}/5
Goals: ${context.goals || 'general improvement'}
Next focus: ${context.nextSteps || 'not specified'}
Lessons completed: ${context.lessonsTaken} | Attendance: ${context.attendance}%`;
        break;

      case 'lesson_plan':
        model = 'claude-sonnet-4-6';
        systemPrompt = `You are Hadi, a structured Arabic language tutor. Generate a superbly practical 4-week plan for one private student.

Use the evidence provided: active Arabic tracks, skill ratings, recent lesson logs, homework, open tasks, goals, teacher notes, attendance, and weaknesses.

Format:
1. Start with a one-paragraph level diagnosis.
2. Then give Week 1 to Week 4.
3. Each week must include: lesson focus, review focus, new language, speaking/drill task, homework, and what Hadi should watch for.
4. End with 5 concrete weekly tasks.

Keep it specific, actionable, and realistic. Do not write generic advice.`;
        userMessage = `Student: ${context.name}
Level: ${context.level} | Arabic type: ${context.type}
Active tracks: ${context.studyTypes || 'Not specified'}
Attendance: ${context.attendance || 'N/A'}%
Skills (1-5): Reading ${context.skillReading}, Writing ${context.skillWriting}, Listening ${context.skillListening}, Speaking ${context.skillSpeaking}
Detailed assessment:
${context.trackSummary || 'No detailed track ratings provided'}
Goals: ${context.goals || 'general improvement'}
Next focus: ${context.nextSteps || 'not specified'}
Strengths: ${context.strengths || 'Not specified'}
Areas to improve: ${context.improve || 'Not specified'}
Teacher notes: ${context.teacherNotes || 'None'}
Homework notes: ${context.homeworkNotes || 'None'}
Recent lesson logs:
${context.recentLessons || 'No lesson logs yet'}
Recent homework:
${context.homeworkSummary || 'No homework history yet'}
Open weekly tasks:
${context.openTasks || 'None'}
Lessons completed: ${context.lessonsTaken}`;
        break;

      case 'lesson_feedback':
        model = 'claude-sonnet-4-6';
        systemPrompt = `You are Hadi's AI assistant for his Arabic tutoring business. After each lesson, Hadi writes notes and you update the student's learning plan.

Respond with ONLY a valid JSON object, no markdown, no extra text:
{
  "nextSteps": "2-3 sentences: what to focus on in the next lesson(s), specific and actionable",
  "weeklyTasks": ["task 1", "task 2", "task 3", "task 4", "task 5"],
  "studentSummary": "Warm, encouraging 1-2 sentence summary for the student in second person (you) about this lesson and what comes next",
  "teacherSummary": "1-2 sentence internal note for Hadi about this student's current trajectory and what to watch for"
}

Rules:
- nextSteps must be grounded in what was ACTUALLY covered this lesson and the student's gaps
- weeklyTasks must be concrete, doable practice tasks (not generic)
- studentSummary is shown to the student — be warm but honest
- teacherSummary is private — be direct and clinical`;
        userMessage = `Student: ${context.name}
Level: ${context.level} | Arabic type: ${context.type}
Lessons taken so far: ${context.lessonsTaken}
Current goals: ${context.goals || 'Not specified'}
Previous next steps: ${context.currentNextSteps || 'None yet'}
Skills (1-5): Reading ${context.skillReading||3}, Writing ${context.skillWriting||3}, Listening ${context.skillListening||3}, Speaking ${context.skillSpeaking||3}

LESSON FEEDBACK FROM HADI:
Date: ${context.date}
Topics covered: ${context.coveredTopics}
Student performance: ${context.performance}
Additional notes: ${context.teacherNotes || 'None'}`;
        break;

      case 'schedule_lesson':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are a scheduling assistant. Parse the user's natural language input and extract lesson scheduling details. Respond with ONLY a valid JSON object with these fields: { "studentName": string, "date": "YYYY-MM-DD", "time": "HH:MM", "duration": number (minutes), "notes": string }. Today is ${new Date().toISOString().split('T')[0]}. For relative dates like "tomorrow", "next Monday", calculate the actual date. If any field is unclear, use reasonable defaults (duration: 60, notes: ""). Do not include any explanation, just the JSON.`;
        userMessage = context.message;
        break;

      case 'student_quiz':
        model = 'claude-sonnet-4-6';
        systemPrompt = `You are an expert Arabic language teacher creating a unique, challenging quiz. Generate exactly 5 multiple-choice questions.

══ OUTPUT FORMAT ══
Respond with ONLY a valid JSON object, no markdown:
{"dialect":"classical|quranic|levantine|general","questions":[...5 questions...]}

- "dialect": Tag the quiz based on its content. Use "quranic" ONLY if questions use verified Quranic vocabulary or Tajweed concepts. Use "levantine" ONLY if you are 100% certain the dialect used is authentic Levantine Arabic (not MSA). Use "classical" for standard MSA content. Use "general" if mixed.
- Each question: {"q":"English question","ar":"Arabic with full diacritics or empty","show_ar":true|false,"options":["A","B","C","D"],"answer":0,"tip":"explanation"}

══ QUESTION TYPES — use one of each ══
1. Arabic→English: Show Arabic (show_ar:true), options are English meanings. Pick unusual vocabulary, not just basic words.
2. English→Arabic: "Which is the correct Arabic for X?" — ar:"", show_ar:false. Options are 4 Arabic words WITH full diacritics. NEVER reveal the answer in the question body.
3. Grammar/form: Conjugation, plural, case ending, or sentence completion. Show the sentence or base word (show_ar:true if Arabic is shown). Options are Arabic word forms.
4. Root/pattern: "Which word shares the root X-Y-Z?" or "What pattern does this word follow?" Options are Arabic words or patterns.
5. Contextual: Culture, usage, or real-world scenario. Can be entirely in English. ar:"", show_ar:false.

══ DIFFICULTY RULES ══
- beginner: common vocabulary and basic conjugations, but still make distractors plausible
- intermediate: less common vocabulary, complex verb forms, broken plurals, grammar subtleties
- advanced: rare vocabulary, dual forms, weak verbs, case endings (i'rab), idiomatic usage

══ CRITICAL RULES ══
- NEVER repeat questions from the list of previous questions provided
- Wrong options must be plausible — similar roots, similar patterns, common mistakes
- Randomise the correct answer position (don't put the answer at the same index repeatedly)
- All Arabic text must have FULL tashkeel (diacritics) on every letter
- "tip": 1-2 sentences explaining WHY, with transliteration of key terms`;

        const prevQStr = (context.prevQuestions||[]).length > 0
          ? `\nPREVIOUS QUESTIONS TO AVOID (do not repeat these):\n${(context.prevQuestions||[]).map((q,i)=>`${i+1}. ${q}`).join('\n')}`
          : '';
        userMessage = `Student: ${context.name}
Arabic type: ${context.type} | Requested difficulty: ${context.level}
Skills (1=weakest 5=best): Reading ${context.skillReading}, Writing ${context.skillWriting}, Listening ${context.skillListening}, Speaking ${context.skillSpeaking}
${context.topic ? `Quiz topic: ${context.topic}` : 'No specific topic — generate a varied, personalised quiz'}
${context.goals ? `Student goals: ${context.goals}` : ''}
${context.learningWhy ? `Motivation: ${context.learningWhy}` : ''}
${context.interests ? `Interests: ${context.interests}` : ''}
${context.challenge ? `Biggest challenge: ${context.challenge}` : ''}
${context.personalGoal ? `Personal goal: ${context.personalGoal}` : ''}${prevQStr}

Generate 5 questions (one of each type). Calibrate difficulty to "${context.level}". Match the Arabic type (${context.type}). If Quranic motivation or topic, include relevant content. Make every question unique and distinct.`;
        break;

      case 'flashcard_generate':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are an Arabic language teacher creating flashcards. Generate exactly 12 flashcards for the given topic. Each card must have: "en" (English word or phrase), "ar" (Arabic with FULL diacritics/tashkeel), "translit" (romanised transliteration). Match the student's dialect and level. Respond with ONLY a valid JSON array, no markdown: [{"en":"...","ar":"...","translit":"..."}]`;
        userMessage = `Topic: ${context.topic}\nLevel: ${context.level} | Dialect: ${context.type}`;
        break;

      case 'flashcard_translate':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are an Arabic language teacher. Translate the given English word into Arabic. Respond with ONLY a valid JSON object, no markdown: {"en":"original word","ar":"Arabic with FULL diacritics","translit":"romanised transliteration","note":"brief usage note if helpful, otherwise empty string"}`;
        userMessage = `Word: "${context.word}"\nStudent level: ${context.level} | Dialect: ${context.type}`;
        break;

      case 'conjugation':
        model = 'claude-sonnet-4-6';
        systemPrompt = `You are an expert Arabic linguist and grammarian. The user will give you an Arabic word or its English meaning. Identify whether it is a verb (فعل) or noun (اسم) and generate its full conjugation or declension table with FULL diacritics (tashkeel) on every Arabic word.

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no explanation.

═══ VERB CONJUGATION RULES FOR MARKING ═══
For each conjugated verb form, wrap the letters that are ADDED to the base verb (هُوَ past = base) inside [[double brackets]].
- Past tense: the suffix added to the stem is the pronoun marker. Example: كَتَبَ base → كَتَبْ[[تُ]] (أنا), كَتَبْ[[تَ]] (أنت), كَتَبَ[[تْ]] (هي), كَتَبْ[[نَا]] (نحن)
- Present tense: the prefix (and any suffix) is the pronoun marker. Example: يَكْتُبُ base → [[أَ]]كْتُبُ (أنا), [[تَ]]كْتُبُ (أنت), [[يَ]]كْتُبُ (هو), [[تَ]]كْتُبِ[[ينَ]] (أنت f.)
- هُوَ forms (base form): no brackets needed — it is the reference base
- Imperative: mark the prefix and/or suffix that signals the addressee
- Use — for forms that do not exist (e.g. imperative for أنا, هو, هي, نحن, هم)

For VERBS use this EXACT JSON (12 pronoun rows — include dual and feminine plural).
Each row MUST include past_en, present_en, imperative_en — the English translation of that conjugated form (e.g. "I wrote", "you write", "write!" — use "—" when imperative doesn't apply):
{"word":"fully-vowelled Arabic","type":"verb","root":"ف - ع - ل","pattern":"فَعَلَ","meaning":"English meaning","usage":"very common|common|uncommon|rare","note":"brief note on verb type (sound/hollow/defective/doubled) and any irregularities","table":[
{"pronoun_ar":"أَنَا","pronoun_en":"I","person":"1st","past":"كَتَبْ[[تُ]]","past_en":"I wrote","present":"[[أَ]]كْتُبُ","present_en":"I write","imperative":"—","imperative_en":"—"},
{"pronoun_ar":"نَحْنُ","pronoun_en":"we","person":"1st","past":"كَتَبْ[[نَا]]","past_en":"we wrote","present":"[[نَ]]كْتُبُ","present_en":"we write","imperative":"—","imperative_en":"—"},
{"pronoun_ar":"أَنْتَ","pronoun_en":"you (m.sg.)","person":"2nd","past":"كَتَبْ[[تَ]]","past_en":"you wrote","present":"[[تَ]]كْتُبُ","present_en":"you write","imperative":"[[اُ]]كْتُبْ","imperative_en":"write!"},
{"pronoun_ar":"أَنْتِ","pronoun_en":"you (f.sg.)","person":"2nd","past":"كَتَبْ[[تِ]]","past_en":"you wrote","present":"[[تَ]]كْتُبِ[[ينَ]]","present_en":"you write","imperative":"[[اُ]]كْتُبِ[[ي]]","imperative_en":"write!"},
{"pronoun_ar":"أَنْتُمَا","pronoun_en":"you two","person":"2nd","past":"كَتَبْ[[تُمَا]]","past_en":"you two wrote","present":"[[تَ]]كْتُبَ[[انِ]]","present_en":"you two write","imperative":"[[اُ]]كْتُبَ[[ا]]","imperative_en":"write! (two)"},
{"pronoun_ar":"أَنْتُمْ","pronoun_en":"you (m.pl.)","person":"2nd","past":"كَتَبْ[[تُمْ]]","past_en":"you all wrote","present":"[[تَ]]كْتُبُ[[ونَ]]","present_en":"you all write","imperative":"[[اُ]]كْتُبُ[[وا]]","imperative_en":"write! (pl.)"},
{"pronoun_ar":"أَنْتُنَّ","pronoun_en":"you (f.pl.)","person":"2nd","past":"كَتَبْ[[تُنَّ]]","past_en":"you all wrote","present":"[[تَ]]كْتُبْ[[نَ]]","present_en":"you all write","imperative":"[[اُ]]كْتُبْ[[نَ]]","imperative_en":"write! (f.pl.)"},
{"pronoun_ar":"هُوَ","pronoun_en":"he","person":"3rd","past":"كَتَبَ","past_en":"he wrote","present":"[[يَ]]كْتُبُ","present_en":"he writes","imperative":"—","imperative_en":"—"},
{"pronoun_ar":"هِيَ","pronoun_en":"she","person":"3rd","past":"كَتَبَ[[تْ]]","past_en":"she wrote","present":"[[تَ]]كْتُبُ","present_en":"she writes","imperative":"—","imperative_en":"—"},
{"pronoun_ar":"هُمَا","pronoun_en":"they two","person":"3rd","past":"كَتَبَ[[ا]]","past_en":"they two wrote","present":"[[يَ]]كْتُبَ[[انِ]]","present_en":"they two write","imperative":"—","imperative_en":"—"},
{"pronoun_ar":"هُمْ","pronoun_en":"they (m.pl.)","person":"3rd","past":"كَتَبُ[[وا]]","past_en":"they wrote","present":"[[يَ]]كْتُبُ[[ونَ]]","present_en":"they write","imperative":"—","imperative_en":"—"},
{"pronoun_ar":"هُنَّ","pronoun_en":"they (f.pl.)","person":"3rd","past":"كَتَبْ[[نَ]]","past_en":"they wrote","present":"[[يَ]]كْتُبْ[[نَ]]","present_en":"they write","imperative":"—","imperative_en":"—"}
]}

For NOUNS — CRITICAL RULES:
1. ONLY include forms that ACTUALLY EXIST and are DIRECTLY derived from this exact word.
2. Do NOT invent forms. For example كِتَاب (book) has the broken plural كُتُب — do NOT add كِتَابَات (writings, a completely different word).
3. Include ONLY: Singular + Dual (if normal usage) + the word's ACTUAL plural (one row). If both a sound plural AND broken plural exist, list each as a separate row but only if both are genuinely attested.
4. Each row must have a "translation" field showing the English meaning of that specific form.

{"word":"fully-vowelled Arabic","type":"noun","root":"ف - ع - ل","pattern":"فِعَالٌ","gender":"مُذَكَّر (masculine)|مُؤَنَّث (feminine)","meaning":"English meaning","usage":"very common|common|uncommon|rare","note":"brief note on the plural type and any irregularities","table":[
{"form_ar":"مُفْرَد","form_en":"Singular","indef":"كِتَابٌ","def":"الكِتَابُ","translation":"a book / the book"},
{"form_ar":"مُثَنَّى","form_en":"Dual","indef":"كِتَابَانِ / كِتَابَيْنِ","def":"الكِتَابَانِ / الكِتَابَيْنِ","translation":"two books"},
{"form_ar":"جَمْع","form_en":"Plural","indef":"كُتُبٌ","def":"الكُتُبُ","translation":"books / the books"}
]}

IMPORTANT: Generate ACTUAL correct forms for the requested word — do not copy the examples. Examples only show the format.`;
        userMessage = `Word: "${context.word}"\nStudent level: ${context.level} | Arabic type: ${context.type}`;
        break;

      default:
        return res.status(400).json({ error: 'Unknown type: ' + type });
    }

    // Conjugation tables need more tokens (12 rows × 3 tenses × translations)
    // Flashcard generate: 12 cards × Arabic diacritics + transliteration can exceed 1024
    const maxTokens = type === 'conjugation'       ? 2500
                    : type === 'flashcard_generate' ? 4096
                    : type === 'student_quiz'       ? 4096
                    : type === 'lesson_plan'        ? 2500
                    : 1024;

    // student_chat uses multi-turn messages built from history
    const messages = (type === 'student_chat')
      ? chatMessages
      : [{ role: 'user', content: userMessage }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json({ result: data.content[0].text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
