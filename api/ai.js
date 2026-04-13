export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, context } = req.body;
    if (!type || !context) return res.status(400).json({ error: 'Missing type or context' });

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

Student info: studying ${context.type || 'Arabic'} at ${context.level || 'beginner'} level. Goals: ${context.goals || 'general Arabic learning'}.`;
        userMessage = context.message;
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
        systemPrompt = `You are Hadi, a structured Arabic language tutor. Generate a 4-week lesson plan for this student. Format it as 4 numbered weeks, each with 3-4 bullet points covering: topic, what to practice, and one speaking/confidence exercise. Keep it practical, specific, and motivating. No fluff.`;
        userMessage = `Student: ${context.name}
Level: ${context.level} | Dialect: ${context.type}
Skills (1-5): Reading ${context.skillReading}, Writing ${context.skillWriting}, Listening ${context.skillListening}, Speaking ${context.skillSpeaking}
Goals: ${context.goals || 'general improvement'}
Next focus: ${context.nextSteps || 'not specified'}
Lessons completed: ${context.lessonsTaken}`;
        break;

      case 'schedule_lesson':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are a scheduling assistant. Parse the user's natural language input and extract lesson scheduling details. Respond with ONLY a valid JSON object with these fields: { "studentName": string, "date": "YYYY-MM-DD", "time": "HH:MM", "duration": number (minutes), "notes": string }. Today is ${new Date().toISOString().split('T')[0]}. For relative dates like "tomorrow", "next Monday", calculate the actual date. If any field is unclear, use reasonable defaults (duration: 60, notes: ""). Do not include any explanation, just the JSON.`;
        userMessage = context.message;
        break;

      case 'student_quiz':
        model = 'claude-haiku-4-5-20251001';
        systemPrompt = `You are an Arabic language teacher creating a quiz. Generate exactly 5 multiple-choice questions. CRITICAL RULES:
1. "q" field: ALWAYS in English. Example: "What does this word mean?" or "Which word means 'house'?"
2. "ar" field: The Arabic word, phrase, or sentence being tested — written with FULL diacritics (tashkeel/harakat). If the question does not reference a specific Arabic item, set "ar" to "".
3. "options" field: 4 choices. If testing meaning → options are English words. If testing Arabic spelling/form → options are Arabic WITH full diacritics. Mix types across the 5 questions.
4. "answer" field: index (0-3) of the correct option.
5. "tip" field: brief English explanation of the correct answer, including the Arabic transliteration.
Respond with ONLY a valid JSON array, no markdown, no explanation. Format: [{"q":"English question","ar":"عَرَبِيٌّ (with diacritics or empty)","options":["A","B","C","D"],"answer":0,"tip":"English explanation"}]`;
        userMessage = `Student: ${context.name}
Level: ${context.level} | Type: ${context.type}
Skills (1-5): Reading ${context.skillReading}, Writing ${context.skillWriting}, Listening ${context.skillListening}, Speaking ${context.skillSpeaking}
Completed topics: ${context.topics || 'General Arabic'}
Goals: ${context.goals || 'general improvement'}`;
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

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no explanation. Use this exact format:

For VERBS:
{"word":"fully-vowelled Arabic","type":"verb","root":"ف - ع - ل","pattern":"فَعَلَ","meaning":"English meaning","usage":"very common|common|uncommon|rare","note":"brief note on usage, verb type (sound/hollow/defective/doubled), or context","table":[{"pronoun_ar":"أَنَا","pronoun_en":"I","past":"...","present":"...","imperative":"—"},{"pronoun_ar":"أَنْتَ","pronoun_en":"you (m.sg.)","past":"...","present":"...","imperative":"..."},{"pronoun_ar":"أَنْتِ","pronoun_en":"you (f.sg.)","past":"...","present":"...","imperative":"..."},{"pronoun_ar":"هُوَ","pronoun_en":"he","past":"...","present":"...","imperative":"—"},{"pronoun_ar":"هِيَ","pronoun_en":"she","past":"...","present":"...","imperative":"—"},{"pronoun_ar":"نَحْنُ","pronoun_en":"we","past":"...","present":"...","imperative":"—"},{"pronoun_ar":"أَنْتُمْ","pronoun_en":"you (m.pl.)","past":"...","present":"...","imperative":"..."},{"pronoun_ar":"هُمْ","pronoun_en":"they (m.)","past":"...","present":"...","imperative":"—"}]}

For NOUNS:
{"word":"fully-vowelled Arabic","type":"noun","root":"ف - ع - ل","pattern":"فِعَالٌ","gender":"مُذَكَّر (masculine)|مُؤَنَّث (feminine)","meaning":"English meaning","usage":"very common|common|uncommon|rare","note":"brief note including plural type (sound plural / broken plural and its pattern)","table":[{"form_ar":"مُفْرَد","form_en":"Singular","indef":"...","def":"..."},{"form_ar":"مُثَنَّى (رَفْع)","form_en":"Dual (nom.)","indef":"...","def":"..."},{"form_ar":"مُثَنَّى (نَصْب/جَرّ)","form_en":"Dual (acc./gen.)","indef":"...","def":"..."},{"form_ar":"جَمْع","form_en":"Plural","indef":"...","def":"..."}]}`;
        userMessage = `Word: "${context.word}"\nStudent level: ${context.level} | Arabic type: ${context.type}`;
        break;

      default:
        return res.status(400).json({ error: 'Unknown type: ' + type });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
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
