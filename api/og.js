export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'Missing url' });

  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol))
      return res.status(400).json({ error: 'Invalid URL' });
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const domain = parsed.hostname.replace(/^www\./, '');
  // Google's favicon service — always returns something
  const favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;

  try {
    // ── 1. YouTube — dedicated oEmbed + thumbnail ──────────────────────────
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      const videoId = ytMatch[1];
      try {
        const r = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (r.ok) {
          const d = await r.json();
          return res.json({
            title: d.title || '',
            image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            description: d.author_name ? `by ${d.author_name}` : '',
            type: 'youtube', videoId, domain: 'youtube.com'
          });
        }
      } catch {}
      return res.json({
        title: '', image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        description: '', type: 'youtube', videoId, domain: 'youtube.com'
      });
    }

    // ── 2. Try scraping the page HTML directly ─────────────────────────────
    const scraped = await scrapeOG(url, parsed);
    if (scraped && scraped.title) {
      return res.json({
        ...scraped,
        image: scraped.image || favicon,
        domain
      });
    }

    // ── 3. Fallback: microlink.io (free, handles JS-heavy & blocked sites) ─
    try {
      const ml = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(9000) }
      );
      if (ml.ok) {
        const m = await ml.json();
        if (m.status === 'success' && m.data) {
          return res.json({
            title: m.data.title || domain,
            image: m.data.image?.url || favicon,
            description: m.data.description || '',
            type: 'link', domain
          });
        }
      }
    } catch {}

    // ── 4. Last resort: domain name + favicon ─────────────────────────────
    return res.json({ title: domain, image: favicon, description: '', type: 'link', domain });

  } catch {
    return res.json({ title: domain, image: favicon, description: '', type: 'link', domain });
  }
}

// ── HTML scraper ────────────────────────────────────────────────────────────
async function scrapeOG(url, parsed) {
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow'
    });

    // Still try to read the body even on 4xx — some sites send OG tags with 403
    const html = await r.text();
    if (!html || html.length < 100) return null;

    const decode = s => s
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

    const getTag = (...names) => {
      for (const name of names) {
        // property/name before content
        let m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']{1,600})["']`, 'i'));
        if (m) return decode(m[1]);
        // content before property/name
        m = html.match(new RegExp(`<meta[^>]+content=["']([^"']{1,600})["'][^>]+(?:property|name)=["']${name}["']`, 'i'));
        if (m) return decode(m[1]);
      }
      return '';
    };

    const titleMatch = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);
    const rawTitle = getTag('og:title', 'twitter:title') || (titleMatch ? decode(titleMatch[1]) : '');
    let rawImage = getTag('og:image', 'twitter:image:src', 'twitter:image');
    const rawDesc = getTag('og:description', 'twitter:description', 'description');

    // Make image URL absolute
    if (rawImage) {
      if (rawImage.startsWith('//')) rawImage = parsed.protocol + rawImage;
      else if (rawImage.startsWith('/')) rawImage = `${parsed.protocol}//${parsed.host}${rawImage}`;
    }

    return { title: rawTitle, image: rawImage || '', description: rawDesc, type: 'link' };
  } catch {
    return null;
  }
}
