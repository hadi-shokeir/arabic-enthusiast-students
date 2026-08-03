const CACHE = 'arabic-enthusiast-v19';

// The app shell. Cached individually so ONE bad URL can no longer abort the
// whole install (the old addAll() did exactly that).
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/portal',
  '/portal.html',
  '/app.js',
  '/demo',
  '/demo/index.html',
  '/demo/portal',
  '/demo/portal/index.html',
  '/site-content.js',
  '/data.js',
  '/components.jsx',
  '/pages/Home.jsx',
  '/pages/Courses.jsx',
  '/pages/Pricing.jsx',
  '/pages/About.jsx',
  '/logo.jpeg',
  '/icon-maskable.svg',
  '/manifest.json'
];

// The portal cannot render without these. They were never precached, so an
// installed app on a weak connection showed a blank screen.
// jsPDF is deliberately absent: it is 356KB, loaded on demand by one tutor
// button, and precaching it would slow every student's first install.
const VENDOR_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.module.js'
];

const cacheable = res => res && (res.ok || res.type === 'opaque');

async function precache() {
  const c = await caches.open(CACHE);
  await Promise.allSettled(STATIC_ASSETS.map(u => c.add(new Request(u, {cache: 'reload'}))));
  await Promise.allSettled(VENDOR_ASSETS.map(async u => {
    const res = await fetch(u, {mode: 'cors', cache: 'reload'});
    if (cacheable(res)) await c.put(u, res);
  }));
}

self.addEventListener('install', e => {
  e.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

// Serve from cache, refresh in the background. Keeps the app instant on a phone
// and working offline, while still picking up new deploys on the next launch.
async function staleWhileRevalidate(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  const net = fetch(req).then(res => {
    if (cacheable(res)) c.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;       // never cache student data
  const sameOrigin = url.origin === self.location.origin;
  const isVendor = VENDOR_ASSETS.some(v => req.url.startsWith(v.split('?')[0]));
  if (!sameOrigin && !isVendor && !/fonts\.(googleapis|gstatic)\.com/.test(url.host)) return;

  // Pages: try the network first so a new deploy is picked up, but always fall
  // back to the cached shell instead of the browser's offline error page.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const preload = await e.preloadResponse;
        const res = preload || await fetch(req);
        if (cacheable(res)) (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch {
        const c = await caches.open(CACHE);
        return (await c.match(req))
            || (await c.match(url.pathname.startsWith('/portal') ? '/portal.html' : '/index.html'))
            || Response.error();
      }
    })());
    return;
  }

  e.respondWith(staleWhileRevalidate(req));
});

// Push notifications
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Arabic Enthusiast', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Arabic Enthusiast', {
      body: data.body || '',
      icon: '/logo.jpeg',
      badge: '/logo.jpeg',
      tag: data.tag || 'arabic-notif',
      data: { url: data.url || '/portal' },
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || '/portal';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) { c.navigate(target); return c.focus(); }
      }
      return clients.openWindow(target);
    })
  );
});
