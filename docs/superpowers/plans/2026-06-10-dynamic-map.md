# Dynamic Map Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace both static SVG map placeholders with a single MapLibre GL JS map that is fixed to the right side of the viewport, shows a full Alberta route overview by default, and smoothly transitions to per-day pin + route views as the user scrolls through day cards.

**Architecture:** A single `<div id="dynamic-map">` is `position: fixed` at all times. The former map columns in the intro section and itinerary section become transparent spacers that maintain their width in the flex layout. Scroll detection uses a throttled `scroll` event that measures each `.day-panel`'s position relative to a 40%-from-top trigger line.

**Tech Stack:** MapLibre GL JS 4.7.1 (CDN), OpenFreeMap liberty vector tiles (no API key), vanilla JS in `map.js`

---

> **Note on testing:** This is a DOM/visual project with no test framework. Each task ends with a browser verification step instead of a unit test. Start the dev server with `node server.js` and keep it running throughout (`http://localhost:3000`).

---

### Task 1: Strip static SVG content from HTML + add `#dynamic-map` scaffold

**Files:**
- Modify: `index.html`

The two existing map containers (`.intro-map > .map-bg` and `.sticky-map > .map-bg`) are stripped of all SVG/label/button content. Their container divs remain as spacers. A new `<div id="dynamic-map">` (containing the drive-pill overlay) is added just before `</body>`. MapLibre CDN links are added to `<head>`.

- [ ] **Step 1: Add MapLibre CDN to `<head>`**

In `index.html`, after `<link rel="stylesheet" href="styles.css">` (line 10), add:

```html
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
```

- [ ] **Step 2: Remove intro map SVG content**

Replace the entire `.intro-map` div contents (the `<div class="map-bg">` block that contains the SVG, city labels, and expand button) with nothing — leaving `.intro-map` as an empty spacer:

```html
    <div class="intro-map"></div>
```

The containing `<div class="intro-right">` stays.

- [ ] **Step 3: Remove sticky map SVG content**

Replace the entire `.sticky-map > .map-bg` block (SVG, city labels, time badge divs) with an empty `.sticky-map`:

```html
      <div class="sticky-map"></div>
```

The `.map-col > .sticky-map-wrap` wrappers stay.

- [ ] **Step 4: Add `#dynamic-map` with drive-pill before `</body>`**

Just before `<script src="main.js"></script>`, add:

```html
<div id="dynamic-map" class="hidden">
  <div class="map-drive-pill hidden">
    <svg width="16" height="12" viewBox="0 0 20 14" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 10V7l2-5h14l2 5v3"/>
      <rect x="0" y="9" width="20" height="4" rx="1.5"/>
      <circle cx="4.5" cy="13.5" r="1.5"/>
      <circle cx="15.5" cy="13.5" r="1.5"/>
    </svg>
    <span class="pill-time"></span>
    <span class="pill-dist dist"></span>
  </div>
</div>
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
```

- [ ] **Step 5: Add `map.js` script tag**

After `<script src="main.js"></script>`, add:

```html
<script src="map.js"></script>
```

- [ ] **Step 6: Verify in browser**

Open `http://localhost:3000`. Confirm:
- No console errors
- The intro section right column is empty (no SVG terrain)
- The itinerary map column is empty
- A `div#dynamic-map` exists in the DOM (inspect → Elements)

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: scaffold dynamic map — strip static SVGs, add #dynamic-map div"
```

---

### Task 2: CSS — fixed map positioning, spacer columns, drive-pill overlay

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add `#dynamic-map` fixed positioning after the existing `.expand-map-btn` rule**

In `styles.css`, find the `.expand-map-btn` block (ends around line 315). Add after it:

```css
    /* ── Dynamic map (fixed panel) ── */
    #dynamic-map {
      position: fixed;
      right: 112px;
      top: 100px;
      width: 524px;
      height: calc(100vh - 120px);
      border-radius: 24px;
      overflow: hidden;
      z-index: 10;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    #dynamic-map.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .map-drive-pill {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 500;
      font-family: var(--font);
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      z-index: 1;
      opacity: 1;
      transition: opacity 0.2s ease;
    }

    .map-drive-pill.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .map-drive-pill .dist {
      color: var(--gray);
      font-weight: 400;
    }
```

- [ ] **Step 2: Convert `.intro-map` to a spacer**

Find the `.intro-map` rule (around line 228). Replace it with:

```css
    .intro-map {
      width: 524px;
      height: calc(100vh - 120px);
    }
```

- [ ] **Step 3: Replace `.sticky-map-wrap` / `.sticky-map` / `.sticky-map .map-bg` with a spacer**

