# TA Itineraries — Claude Code Context

## Project

Pixel-accurate HTML/CSS replica of a **Travel Alberta** itinerary detail page, built from Figma designs in the file **TA-26-1099 | Maps Everywhere** (file key: `vTnlWwl3Ip0hDRpoNm38GJ`, page: `↳ Itineraries`, frame node: `10699:19236`).

Live site: https://jordan-eh.github.io/ta-itineraries/
GitHub repo: https://github.com/jordan-eh/ta-itineraries

## File Structure

| File/Folder | Purpose |
|---|---|
| `index.html` | All HTML structure |
| `styles.css` | All CSS — no preprocessor, plain CSS custom properties |
| `server.js` | Zero-dep Node.js dev server (`node server.js` → `http://localhost:3000`) |
| `images/logo-text.png` | Canada's Alberta logo (white text, exported from Figma node `10699:19252` at 2×) |
| `images/logo.svg` | SVG version of the full logo block (red bg + white text) |
| `main.js` | Accordion toggle — 3-line click listener, toggles `is-open` on `.explore-activities` |
| `map.js` | Dynamic map — MapLibre GL JS init, per-day state data, scroll detection, `setState()` transitions |

## Running Locally

```bash
node server.js
# Open http://localhost:3000
```

No build step. No dependencies required for the static site — `server.js` is only for local dev.

## Design Tokens

| Token | Value |
|---|---|
| Primary red | `#9C0F00` |
| Teal accent | `#00A79A` |
| Mint background | `#E6F7F5` |
| Footer navy | `#073142` |
| Gray text | `#69727A` |
| Border/separator | `#DBDEDF` |
| Content padding (most sections) | `112px` (CSS var `--content-pad`) |
| Content padding (discover/kbyg/footer) | `214px` (CSS var `--wide-pad`) |
| Primary font | Futura PT → Outfit (Google Fonts fallback) |

## Page Sections (top → bottom)

