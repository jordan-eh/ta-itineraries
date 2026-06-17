# Designer-Notes — review overlay for ta-itineraries

A self-contained, Figma-style commenting layer for this prototype, plus a
Travel Alberta–styled sign-in gate so every comment is attributed to a named
reviewer. Adapted from the Pursuit booking-flows tool. **Nothing here touches
Jordan's site code** beyond two `<script>` tags in `index.html`.

## What it does

- **Stage gate** (`gate.js`) — blocks the page until a reviewer enters their
  **name** + the shared **password** (`travelalberta`). Password is asked once
  per browser; returning reviewers just confirm their name. The name is attached
  as the `author` on every comment they leave.
- **Comments** (`comments.js`) — click the round comment button (bottom-left) to
  enter comment mode, then click anywhere on the page to drop a pin and type a
  note. A side panel lists all comments. No comment-type dropdown — every note
  is a plain "Comment".
- **Desktop vs Mobile** — the desktop view and the mobile preview (`frame.html`,
  which loads the page in a phone iframe) keep separate comment sets so pins
  don't bleed between layouts. Both appear as pages ("Desktop" / "Mobile") in the
  side panel.
- **Access log** — each authenticated visit appends a row to
  `designer-notes/access-log.md` in the repo (silently skipped until a token is
  set; see below).

## Hotkeys & deep links

- `C` — toggle comment mode / panel · `Esc` — close · `E` — edit open comment
- **`Cmd/Ctrl + .`** — toggle all comment chrome (pins + button) on/off
- **`?chrome=off`** — skip the gate and hide all comment chrome (for clean
  screenshots); still logs the visit as "Anonymous"

## Adding it to another page (modular)

1. In the page `<head>`, before content: `<script src="designer-notes/gate.js"></script>`
2. Before `</body>`: `<script src="designer-notes/comments.js"></script>`
3. In `comments.js`, add the page to `PAGE_LABELS`
   (`'file-name-without-ext': 'Friendly Label'`) so the panel groups it.

Paths are relative — adjust `designer-notes/` to `../designer-notes/` etc. for
pages in subfolders.

## Comment sync (via a Cloudflare Worker)

Comments and the access log are stored in **Cloudflare KV** by a small Worker
(`ta-dn-proxy`). The browser only ever talks to the Worker — there is **no GitHub
token anywhere** (not in this repo, not in the page). This sidesteps the whole
problem of a public repo: nothing for GitHub secret scanning to revoke, nothing
sensitive in page source.

The Worker exposes:
- `GET /comments` · `PUT /comments` — the comment set (JSON array)
- `POST /log` · `GET /log` — the access log
- `GET /export` — comments rendered as a markdown document

**Wiring:** set `API_BASE` to the deployed Worker URL (no trailing slash) at the
top of **both** `comments.js` and `gate.js`. With `API_BASE` unset the tool loads
nothing and silently skips saving — safe for local preview.

The Worker source ships with this tool in **`proxy/`** — see
[`proxy/README.md`](proxy/README.md) for deploy steps. It's currently hosted at
`https://ta-dn-proxy.andrewturnbull.workers.dev`, which is what `API_BASE` points
at; deploy your own to that folder to take ownership of the backend/data.

No tokens or secrets are involved — the data lives entirely in Cloudflare KV. The
Worker only accepts those few routes, so the worst a stray request could do is
edit the comment list / log for this prototype.
