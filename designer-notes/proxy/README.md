# ta-dn-proxy — comment storage backend

A tiny Cloudflare Worker that stores the designer-notes comments + access log in
Cloudflare KV. The browser only ever talks to this Worker, so **no GitHub token
or secret lives in the site repo or the page**.

Endpoints: `GET/PUT /comments` · `GET/POST /log` · `GET /export` (markdown).

## Currently hosted

This is deployed at **`https://ta-dn-proxy.andrewturnbull.workers.dev`** (Andrew's
Cloudflare account) and is what `API_BASE` in `../comments.js` and `../gate.js`
points at. Comments for the review live in that account's KV.

## Deploy your own (to fully own it)

To run the backend on your own Cloudflare account and keep the data there:

```
cd designer-notes/proxy
npx wrangler login                    # one-time
npx wrangler kv namespace create DN   # paste the printed id into wrangler.toml
npx wrangler deploy                   # prints https://ta-dn-proxy.<you>.workers.dev
```

Then set `API_BASE` in `../comments.js` and `../gate.js` to your Worker URL.

Notes:
- Add your site's origin(s) to `ALLOWED_ORIGINS` in `worker.js` (currently
  `jordan-eh.github.io` + localhost).
- No secrets are involved — data lives in KV. The `wrangler.toml` KV id is just an
  identifier; using it requires your Cloudflare account auth.