1. **Nav** — 100px tall, white bg. Logo block: `images/logo-text.png` (white Canada's Alberta text) on `#9C0F00` red at 188px wide. Main links (17.9px, weight 500, letter-spacing 0.36px, gap 35px). Secondary links "Upcoming Events" / "Experience Providers" (15.9px, weight 400, centered, gap 12px). Search icon with 26px extra left margin. Bottom border `#DBDEDF` runs only under the links section, not behind the logo.
2. **Breadcrumb + H1 + Hero** — H1 "Landscapes and Cultural Discovery" at 47.8px bold, line-height 1.17. Full-width gray hero image placeholder (462px tall). Page title padding: `60px 112px 54px`.
3. **Intro** — 2-col at 112px side padding. Left (557px): headline (36.3px bold, lh 44.38px), body (20.2px, lh 26.22px), "Itinerary best for" gray box (padding 32px), "At a glance" mint card (380px wide, h3 gap 68px). Right (524px): map placeholder (524×753px, border-radius 24px) + "Expand map" black pill button.
4. **Map + Itinerary** — 2-col at 112px padding. Left (611px): "Starts in Calgary" → drive connectors → 5 day panels. Each day panel has an accordion "Explore activities (N)" drawer. Day 1 starts open; Days 2–5 start collapsed. Right (524px): transparent spacer — the actual map is `#dynamic-map` (`position: fixed; right: 112px; top: 100px; width: 524px; height: calc(100vh - 120px)`). Section margin-bottom 120px. Drive connectors: 7 dots (gap 11px), padding 20px top/bottom, min-height 120px.
5. **Discover more** — 3-card grid at 214px padding. Heading 36px bold. Cards: image 366px tall, "X DAYS" red badge (bottom-right, letter-spacing 3px), title 16.6px bold, desc 15px, "Learn more →" link. Grid gap 36px.
6. **Know before you go** — Mint bg, 214px padding, 3×2 grid (gap 48px 0) of teal icon links.
7. **Footer** — Dark navy `#073142`, 214px padding. "Travel Alberta" italic logo, 4 link columns, territorial acknowledgement, copyright. Teal "Back to Top" button (top-right, padding 9px 12px).

## Figma Reference Node IDs

| Section | Node ID |
|---|---|
| Full page frame | `10699:19236` |
| Nav (CON - Main Navigation) | `10699:19238` |
| Logo group | `10699:19249` |
| Logo image fill rect | `10699:19252` |
| Intro section | `10699:19257` |
| Day 1 panel | `10699:19323` |
| Day 2 panel | `10699:19366` |
| Activities container | `10699:19344` |
| Discover/KBYG/Footer group | `10699:19545` |
| Activity card | `10699:19551` |

## Activity Content (sourced from travelalberta.com)

Activity titles and counts match the live page exactly:

| Day | Count | Titles |
|---|---|---|
| Day 1 — Banff | 5 | Drive to Banff National Park · Via Ferrata at Mount Norquay · Lake Minnewanka Cruise · Trail Ride with Banff Trail Riders · Check into Fairmont Banff Springs Hotel |
| Day 2 — Lake Louise, Icefield Parkway and Jasper | 5 | Brunch at Fairmont Chateau Lake Louise · Glacier SkyWalk · Columbia Icefield Glacier Adventure · Check into Fairmont Jasper Park Lodge · Jasper Planetarium & Telescope Experience |
| Day 3 — Jasper and Canmore | 3 | Maligne Lake Cruise · Jasper SkyTram · Drive to Canmore along the Icefield Parkway |
| Day 4 — Canmore and Calgary | 5 | Canmore Cave Tours · Carter-Ryan Gallery and Live Art Venue · Yamnuska Wolfdog Sanctuary · WinSport's Canada Olympic Park · Overnight in Calgary's vibrant East Village |
| Day 5 — Calgary | 3 | Heritage Park · Calgary Food Tour · Calgary Tower |

## Accordion Behaviour

- `.explore-activities` drawer is hidden by default (`display: none` on `.activities-list`)
- Add `.is-open` class to show the list (`display: flex`) and rotate the chevron 180°
- Day 1 starts with `is-open` applied in HTML
- `main.js` toggles `is-open` on click of `.activities-toggle`

## Dynamic Map

- **Library:** MapLibre GL JS 4.7.1 + OpenFreeMap liberty vector tiles (no API key)
- **Element:** `<div id="dynamic-map">` — `position: fixed; right: 112px; top: 100px`
- **Visibility:** fades in when `.intro-section` is in view; fades out when `.discover-more-section` enters view
- **Overview state:** all 5 numbered stops + full dotted route line; active before any day card hits the 40% trigger
- **Day state:** triggered when a `.day-panel[data-day]` top edge ≤ 40% of viewport height; shows only that day's stops + route segment + drive pill overlay
- **Scroll detection:** throttled `scroll` listener + `requestAnimationFrame` in `map.js` → `setState('overview' | 1–5)`
- **Swap to Mapbox:** replace the OpenFreeMap style URL with `'mapbox://styles/mapbox/streets-v12'` and add `accessToken` to the Map constructor

| Day | Stops on map | Drive pill |
|---|---|---|
| Overview | Calgary, Banff, Lake Louise, Jasper, Canmore | — |
| Day 1 | Calgary → Banff | 1 hr 23 min · 127 km |
| Day 2 | Lake Louise → Columbia Icefield → Jasper | 38 min · 57.1 km |
| Day 3 | Jasper → Canmore | 2 hr 57 min · 287 km |
| Day 4 | Canmore → Calgary | 58 min · 102 km |
| Day 5 | Calgary | — |

## Coding Conventions

- **No build tools.** Plain HTML + CSS + vanilla JS — no Sass, no bundler, no framework.
- **Pixel values from Figma are exact.** Absolute line-heights (e.g. `26.22px`) come directly from Figma's pixel measurements — do not convert to relative ratios without checking.
- **Logo is an image.** `images/logo-text.png` is the Figma export. The red background comes from `.nav-logo { background: #9C0F00 }` — do not bake the background into the image.
- **Nav bottom border** only covers `.nav-inner` (the links side), not the full nav width. This matches the Figma separator that starts after the logo block.
- **CSS custom properties** are defined in `:root` in `styles.css` — use them for all repeated values.
- **No comments** unless the why is non-obvious (hidden constraint, Figma quirk, etc.).

## Next Steps

- [ ] Image carousel interaction (click nav-right button to cycle photos)
- [ ] Replace all placeholder images/colors with real photography
- [ ] Sticky nav behaviour on scroll
- [ ] Mobile/responsive breakpoints