Find the sticky map rules (around line 633). Replace:

```css
    .sticky-map-wrap {
      position: sticky;
      top: 20px;
    }

    .sticky-map {
      width: 524px;
      height: 753px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .sticky-map .map-bg {
      width: 100%;
      height: 100%;
    }
```

with:

```css
    .sticky-map-wrap {
      width: 524px;
      height: calc(100vh - 120px);
    }
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000`. Confirm:
- Page layout is correct — left text column and right spacer column sit side by side in both sections
- No stray map SVG is visible anywhere
- The `#dynamic-map` div is invisible (has `.hidden` class) — verify via DevTools

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "feat: css for fixed dynamic map panel and spacer columns"
```

---

### Task 3: Create `map.js` — MapLibre init + overview state + visibility

**Files:**
- Create: `map.js`

- [ ] **Step 1: Create `map.js` with init, stops data, and overview state**

```javascript
const map = new maplibregl.Map({
  container: 'dynamic-map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [-116.5, 52.0],
  zoom: 5.8,
  attributionControl: false,
});

map.addControl(new maplibregl.AttributionControl({ compact: true }));
map.scrollZoom.disable();

const OVERVIEW_BOUNDS = [[-118.5, 50.8], [-113.7, 53.2]];

const OVERVIEW_ROUTE = [
  [-114.0719, 51.0447],
  [-115.5708, 51.1784],
  [-116.1773, 51.4254],
  [-117.2297, 52.2197],
  [-118.0814, 52.8737],
  [-115.3589, 51.0893],
  [-114.0719, 51.0447],
];

const OVERVIEW_STOPS = [
  { name: 'Calgary',           lnglat: [-114.0719, 51.0447] },
  { name: 'Banff',             lnglat: [-115.5708, 51.1784] },
  { name: 'Lake Louise',       lnglat: [-116.1773, 51.4254] },
  { name: 'Jasper',            lnglat: [-118.0814, 52.8737] },
  { name: 'Canmore',           lnglat: [-115.3589, 51.0893] },
];

const DAYS = [
  {
    stops: [
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
      { name: 'Banff',   lnglat: [-115.5708, 51.1784] },
    ],
    route: [[-114.0719, 51.0447], [-115.5708, 51.1784]],
    bounds: [[-116.1, 51.0], [-113.7, 51.5]],
    pill: { time: '1 hr 23 min drive', dist: '127 km (79 mi)' },
  },
  {
    stops: [
      { name: 'Lake Louise',       lnglat: [-116.1773, 51.4254] },
      { name: 'Columbia Icefield', lnglat: [-117.2297, 52.2197] },
      { name: 'Jasper',            lnglat: [-118.0814, 52.8737] },
    ],
    route: [[-116.1773, 51.4254], [-117.2297, 52.2197], [-118.0814, 52.8737]],
    bounds: [[-118.4, 51.1], [-115.9, 53.1]],
    pill: { time: '38 min drive', dist: '57.1 km (35.4 mi)' },
  },
  {
    stops: [
      { name: 'Jasper',  lnglat: [-118.0814, 52.8737] },
      { name: 'Canmore', lnglat: [-115.3589, 51.0893] },
    ],
    route: [[-118.0814, 52.8737], [-115.3589, 51.0893]],
    bounds: [[-118.4, 50.9], [-115.0, 53.1]],
    pill: { time: '1 hr 23 min drive', dist: '127 km (79 mi)' },
  },
  {
    stops: [
      { name: 'Canmore', lnglat: [-115.3589, 51.0893] },
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
    ],
    route: [[-115.3589, 51.0893], [-114.0719, 51.0447]],
    bounds: [[-115.6, 51.0], [-113.7, 51.3]],
    pill: { time: '1 hr 23 min drive', dist: '127 km (79 mi)' },
  },
  {
    stops: [
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
    ],
    route: null,
    bounds: [[-114.5, 50.8], [-113.6, 51.4]],
    pill: null,
  },
];

function makeMarkerEl(label, color) {
  const el = document.createElement('div');
  el.style.cssText = 'width:32px;height:32px;border-radius:50%;border:3px solid #fff;' +
    `background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.3);` +
    'display:flex;align-items:center;justify-content:center;' +
    "color:#fff;font-size:12px;font-weight:700;font-family:'Outfit',sans-serif;cursor:default;";
  el.textContent = label;
  return el;
}

let overviewMarkers = [];
let dayMarkers = [];
let currentState = 'overview';

