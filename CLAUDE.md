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
| `main.js` | Accordion toggle — click listener toggles `is-open` on `.explore-activities` |
| `map.js` | Dynamic map — MapLibre GL JS init, per-day state data, scroll detection, `setState()` transitions |
| `images/logo-text.png` | Canada's Alberta logo (white text, exported from Figma node `10699:19252` at 2×) |
| `images/logo.svg` | SVG version of the full logo block (red bg + white text) |
| `images/logo.png` | Full logo with red background |
| `docs/superpowers/specs/` | Design specs (brainstorming output) |
| `docs/superpowers/plans/` | Implementation plans |

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
| Border/separator | `#E2E8ED` (CSS var `--border`) |
| Content padding (most sections) | `112px` (CSS var `--content-pad`) |
| Content padding (discover/kbyg/footer) | `214px` (CSS var `--wide-pad`) |
| Primary font | Futura PT → Outfit (Google Fonts fallback) |

## Page Sections (top → bottom)

1. **Nav** — 100px tall, white bg. Logo block: `images/logo-text.png` (white Canada's Alberta text) on `#9C0F00` red at 188px wide. Main links (17.9px, weight 500, letter-spacing 0.36px, gap 35px). Secondary links "Upcoming Events" / "Experience Providers" (15.9px, weight 400, centered, gap 12px). Search icon with 26px extra left margin. Bottom border `#DBDEDF` runs only under the links section, not behind the logo.
2. **Breadcrumb + H1 + Hero** — H1 "Landscapes and Cultural Discovery" at 47.8px bold, line-height 1.17. Full-width gray hero image placeholder (462px tall). Page title padding: `60px 112px 54px`.
3. **Main two-column layout** (`.main-layout`) — wraps the intro and itinerary sections in a single `display: flex; gap: 80px; padding: 120px 112px 0` container. Left column (`.main-left`, `flex: 1`) holds the intro content and day cards stacked. Right column (`.main-right`, `width: 524px; position: sticky; top: 24px`) holds `#dynamic-map`.
   - **Intro content** (`.intro-section` inside `.main-left`): headline (36.3px bold), body (20.2px), "Itinerary best for" gray box, "At a glance" mint card (380px wide).
   - **Itinerary section** (`.itinerary-section` inside `.main-left`, `margin-top: 120px`): "Starts in Calgary" header → drive connectors → 11 day panels. Each has an accordion "Explore activities (N)" drawer. Day 1 starts open; Days 2–11 start collapsed. The `.itinerary-col` has a continuous teal dashed connector line running its full height via `::before` at `left: 25px`. Day panels are offset `margin-left: 37px` so the line is visible to their left. Drive connectors have a 4-ring teal connector node (`.connector-node`, box-shadow rings) pushed to the bottom of their left column, marking each day transition.
4. **Discover more** — 3-card grid at 214px padding. Heading 36px bold. Cards: image 366px tall, "X DAYS" red badge (bottom-right, letter-spacing 3px), title 16.6px bold, desc 15px, "Learn more →" link. Grid gap 36px.
5. **Know before you go** — Mint bg, 214px padding, 3×2 grid (gap 48px 0) of teal icon links.
6. **Footer** — Dark navy `#073142`, 214px padding. "Travel Alberta" italic logo, 4 link columns, territorial acknowledgement, copyright. Teal "Back to Top" button (top-right, padding 9px 12px).

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
| Map frame (524×753) | `10701:20182` |
| "Starts in Calgary" + first drive connector | `10761:32627` |
| Itinerary section group (Days 1–3 area) | `10759:5564` |

## Activity Content (sourced from travelalberta.com)

Activity titles and counts match the live page exactly:

| Day | Count | Titles |
|---|---|---|
| Day 1 — Banff | 5 | Drive to Banff National Park · Via Ferrata at Mount Norquay · Lake Minnewanka Cruise · Trail Ride with Banff Trail Riders · Check into Fairmont Banff Springs Hotel |
| Day 2 — Lake Louise, Icefield Parkway and Jasper | 5 | Brunch at Fairmont Chateau Lake Louise · Glacier SkyWalk · Columbia Icefield Glacier Adventure · Check into Fairmont Jasper Park Lodge · Jasper Planetarium & Telescope Experience |
| Day 3 — Jasper and Canmore | 3 | Maligne Lake Cruise · Jasper SkyTram · Drive to Canmore along the Icefield Parkway |
| Day 4 — Canmore and Calgary | 5 | Canmore Cave Tours · Carter-Ryan Gallery and Live Art Venue · Yamnuska Wolfdog Sanctuary · WinSport's Canada Olympic Park · Overnight in Calgary's vibrant East Village |
| Day 5 — Calgary | 3 | Heritage Park · Calgary Food Tour · Calgary Tower |
| Day 6 — Southern Alberta | 4 | The hoodoos of Drumheller · Royal Tyrrell Museum of Palaeontology · Dinosaur Provincial Park · Overnight in Medicine Hat |
| Day 7 — Medicine Hat | 4 | Saamis Teepee · Medalta Potteries National Historic Site · Cypress Hills Interprovincial Park · Hell's Basement Brewery |
| Day 8 — Writing-on-Stone and Lethbridge | 4 | Áísínai'pi / Writing-on-Stone Provincial Park · Fort Whoop-Up · Galt Museum and Archives · Nikka Yuko Japanese Garden |
| Day 9 — Waterton Lakes National Park | 5 | Drive into Waterton · Alpine Stables trail ride · Lunch at Prince of Wales Hotel · Cameron Lake · Shoreline Cruise |
| Day 10 — Southern Rockies | 5 | Red Rock Canyon · Crowsnest Pass scenic drive · Bellevue Mine · Frank Slide Interpretive Centre · Overnight at Country Encounters B&B |
| Day 11 — Southern Alberta to Calgary | 3 | Head-Smashed-In Buffalo Jump · Bar U Ranch National Historic Site · Wet your whistle at Eau Claire Distillery |

## Accordion Behaviour

- `.explore-activities` drawer is hidden by default (`display: none` on `.activities-list`)
- Add `.is-open` class to show the list (`display: flex`) and rotate the chevron 180°
- Day 1 starts with `is-open` applied in HTML
- `main.js` toggles `is-open` on click of `.activities-toggle`

## Dynamic Map

- **Library:** MapLibre GL JS 4.7.1 + OpenFreeMap liberty vector tiles (no API key required)
- **CDN:** `https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.{js,css}`
- **Tile style:** `https://tiles.openfreemap.org/styles/liberty`
- **Container:** `<div id="dynamic-map">` — 524×753px, `border-radius: 24px`, `overflow: hidden`. Lives inside `.main-right` in normal document flow (not `position: fixed`).
- **Layout:** `.main-right { width: 524px; position: sticky; top: 24px; align-self: flex-start }` — sticks below the viewport top as the user scrolls through day cards, then scrolls away naturally after the last section.
- **No fade-out:** the map is always visible once the page loads; there is no opacity or visibility toggle based on scroll position.
- **Overview state:** Calgary full pin (no number) + small teal dots for all 15 stops + full dotted route line + "15 destinations" pill. Active before any day card hits the 40% scroll trigger.
- **Day state:** triggered when a `.day-panel[data-day]` top edge ≤ 40% viewport height; shows only that day's stops, route segment(s), per-segment drive pills, and approach route/pill if applicable.
- **Scroll detection:** throttled `scroll` listener + `requestAnimationFrame` in `map.js` → `update()` → `setState('overview' | 1–11)`. `update()` is also called immediately on map load (no waiting for first scroll event).
- **Initial fitBounds:** `currentState = 'overview'` causes `setState('overview')` to return early on load. An explicit `map.fitBounds(OVERVIEW_BOUNDS, { padding: 60, duration: 0 })` call in `map.on('load')` compensates.
- **Marker toggling:** `visibility: hidden/visible` (not `display: none/flex`) — preserves the flex-column wrapper layout so the name pill always renders correctly when shown.
- **Pin labels:** each marker is a flex-column wrapper — numbered circle on top, city name pill below. Same pill style as segment pills (white bg, `#E2E8ED` border, `border-radius: 100px`, subtle box-shadow).
- **Swap to Mapbox:** replace the OpenFreeMap style URL with `'mapbox://styles/mapbox/streets-v12'` and add `accessToken` to the Map constructor.

### DAYS array structure

Each entry in `DAYS` (indices 0–10) has:
- `stops[]` — `{ name, lnglat }` array of cities/towns shown as numbered pins
- `route` — coordinate array for the solid red route line (null for single-stop days)
- `bounds` — `[[sw], [ne]]` for `fitBounds`
- `segments[]` — `{ time, dist }` per stop-pair; powers the per-segment drive pills
- `approachFrom` (optional) — `{ lnglat, seg: { time, dist } }` for days that start somewhere different from the previous day's last stop; powers a dashed approach line and approach pill

### Per-segment drive pills

- Created in `setState` via `makeSegmentPillEl(time, dist)` — a small white pill with a car SVG icon, time, and distance (km only, miles stripped)
- Placed at the geographic midpoint of each segment using a `maplibregl.Marker` with `anchor: 'center'`
- Stored in `segmentPillMarkers` as `[{ marker, a, b }]` (segment endpoints needed for overlap resolution)
- After `map.fitBounds` animates, `map.once('moveend', resolveSegmentPillOverlaps)` nudges pills perpendicularly off the route to avoid overlap with stops and each other
- `resolveSegmentPillOverlaps` tries both ± perpendicular directions, picks whichever requires fewer steps (minimum displacement), max 8 steps × 10px = 80px

### Approach routes (between-day connectors)

Days 2, 6, and 11 start somewhere different from where the previous day ended. Each has:
- A dashed red route layer (`layer-approach-day-N`) pre-built in `map.on('load')`, shown only when that day is active
- An approach segment pill showing the travel time/distance from the previous day's location
- A small teal dot (`makeSmallMarkerEl('#00A79A')`) at the `approachFrom.lnglat` location (the previous day's end point), created/destroyed in `setState`

| Day | approachFrom | Approach segment |
|---|---|---|
| Day 2 | Banff `[-115.5708, 51.1784]` | 38 min · 57.1 km |
| Day 6 | Calgary `[-114.0719, 51.0447]` | 1 hr 30 min · 139 km |
| Day 11 | Crowsnest Pass `[-114.4969, 49.6239]` | 1 hr 25 min · 118 km |

### Overview options

Two marker sets are pre-built in `map.on('load')`:
- **Option 1** (`overviewMarkersOpt1`): Calgary full pin (label "1") + Jasper + Medicine Hat full empty pins (furthest NW/E) + small dots for remaining 12 stops. Currently hidden.
- **Option 2** (`overviewMarkersOpt2`, default): Calgary full pin (no number) + small dots for all other 14 stops.

`activeOverviewOption = 2` is the default. The `.map-options-toggle` UI is hidden via CSS (`display: none`) — Option 2 is the only active view. The "15 destinations" pill (`.map-destinations-pill`) shows in overview state and hides in day states.

### Map state reference

| Day | Stops on map | Segments | Approach from |
|---|---|---|---|
| Overview | All 15 stops (Calgary pin + small dots) | — | — |
| Day 1 | Calgary → Banff | 1 hr 23 min · 127 km | — |
| Day 2 | Lake Louise → Columbia Icefield → Jasper | 1 hr 20 min · 126 km; 1 hr 10 min · 103 km | Banff (38 min · 57.1 km) |
| Day 3 | Jasper → Canmore | 2 hr 57 min · 287 km | — |
| Day 4 | Canmore → Calgary | 58 min · 102 km | — |
| Day 5 | Calgary (no route) | — | — |
| Day 6 | Drumheller → Brooks → Medicine Hat | 55 min · 88 km; 1 hr 45 min · 180 km | Calgary (1 hr 30 min · 139 km) |
| Day 7 | Medicine Hat (no route) | — | — |
| Day 8 | Medicine Hat → Milk River → Lethbridge | 1 hr 35 min · 157 km; 55 min · 85 km | — |
| Day 9 | Lethbridge → Waterton Lakes | 1 hr · 84 km | — |
| Day 10 | Waterton Lakes → Crowsnest Pass | 1 hr 25 min · 118 km | — |
| Day 11 | Fort Macleod → Longview → Calgary | 1 hr · 96 km; 1 hr 30 min · 130 km | Crowsnest Pass (1 hr 25 min · 118 km) |

## Coding Conventions

- **No build tools.** Plain HTML + CSS + vanilla JS — no Sass, no bundler, no framework.
- **Pixel values from Figma are exact.** Absolute line-heights (e.g. `26.22px`) come directly from Figma's pixel measurements — do not convert to relative ratios without checking.
- **Logo is an image.** `images/logo-text.png` is the Figma export. The red background comes from `.nav-logo { background: #9C0F00 }` — do not bake the background into the image.
- **Nav bottom border** only covers `.nav-inner` (the links side), not the full nav width. This matches the Figma separator that starts after the logo block.
- **CSS custom properties** are defined in `:root` in `styles.css` — use them for all repeated values.
- **No comments** unless the why is non-obvious (hidden constraint, Figma quirk, etc.).

## Itinerary Section Layout

### Connector line + nodes

The vertical teal dashed connector runs the full height of `.itinerary-col` via a CSS `::before` pseudo-element:
- `left: 25px` — aligns with the connector-dots column inside each drive connector
- `background: repeating-linear-gradient(...)` — 5px dash / 7px gap, `#00A79A`

Day panels have `margin-left: 37px`, leaving an 11px gap between the line (right edge at 26px) and the panel (left edge at 37px), matching the Figma.

The drive connector gap is `37px` (connector-dots → pill), placing the pill at ~63px from the left — matching the Figma offset.

### Connector node (`.connector-node`)

Used at the bottom of each `.drive-connector`'s `.connector-dots` column (via `justify-content: flex-end`) to mark each day transition. Four concentric rings via `box-shadow`:
```
box-shadow: 0 0 0 3px rgba(0,167,154,0.30),  /* inner halo 18px */
            0 0 0 9px #00A79A,                 /* solid ring 30px */
            0 0 0 17px rgba(0,167,154,0.30);   /* outer halo 46px */
```
Figma source: Groups 294722 + 294723 (node `10759:5494`, `10759:5497`).

### "Starts in Calgary" header

Figma node `10761:32627`. Structure:
- `.location-start-dot` — `padding-left: 24px; padding-top: 6px` — contains `.location-dot` (11×11px solid teal circle, Figma: Ellipse 213)
- `.location-details` — `loc-label` ("Starts in", 17.2px gray) + `loc-title` ("Calgary", 48px bold, line-height 56px)
- No circle/image placeholder — removed

### Drive connector pill (`.drive-pill`)

Background `#E6F7F5` (mint), `border-radius: 122px`, no border. Contains car icon (`drive_eta_24px` SVG from Figma, 15×15px, `#69727A` fill) + time + distance text.

## Next Steps

- [ ] Image carousel interaction (click nav-right button to cycle photos)
- [ ] Replace all placeholder images/colors with real photography
- [ ] Sticky nav behaviour on scroll
- [ ] Mobile/responsive breakpoints
