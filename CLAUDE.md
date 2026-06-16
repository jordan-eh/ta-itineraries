# TA Itineraries — Claude Code Context

## Project

Pixel-accurate HTML/CSS replica of a **Travel Alberta** itinerary detail page, built from Figma designs in the file **TA-26-1099 | Maps Everywhere** (file key: `vTnlWwl3Ip0hDRpoNm38GJ`, page: `↳ Itineraries`, frame node: `10699:19236`).

Live site: https://jordan-eh.github.io/ta-itineraries/
GitHub repo: https://github.com/jordan-eh/ta-itineraries

## File Structure

| File/Folder | Purpose |
|---|---|
| `index.html` | All HTML structure — desktop view |
| `styles.css` | All CSS — no preprocessor, plain CSS custom properties |
| `frame.html` | Mobile device preview wrapper — phone mockup with iframe, view switcher |
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
| Drive pill background | `rgba(196, 66, 138, 0.10)` — 10% opacity mauve |
| Activity cluster badge | 40px circle, `#cfefec` fill, black border, bold font — matches travelalberta.com/map |
| Content padding (most sections) | `112px` (CSS var `--content-pad`) |
| Content padding (discover/kbyg/footer) | `214px` (CSS var `--wide-pad`) |
| Primary font | Futura PT → Outfit (Google Fonts fallback) |

## Page Sections (top → bottom)