map.on('load', () => {
  // ── Overview route layer ──
  map.addSource('route-overview', {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: OVERVIEW_ROUTE } },
  });
  map.addLayer({
    id: 'layer-route-overview',
    type: 'line',
    source: 'route-overview',
    layout: { 'line-join': 'round', 'line-cap': 'round', visibility: 'visible' },
    paint: { 'line-color': '#9C0F00', 'line-width': 3, 'line-dasharray': [2, 3] },
  });

  // ── Overview markers ──
  OVERVIEW_STOPS.forEach((stop, i) => {
    const m = new maplibregl.Marker({ element: makeMarkerEl(String(i + 1), '#00A79A') })
      .setLngLat(stop.lnglat)
      .setPopup(new maplibregl.Popup({ offset: 20 }).setText(stop.name))
      .addTo(map);
    overviewMarkers.push(m);
  });

  // ── Per-day route layers ──
  DAYS.forEach((day, i) => {
    if (!day.route) return;
    map.addSource(`route-day-${i + 1}`, {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: day.route } },
    });
    map.addLayer({
      id: `layer-route-day-${i + 1}`,
      type: 'line',
      source: `route-day-${i + 1}`,
      layout: { 'line-join': 'round', 'line-cap': 'round', visibility: 'none' },
      paint: { 'line-color': '#9C0F00', 'line-width': 3 },
    });
  });

  // ── Per-day markers (hidden initially) ──
  DAYS.forEach((day, i) => {
    const markers = day.stops.map((stop, j) => {
      const color = j === 0 ? '#9C0F00' : '#00A79A';
      const el = makeMarkerEl(String(j + 1), color);
      el.style.display = 'none';
      return new maplibregl.Marker({ element: el })
        .setLngLat(stop.lnglat)
        .setPopup(new maplibregl.Popup({ offset: 20 }).setText(stop.name))
        .addTo(map);
    });
    dayMarkers.push(markers);
  });

  initScrollDetection();
});

function setState(newState) {
  if (newState === currentState) return;
  currentState = newState;

  const isOverview = newState === 'overview';
  const dayIndex = isOverview ? -1 : newState - 1;

  // Route layer visibility
  map.setLayoutProperty('layer-route-overview', 'visibility', isOverview ? 'visible' : 'none');
  DAYS.forEach((day, i) => {
    if (!day.route) return;
    map.setLayoutProperty(`layer-route-day-${i + 1}`, 'visibility', i === dayIndex ? 'visible' : 'none');
  });

  // Marker visibility
  overviewMarkers.forEach(m => { m.getElement().style.display = isOverview ? 'flex' : 'none'; });
  dayMarkers.forEach((markers, i) => {
    markers.forEach(m => { m.getElement().style.display = i === dayIndex ? 'flex' : 'none'; });
  });

  // Camera
  const bounds = isOverview ? OVERVIEW_BOUNDS : DAYS[dayIndex].bounds;
  map.fitBounds(bounds, { padding: 60, duration: 900 });

  // Drive pill
  const pill = document.querySelector('.map-drive-pill');
  const pillData = isOverview ? null : DAYS[dayIndex].pill;
  if (pillData) {
    pill.querySelector('.pill-time').textContent = pillData.time;
    pill.querySelector('.pill-dist').textContent = pillData.dist;
    pill.classList.remove('hidden');
  } else {
    pill.classList.add('hidden');
  }
}

function initScrollDetection() {
  const mapEl = document.getElementById('dynamic-map');
  const introSection = document.querySelector('.intro-section');
  const discoverSection = document.querySelector('.discover-more-section');
  const TRIGGER = 0.4;

  function getActiveDay() {
    const triggerY = window.innerHeight * TRIGGER;
    const panels = document.querySelectorAll('.day-panel[data-day]');
    let active = 0;
    panels.forEach(panel => {
      const rect = panel.getBoundingClientRect();
      if (rect.top <= triggerY && rect.bottom > 0) {
        active = parseInt(panel.dataset.day, 10);
      }
    });
    return active;
  }

  function updateVisibility() {
    const introBottom = introSection.getBoundingClientRect().bottom;
    const discoverTop = discoverSection.getBoundingClientRect().top;
    const visible = introBottom > 0 && discoverTop > window.innerHeight * 0.1;
    mapEl.classList.toggle('hidden', !visible);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateVisibility();
      const day = getActiveDay();
      setState(day === 0 ? 'overview' : day);
      ticking = false;
    });
  }, { passive: true });

  updateVisibility();
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000`. Confirm:
- Map tiles load (Alberta terrain visible)
- In the intro section: 5 numbered teal pins are visible on the overview, dotted red route line connects Calgary → Banff → Lake Louise → Jasper → Canmore → Calgary
- Map is hidden when in the nav/hero area (scroll back to very top)

- [ ] **Step 3: Commit**

```bash
git add map.js
git commit -m "feat: map.js — MapLibre init, overview state, scroll visibility"
```

---

### Task 4: Add `data-day` attributes to day panels

**Files:**
- Modify: `index.html`

The `initScrollDetection()` function in `map.js` queries `.day-panel[data-day]`. Without the attributes, scroll detection does nothing.

- [ ] **Step 1: Add `data-day` to each of the 5 day panel divs**

Find each `<div class="day-panel">` (lines 221, 359, 469, 555, 665) and add the `data-day` attribute:

```html
<!-- Day 1 -->
<div class="day-panel" data-day="1">

