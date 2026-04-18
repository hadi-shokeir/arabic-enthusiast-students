// Server-side proxy for Arabic sentence generation via Anthropic API.
// Students never see the API key — it lives in Vercel env vars.

const DIFF_DESC = {
  beginner:     'short sentences, high-frequency everyday vocabulary, no subordinate clauses, simple verb forms',
  intermediate: 'moderate length, connectors (لأن، لما، إذا، بعد ما), varied verb forms, some less common structures',
  advanced:     'subordinate clauses, conditionals, relative clauses, idiomatic expressions, rich vocabulary'
};

function buildPrompt(mode, sentenceType, difficulty, topic) {
  const dDesc  = DIFF_DESC[difficulty] || DIFF_DESC.beginner;
  const tName  = sentenceType === 'complex' ? 'complex (جملة مركبة)' : 'simple (جملة بسيطة)';
  const typeL  = sentenceType === 'complex'
    ? 'Include at least one subordinate clause or connector.'
    : 'Keep it a single-clause simple sentence.';
  const topicL = topic ? `Topic: "${topic}".` : 'Choose a natural everyday topic.';

  if (mode === 'msa') {
    return `You are an expert Arabic language teacher. Generate exactly one ${difficulty} ${tName} sentence in formal Modern Standard Arabic (MSA / الفصحى).
${topicL}
Difficulty (${difficulty}): ${dDesc}.
${typeL}
Apply proper إعراب (case endings) visible through diacritics where appropriate.

YOU MUST RESPOND WITH ONLY A RAW JSON OBJECT. No markdown. No backticks. No code fences. No preamble. Start with { and end with }.

{"sentence":"...","transliteration":"...","translation":"...","grammar_note":"..."}

- sentence: Arabic text with diacritics where helpful
- transliteration: standard Latin transliteration
- translation: English translation
- grammar_note: 1-2 sentences using Arabic grammatical terms (مبتدأ، خبر، فعل، فاعل، مفعول به، مضاف إليه، نعت، etc.) with brief English explanations`;
  } else {
    return `You are an expert linguist specializing in Lebanese colloquial Arabic (اللهجة اللبنانية). Generate exactly one ${difficulty} ${tName} sentence in authentic Lebanese dialect.
${topicL}
Difficulty (${difficulty}): ${dDesc}.
${typeL}

CRITICAL — use genuine Lebanese features:
• Particles: هيدا/هيدي (this), شو (what), كيف (how), عم + verb (progressive), رح + verb (future), ما (negation), منيح (good), هلق (now), كتير (very), لأنو (because), متل (like), بدّو/بدّي (want to)
• Do NOT write MSA. Write as people speak in Beirut.
• Reflect Lebanese phonology in transliteration (ق as glottal stop ʔ where appropriate).

YOU MUST RESPOND WITH ONLY A RAW JSON OBJECT. No markdown. No backticks. No code fences. No preamble. Start with { and end with }.

{"sentence":"...","transliteration":"...","translation":"...","grammar_note":"..."}

- sentence: Lebanese dialect in Arabic script
- transliteration: Latin rendering of actual Lebanese pronunciation
- translation: English translation
- grammar_note: 1-2 sentences noting key differences from MSA (عم for progressive, رح for future, etc.)`;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI not configured on server.' });

  const { mode = 'msa', sentenceType = 'simple', difficulty = 'beginner', topic = '' } = req.body || {};

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: buildPrompt(mode, sentenceType, difficulty, topic),
        messages: [{ role: 'user', content: 'Generate the sentence now.' }]
      })
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: e.error?.message || `API error (${r.status})` });
    }

    const data = await r.json();
    let raw = (data.content?.[0]?.text || '').trim();

    // Strip accidental markdown fences
    raw = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/,'').trim();
    const jsonStart = raw.indexOf('{');
    if (jsonStart > 0) raw = raw.slice(jsonStart);

    const parsed = JSON.parse(raw);
    return res.json({ ok: true, result: parsed });

  } catch (e) {
    return res.status(500).json({ error: e.message || 'Generation failed.' });
  }
}
