/* ============================================================================
 * ta-dn-proxy — Cloudflare Worker backend for the designer-notes commenting
 * tool. Stores everything in Cloudflare KV (binding: DN). NO GitHub, NO token,
 * NO secrets — the data lives entirely in Cloudflare.
 *
 * Endpoints (called by the browser):
 *   GET  /comments            -> JSON array of comments (or [])
 *   PUT  /comments            -> replace the comments array (JSON body)
 *   POST /log                 -> append an access-log entry {user, page}
 *   GET  /log                 -> JSON array of access-log entries
 *   GET  /export              -> comments rendered as a markdown document
 *
 * Deploy: see wrangler.toml. Create the KV namespace first:
 *   npx wrangler kv namespace create DN   (paste the id into wrangler.toml)
 * ==========================================================================*/

const ALLOWED_ORIGINS = [
  'https://jordan-eh.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const MAX_BODY = 1_000_000; // 1 MB cap on a comments write
const MAX_LOG = 5000;       // keep the last N access entries

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
function clip(v, n) { return String(v == null ? '' : v).slice(0, n); }

function renderMarkdown(comments) {
  const lines = ['# Comments', ''];
  const byPage = {};
  comments.forEach(c => { (byPage[c.page] = byPage[c.page] || []).push(c); });
  let n = 1;
  Object.keys(byPage).sort().forEach(page => {
    lines.push(`## ${page}`, '');
    byPage[page].forEach(c => {
      lines.push(`### ${n}. ${c.author || 'Unknown'}`);
      lines.push('**Element:** `' + (c.selector || '') + '`');
      lines.push('**Created:** ' + (c.createdAt || '').replace('T', ' ').slice(0, 16), '');
      String(c.text || '').split('\n').forEach(l => lines.push('> ' + l));
      lines.push('', '---', '');
      n++;
    });
  });
  return lines.join('\n');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get('Origin') || '');
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!env.DN) return json({ error: 'KV not bound' }, 500, cors);

    // --- comments ---
    if (url.pathname === '/comments') {
      if (method === 'GET') {
        const data = await env.DN.get('comments');
        return new Response(data || '[]', { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (method === 'PUT') {
        const body = await request.text();
        if (body.length > MAX_BODY) return json({ error: 'Too large' }, 413, cors);
        let parsed;
        try { parsed = JSON.parse(body); } catch { return json({ error: 'Invalid JSON' }, 400, cors); }
        if (!Array.isArray(parsed)) return json({ error: 'Expected an array' }, 400, cors);
        await env.DN.put('comments', JSON.stringify(parsed));
        return json({ ok: true, count: parsed.length }, 200, cors);
      }
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    // --- access log ---
    if (url.pathname === '/log') {
      if (method === 'GET') {
        const data = await env.DN.get('access-log');
        return new Response(data || '[]', { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (method === 'POST') {
        const entry = await request.json().catch(() => null);
        if (!entry || !entry.user) return json({ error: 'Missing user' }, 400, cors);
        const raw = await env.DN.get('access-log');
        const log = raw ? JSON.parse(raw) : [];
        log.push({ ts: new Date().toISOString(), user: clip(entry.user, 80), page: clip(entry.page, 80) });
        if (log.length > MAX_LOG) log.splice(0, log.length - MAX_LOG);
        await env.DN.put('access-log', JSON.stringify(log));
        return json({ ok: true }, 200, cors);
      }
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    // --- markdown export of comments ---
    if (url.pathname === '/export' && method === 'GET') {
      const data = await env.DN.get('comments');
      const md = renderMarkdown(data ? JSON.parse(data) : []);
      return new Response(md, { status: 200, headers: { ...cors, 'Content-Type': 'text/markdown; charset=utf-8' } });
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