<!-- Day 2 -->
<div class="day-panel" data-day="2">

<!-- Day 3 -->
<div class="day-panel" data-day="3">

<!-- Day 4 -->
<div class="day-panel" data-day="4">

<!-- Day 5 -->
<div class="day-panel" data-day="5">
```

- [ ] **Step 2: Verify in browser**

Scroll down slowly through the day cards. Confirm:
- When Day 1 card reaches 40% from the top of the viewport, the map transitions: overview pins disappear, two pins appear (Calgary red, Banff teal), route line shows Calgary → Banff only, drive pill shows "1 hr 23 min drive · 127 km (79 mi)"
- Each subsequent day card triggers a smooth `flyToBounds` transition
- Scrolling back up reverses to the previous day, and scrolling above Day 1 restores the overview state
- Map fades out when the "Discover more" section comes into view

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add data-day attributes to day panels for scroll detection"
```

---

### Task 5: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update File Structure table**

Replace the `main.js` row entry and add `map.js`:

Find this row in the table:
```markdown
| `main.js` | Accordion toggle — 3-line click listener, toggles `is-open` on `.explore-activities` |
```

Replace with:
```markdown
| `main.js` | Accordion toggle — 3-line click listener, toggles `is-open` on `.explore-activities` |
| `map.js` | Dynamic map — MapLibre GL JS init, per-day state data, scroll detection, `setState()` transitions |
```

- [ ] **Step 2: Update Page Sections §4 description**

Find the Map + Itinerary section description and replace it with:

```markdown
4. **Map + Itinerary** — 2-col at 112px padding. Left (611px): "Starts in Calgary" → drive connectors → 5 day panels. Each day panel has an accordion "Explore activities (N)" drawer. Day 1 starts open; Days 2–5 start collapsed. Right (524px): transparent spacer — the actual map is `#dynamic-map` (`position: fixed; right: 112px; top: 100px; width: 524px; height: calc(100vh - 120px)`). Section margin-bottom 120px. Drive connectors: 7 dots (gap 11px), padding 20px top/bottom, min-height 120px.
```

- [ ] **Step 3: Add Dynamic Map section after Accordion Behaviour**

After the `## Accordion Behaviour` section, add:

```markdown
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
| Day 3 | Jasper → Canmore | 1 hr 23 min · 127 km |
| Day 4 | Canmore → Calgary | 1 hr 23 min · 127 km |
| Day 5 | Calgary | — |
```

- [ ] **Step 4: Update Next Steps — remove map placeholder items**

In the `## Next Steps` section, the map expand modal item may still be listed. Remove it (already replaced by this feature). Leave the remaining items:

```markdown
## Next Steps

- [ ] Image carousel interaction (click nav-right button to cycle photos)
- [ ] Replace all placeholder images/colors with real photography
- [ ] Sticky nav behaviour on scroll
- [ ] Mobile/responsive breakpoints
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for dynamic map implementation"
```

---

### Task 6: Push and verify on GitHub Pages

**Files:** none (git operation only)

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

- [ ] **Step 2: Verify live site**

Open `https://jordan-eh.github.io/ta-itineraries/` (hard refresh: Cmd+Shift+R on Mac).

Confirm end-to-end:
1. On load — map shows Alberta overview with 5 numbered pins + dotted route
2. Scroll into intro section — map is visible and fixed to the right
3. Scroll map hidden above intro / below discover section
4. Day 1 card at 40% viewport — map flies to Calgary + Banff, pill shows "1 hr 23 min drive"
5. Day 2 — flies to Lake Louise / Icefields / Jasper corridor
6. Day 3 — flies to Jasper + Canmore span
7. Day 4 — flies to Canmore + Calgary
8. Day 5 — flies to Calgary only, no drive pill
9. Scroll back up — each day reverses correctly, overview restores when above Day 1
10. "Discover more" section entering view — map fades out