1. **Nav** — 100px tall, white bg. Logo block: `images/logo-text.png` (white Canada's Alberta text) on `#9C0F00` red at 188px wide. Main links (17.9px, weight 500, letter-spacing 0.36px, gap 35px). Secondary links "Upcoming Events" / "Experience Providers" (15.9px, weight 400, centered, gap 12px). Search icon with 26px extra left margin. Bottom border `#DBDEDF` runs only under the links section, not behind the logo.
2. **Breadcrumb + H1 + Hero** — H1 "Landscapes and Cultural Discovery" at 47.8px bold, line-height 1.17. Full-width gray hero image placeholder (462px tall). Page title padding: `60px 112px 54px`.
3. **Main two-column layout** (`.main-layout`) — wraps the intro and itinerary sections in a single `display: flex; gap: 80px; padding: 80px 112px 0` container. Left column (`.main-left`, `flex: 1`) holds the intro content and day cards stacked. Right column (`.main-right`, `width: 524px; position: sticky; top: 24px`) holds `#dynamic-map`.
   - **Intro content** (`.intro-section` inside `.main-left`): full-width mint (`#E6F7F5`) background via `::before` pseudo-element (desktop only, hidden on mobile). Contains headline (36.3px bold), body (20.2px), "At a glance" section, and on mobile the "Itinerary best for" block.
   - **"Itinerary best for" bar** (`.best-for-hero`): desktop-only red bar (`#9C0F00`, 56px tall) that overlaps the bottom of the hero image by 32px (`margin-top: -32px`). Items span full bar width via `justify-content: space-between`, padding `0 143px 0 96px`. Hidden on mobile — a plain `.best-for-section` block inside `.intro-left` is shown instead.
   - **Itinerary section** (`.itinerary-section` inside `.main-left`, `margin-top: 67px`): "Starts in Calgary" header → drive connectors → 11 day panels. Each has an accordion "Explore activities (N)" drawer. Day 1 starts open; Days 2–11 start collapsed. The `.itinerary-col` has a teal dashed connector line via `::before` at `left: 25px`. Each `.day-panel-wrap` has a `.day-dot` absolutely positioned on the connector line (`top: 60px; left: -60px` desktop, `top: 4px; left: 3px` mobile). Desktop: 11×11px, aligned with destination title. Mobile: 5×5px, centered on line at page x≈29.5. Day panels offset `margin-left: 80px` (desktop) / `16px` (mobile, via wrap `margin-left`) from column left. No carousel nav or counter on any card except Day 1.
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

Titles match what appears on `travelalberta.com/trip-ideas/road-trips-itineraries/culture-and-landscapes` when clicking "Learn more" for each activity.

| Day | Count | Titles |
|---|---|---|
| Day 1 — Banff | 5 | Banff National Park · Mt. Norquay Via Ferrata · Lake Minnewanka Cruise · Banff Trail Riders · The Fairmont Banff Springs Hotel |
| Day 2 — Lake Louise, Icefield Parkway and Jasper | 5 | The Fairmont Chateau Lake Louise · Columbia Icefield Skywalk · Columbia Icefield Adventure · Fairmont Jasper Park Lodge · Jasper Planetarium & Telescope Experience |
| Day 3 — Jasper and Canmore | 3 | Maligne Lake Cruise · Jasper SkyTram · Drive to Canmore along the Icefield Parkway |
| Day 4 — Canmore and Calgary | 5 | Canmore Cave Tours · Carter-Ryan Gallery and Live Art Venue · Yamnuska Wolfdog Sanctuary · WinSport's Canada Olympic Park · Alt Hotel Calgary East Village |
| Day 5 — Calgary | 3 | Heritage Park Historical Village · Alberta Food Tours · Calgary Tower |
| Day 6 — Southern Alberta | 4 | Hoodoos and Hoodoo Trail · Royal Tyrrell Museum of Palaeontology · Dinosaur Provincial Park · Drive and overnight in Medicine Hat |
| Day 7 — Medicine Hat | 4 | Saamis Teepee · Medalta Potteries National Historic Site · Cypress Hills Interprovincial Park · Hell's Basement Brewery |
| Day 8 — Writing-on-Stone and Lethbridge | 4 | Writing-on-Stone Provincial Park/Áísínai'pi · Fort Whoop-Up · Galt Museum & Archives · Nikka Yuko Japanese Garden |
| Day 9 — Waterton Lakes National Park | 5 | Waterton Lakes National Park · Alpine Stables · Prince of Wales Hotel · Cameron Lake · Waterton Inter-Nation Shoreline Cruise |
| Day 10 — Southern Rockies | 5 | Red Rock Canyon · Drive to the Crowsnest Pass · The Bellevue Underground Mine · Frank Slide Interpretive Centre · Country Encounters |
| Day 11 — Southern Alberta to Calgary | 3 | Head-Smashed-In Buffalo Jump World Heritage Site · Bar U Ranch National Historic Site · Eau Claire Distillery |

## Accordion Behaviour

- `.explore-activities` drawer is hidden by default (`display: none` on `.activities-list`)
- Add `.is-open` class to show the list (`display: flex`) and swap the toggle icon
- Day 1 starts with `is-open` applied in HTML
- `main.js` toggles `is-open` on click of `.activities-toggle`
- **Desktop toggle icon:** chevron SVG is hidden (`display: none` in `@media (min-width: 431px)`); a CSS `::after` pseudo-element shows `+` (closed) or `−` (open)
- **Mobile toggle icon:** original chevron SVG (18×18px), rotates 180° when open via `transform: rotate(180deg)`

## Dynamic Map

- **Library:** MapLibre GL JS 4.7.1 + OpenFreeMap liberty vector tiles (no API key required)
- **CDN:** `https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.{js,css}`
- **Tile style:** `https://tiles.openfreemap.org/styles/liberty`
- **Container:** `<div id="dynamic-map">` — 524×753px, `border-radius: 24px`, `overflow: hidden`. Lives inside `.main-right` in normal document flow (not `position: fixed`).
- **Layout:** `.main-right { width: 524px; position: sticky; top: 24px; align-self: flex-start }` — sticks below the viewport top as the user scrolls through day cards, then scrolls away naturally after the last section.
- **Attribution:** Compact `©` button in the bottom-right corner via `mgl.AttributionControl({ compact: true })`. The MapLibre/Mapbox logo (bottom-left) is removed on load.
- **Scroll zoom:** Enabled on desktop (scroll wheel / trackpad). Touch pinch zoom always available. `resolveSegmentPillOverlaps` re-runs only on user-initiated zoom (`e.originalEvent` guard) — not during programmatic `fitBounds` animations.
- **Swap to Mapbox:** The library is aliased as `const mgl = typeof mapboxgl !== 'undefined' ? mapboxgl : maplibregl`. To switch: swap the CDN tags, set `mapboxgl.accessToken = 'pk...'`, and change the style URL to `'mapbox://styles/mapbox/streets-v12'`. No other code changes required.
- **No fade-out:** the map is always visible once the page loads; there is no opacity or visibility toggle based on scroll position.
- **Overview state:** Calgary full pin (no number) + small teal dots for all 15 stops + full dotted route line + "15 destinations" pill. Active before any day card hits the 40% scroll trigger.
- **Day state:** triggered when a `.day-panel[data-day]` top edge ≤ 40% viewport height; shows only that day's stops, route segment(s), per-segment drive pills, and approach route/pill if applicable.
- **Scroll detection:** throttled `scroll` listener + `requestAnimationFrame` in `map.js` → `update()` → `setState('overview' | 1–11)`. `update()` is also called immediately on map load (no waiting for first scroll event).
- **scrollLocked:** a module-level flag that pauses scroll-triggered `setState` calls during programmatic smooth-scroll (e.g. from overview pin clicks). Set to `true` before scrolling, cleared on `scrollend` (or 1200ms timeout fallback).
- **Initial fitBounds:** `currentState = 'overview'` causes `setState('overview')` to return early on load. An explicit `map.fitBounds(OVERVIEW_BOUNDS, { padding: 60, duration: 0 })` call in `map.on('load')` compensates.
- **Marker toggling:** `visibility: hidden/visible` (not `display: none/flex`) — preserves the flex-column wrapper layout so the name pill always renders correctly when shown.
- **Pin labels (`.map-city-pin` / `.map-city-label`):** each marker is a flex-column wrapper — numbered circle on top, city name pill below. Classes added so mobile CSS can override inline sizes. On mobile: pin 22×22px, label font 10px / padding 3px 7px.
- **Swap to Mapbox:** replace the OpenFreeMap style URL with `'mapbox://styles/mapbox/streets-v12'` and add `accessToken` to the Map constructor.

### Overview interactivity (desktop only)

- **Hover tooltip:** hovering any small dot in overview state shows a name pill tooltip (`.city-hover-popup`) matching the marker name-pill style — no arrow, `pointer-events: none`. Uses a single shared `mgl.Popup` instance reused on each `mouseenter`/`mouseleave`. Calgary's full pin already shows its name permanently, so no tooltip is added there.
- **Click to scroll:** clicking any overview pin smooth-scrolls to the corresponding day card (`panel.scrollIntoView({ behavior: 'smooth', block: 'start' })`). `scrollLocked` is set to `true` first so the map stays on the target day state during the scroll. Day dots are updated inline from the click handler.
- Both behaviours are gated by `!window.matchMedia('(max-width: 430px)').matches` at setup time — no effect on mobile.

### OVERVIEW_STOPS day mapping

Each entry in `OVERVIEW_STOPS` has a `day` property used for click-to-scroll:

| Stop | Day |
|---|---|
| Calgary | 1 |
| Banff | 1 |
| Lake Louise | 2 |
| Columbia Icefield | 2 |
| Jasper | 2 |
| Canmore | 3 |
| Drumheller | 6 |
| Brooks | 6 |
| Medicine Hat | 6 |
| Milk River | 8 |
| Lethbridge | 8 |
| Waterton Lakes | 9 |
| Crowsnest Pass | 10 |
| Fort Macleod | 11 |
| Longview | 11 |

### Activity pins

- **Default:** hidden (`showActivities = false`). Enabled via the **Route / Activities** toggle (dark pill, bottom-right, desktop only — hidden on mobile via `display: none !important`).
- **Distance label:** each activity pin label shows `name · X km` where X is the haversine distance to the nearest route stop for that day. Computed in `setActivityMarkers` using `haversineKm(a, b)`.
- **Zoom-dependent labels:** `.activity-pin-label` has `opacity: 0` by default. `#dynamic-map.zoom-labels .activity-pin-label { opacity: 1 }` reveals them. The `zoom-labels` class is toggled by `updateLabelVisibility()` when `map.getZoom() > defaultZoom + 0.3` (i.e., the user has manually zoomed beyond the auto-fit level).
- **`defaultZoom`:** captured in `map.once('moveend', ...)` after each `fitBounds` call in `setState`, and immediately after the initial `fitBounds` in `map.on('load')`.
- `makeActivityMarkerEl(name, distKm)` — teal-outline white dot (`.activity-pin-dot`) + name+distance label pill (`.activity-pin-label`)
- `setActivityMarkers(day)` — clears `activityMarkers[]`, then places new markers if `showActivities === true`, `day ≥ 1`, and not mobile. Called from `setState()` on every state change.
- Mobile: activities never placed (media query check in `setActivityMarkers`); toggle hidden in CSS.

### Per-segment drive pills

- Created in `setState` via `makeSegmentPillEl(time, dist)` — a small white pill with the `drive_eta_24px` Figma car icon (18×18px, `#69727A` fill), time, and distance (km only, miles stripped)
- Placed at the geographic midpoint of each segment using a `mgl.Marker` with `anchor: 'center'`
- Stored in `segmentPillMarkers` as `[{ marker, a, b }]` (segment endpoints needed for overlap resolution)
- After `map.fitBounds` animates, `map.once('moveend', resolveSegmentPillOverlaps)` nudges pills perpendicularly off the route to avoid overlap with stops and each other
- `resolveSegmentPillOverlaps` also fires on user-initiated zoom events (guarded by `e.originalEvent`); uses mobile-aware dimensions: `PILL_W = isMob ? 80 : 120`, `PILL_H = isMob ? 18 : 22`
- Mobile: pill font 10px, padding 3px 7px, svg 12×12px

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

## Bottom-right Controls

Both controls live in `.bottom-right-controls` — a `position: fixed; bottom: 20px; right: 20px` flex row. Hidden inside iframes via `window === window.top` guard (same as before).

### Route / Activities toggle (`.map-view-toggle`)

- Dark glass pill matching the view switcher style
- **Route** (default, `showActivities = false`): no activity pins shown
- **Activities** (`showActivities = true`): activity pins placed for the active day
- Desktop only — hidden on mobile via `display: none !important` in the mobile media query
- Buttons: `.map-view-btn` — 28px tall, `font-size: 12px`, transparent background, `rgba(255,255,255,0.14)` when active

### View switcher (`.view-switcher`)

- Desktop icon: navigates to `index.html`. Mobile icon: navigates to `frame.html`.
- Navigation uses a 220ms fade-out → navigate → fade-in pattern.
- Hidden inside iframes via `window === window.top` guard.

## Connector Line (`updateConnectorLine`)

The vertical teal dashed connector runs via `.itinerary-col::before`:
- `left: 25px`, `width: 2px`, `background: repeating-linear-gradient(...)` — 5px dash / 7px gap, `#00A79A`
- `top` and `height` driven by CSS custom properties `--line-top` / `--line-height`
- **Normal mode (dots visible):** measures from `.location-dot` center to last `.day-dot` center
- **Option 2 mode (day dots hidden):** `getComputedStyle(dayDots[0]).display === 'none'` → measures from `.location-dot` center (if visible) to bottom of last `.day-panel-wrap`; falls back to top of first card if start dot is also hidden
- Called on script load, `window resize`, `load`, `accordion-toggled` event, and after `applyMapMode` in `frame.html`
- Exposed as `window.appUpdateConnectorLine` for cross-frame access
- On desktop, `.connector-dots` spacer elements are hidden — the `::before` pseudo-element is the sole visual timeline

### Day dots (`.day-dot`)

- **Desktop** (`@media (min-width: 431px)`): `left: -60px; top: 60px` — centers dot on connector line, aligned vertically with the destination title
- **Mobile**: `left: 3px; top: 4px; width: 5px; height: 5px` — 5×5px dot, centered on connector line (page x≈29.5), positioned within `.day-panel-wrap` (which has `padding-top: 18px` to prevent margin collapse with `.day-panel`)
- Inactive: plain teal circle (11×11px desktop, 5×5px mobile)
- **Active state desktop** (`.day-dot.is-active`): `box-shadow: 0 0 0 9.5px #00A79A, 0 0 0 17.5px rgba(0,167,154,0.30)` — 30px inner / 46px outer halo
- **Active state mobile**: `box-shadow: 0 0 0 2.5px #00A79A, 0 0 0 5.5px rgba(0,167,154,0.30)` — expands 5px dot to match "Starts in Calgary" dot size: 2.5px solid ring → 10px total, 3px translucent ring → 16px total visual diameter
- Active class toggled by `updateDotStates(day)` inside `initScrollDetection` → `update()`, exactly in sync with map state change

## Mobile Preview (`frame.html`)

A self-contained device preview wrapper. Open at `http://localhost:3000/frame.html`.

### Structure

- Phone shell: dark `#1D1D1F`, 8px bezel padding, `border-radius: 52px`, 406px outer width
- Screen: 390×790px, `border-radius: 40px`, `overflow: hidden`
- Dynamic Island: 126×37px black pill, `top: 11px`, centered, `pointer-events: none`
- Status bar: white bg, 59px tall, dark time + icons, z-index 11 — overlaid as fixed chrome
- `#mobile-frame`: `top: 59px; height: 665px` — starts below status bar, no competing scroll container
- Safari bar: 44px, white bg, `bottom: 22px` — centered pill with lock icon + `travelalberta.com`
- Home strip: 22px, white bg, dark indicator pill — inside screen so bottom bezel matches top

### Map behaviour toggle (Option 1 / Option 2)

Both options are in `frame.html`'s `applyMapMode(mode, iframeDoc)` which injects a `<style id="map-mode-override">` into the iframe:

**Option 1 — Map Fixed (default, `data-mode="relative"`):**
- `.main-right { margin-bottom: 64px !important; }` — map scrolls with content
- Timeline, dots, and cards at normal mobile layout

**Option 2 — Map Sticky (`data-mode="sticky"`):**
- `.main-right { position: sticky !important; top: 0 !important; }` — map sticks at top
- `.day-dot { display: none !important }` — day dots hidden; start dot (`.location-dot`, `.location-start-dot`) remains visible
- Connector line runs from start dot center to bottom of last card (via `updateConnectorLine` dot-hidden branch)
- `.day-panel-wrap { margin-left: 0 !important; width: 100% !important }` — cards full width
- Compact card sizing: `day-panel-inner` padding 10px 14px, `day-label` 12px, `day-title` 18px, `day-body` 13px (2-line clamp), `carousel-img` 120px, `explore-activities` padding 8px 14px, `drive-pill` 12px
- After CSS injection, calls `win.appMap.resize()`, `win.appMap.fitBounds(...)`, and `win.appUpdateConnectorLine()`

### Desktop-only CSS (`styles.css` — `@media (min-width: 431px)`)

Overrides applied only on desktop (not affecting mobile):
- `.day-panel { border-radius: 0; }` — square card corners
- `.day-panel-wrap { margin-left: 80px; }` — cards 80px from column left
- `.day-dot { left: -60px; top: 60px; }` — dot on timeline, aligned with destination title
- `.drive-connector { padding-left: 80px; }` — drive pills align with card left edge
- `.connector-dots { display: none; }` — spacer hidden; timeline comes from `::before`
- `.location-start-dot { width: 60px; }` — "Starts in" text aligns at 80px
- `.explore-activities { margin-top: 16px; }` — 16px gap between carousel and explore bar
- `.activities-toggle svg { display: none; }` + `::after` — replaces chevron with `+`/`−`
- `.activity-title { font-weight: 500; }` — matches Figma "Demi" weight

### Mobile CSS (`styles.css` — `@media (max-width: 430px)`)

Key mobile-only rules:
- Timeline: `itinerary-section` left padding `8px` — moves connector line closer to screen edge; connector at `left: 21px` (page x=29), `width: 1.5px`, dash pattern 1px on / 6px gap
- Scrollbar hidden: `::-webkit-scrollbar { display: none }` + `scrollbar-width: none`
- Layout: single-column, map sticky at top (280px, full-width), itinerary below
- Day panel wrap: `margin-left: 16px; padding-top: 18px` — padding-top prevents CSS margin collapse (without it, `.day-panel`'s margin-top would collapse outward, placing the dot inside the card)
- Day dot: `left: 3px; top: 4px; width: 5px; height: 5px` — centered on connector line at page x≈29.5
- Day dot active: `box-shadow: 0 0 0 2.5px #00A79A, 0 0 0 5.5px rgba(0,167,154,0.30)` — matches "Starts in" dot size (16px total)
- Day panel: `border: none; overflow: visible` — no margin-top (wrap padding-top handles the gap)
- Day panel inner: `padding: 0`
- Drive connector: `padding: 28px 0 11px` — top 28px matches gap from previous section; bottom 11px positions next dot at 15px below drive pill (matching Figma)
- Explore activities: full-bleed with negative margins (`-24px` / `-26px`), transparent bg, bottom border via `background-image` gradient at 24px inset, `+`/`−` toggle via `::after`
- Nav collapses to logo only
- Map markers: `.map-city-pin` 22×22px, `.map-city-label` font 10px / padding 3px 7px, `.map-segment-pill` font 10px / padding 3px 7px / svg 12×12

### View switcher

Both `index.html` and `frame.html` have a matching small dark pill (bottom-right, `position: fixed`) with Desktop + Mobile icon buttons. Navigation uses a fade-out (220ms) → navigate → fade-in (220ms on load) pattern. The switcher is hidden inside iframes via `window === window.top` guard.

## Coding Conventions

- **No build tools.** Plain HTML + CSS + vanilla JS — no Sass, no bundler, no framework.
- **Pixel values from Figma are exact.** Absolute line-heights (e.g. `26.22px`) come directly from Figma's pixel measurements — do not convert to relative ratios without checking.
- **Logo is an image.** `images/logo-text.png` is the Figma export. The red background comes from `.nav-logo { background: #9C0F00 }` — do not bake the background into the image.
- **Nav bottom border** only covers `.nav-inner` (the links side), not the full nav width. This matches the Figma separator that starts after the logo block.
- **CSS custom properties** are defined in `:root` in `styles.css` — use them for all repeated values.
- **No comments** unless the why is non-obvious (hidden constraint, Figma quirk, etc.).
- **Mapbox/MapLibre compatibility:** all map library calls use the `mgl` alias (`const mgl = typeof mapboxgl !== 'undefined' ? mapboxgl : maplibregl`). CSS uses dual selectors for vendor-prefixed class names (`.maplibregl-*` and `.mapboxgl-*`).

## Next Steps

- [ ] Image carousel interaction (click nav-right button to cycle photos)
- [ ] Replace all placeholder images with real photography
- [ ] Sticky nav behaviour on scroll
- [ ] Mobile responsive breakpoints beyond 430px
