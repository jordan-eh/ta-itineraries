# Dynamic Map Component — Design Spec

**Date:** 2026-06-10  
**Project:** TA Itineraries (`jordan-eh/ta-itineraries`)  
**Live site:** https://jordan-eh.github.io/ta-itineraries/

---

## Overview

Replace the two static SVG map placeholders (intro section right column + sticky itinerary map column) with a single dynamic MapLibre GL JS map component. The map is always fixed to the right side of the viewport, shows a full Alberta route overview by default, and transitions smoothly to a day-focused state as the user scrolls through each day card.

---

## Map Library

**MapLibre GL JS** (open-source fork of Mapbox GL JS v1) + **OpenFreeMap** vector tiles.

- No API key required
- Vector tiles — crisp on retina at all zoom levels
- GL-smooth `flyToBounds()` animations
- Near-identical API to Mapbox GL JS — swap to a real Mapbox token with a one-line change
- Loaded via CDN in `index.html`

CDN URLs:
```html
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
```

Tile style: `https://tiles.openfreemap.org/styles/liberty`

---

## Layout

The map is `position: fixed` at all times. Both existing map columns become transparent spacers (same width, no visible content) to keep the left-column text from stretching into the map area.

```css
#dynamic-map {
  position: fixed;
  right: 112px;       /* matches --content-pad, aligns to content grid */
  top: 100px;         /* clears 100px nav */
  width: 524px;
  height: calc(100vh - 120px);
  border-radius: 24px;
  overflow: hidden;
  z-index: 10;
}
```

**Visibility:** the map is hidden (`opacity: 0; pointer-events: none`) by default and fades in when the intro section scrolls into view. It fades back out in two cases: when the user scrolls above the intro section (back toward the hero/nav), or when the "Discover more" section enters the viewport (below the last day card). This ensures the map never floats over unrelated page content.

---

## Destinations

Coordinates for all stops:

| Stop | Lat | Lng |
|---|---|---|
| Calgary | 51.0447 | −114.0719 |
| Banff | 51.1784 | −115.5708 |
| Lake Louise | 51.4254 | −116.1773 |
| Columbia Icefield | 52.2197 | −117.2297 |
| Jasper | 52.8737 | −118.0814 |
| Canmore | 51.0893 | −115.3589 |

---

## Map States

### Overview state

Active when the viewport is above the first day card (user is in the intro / "At a glance" area).

- All 5 numbered pins visible: Calgary (1), Banff (2), Lake Louise (3), Jasper (4), Canmore (5)
- Dotted route line connecting all stops in sequence
- Camera fitted to show the entire Alberta route

### Day-focused state

Active when a day card is scrolled into view. All other-day pins and route segments are hidden.

| Day | Pins | Route segment | Drive pill |
|---|---|---|---|
| Day 1 — Banff | Calgary, Banff | Calgary → Banff | Match existing `.drive-pill` value |
| Day 2 — Lake Louise, Icefields, Jasper | Lake Louise, Columbia Icefield, Jasper | Lake Louise → Jasper via Icefields Parkway | Match existing `.drive-pill` value |
| Day 3 — Jasper + Canmore | Jasper, Canmore | Jasper → Canmore | Match existing `.drive-pill` value |
| Day 4 — Canmore + Calgary | Canmore, Calgary | Canmore → Calgary | Match existing `.drive-pill` value |
| Day 5 — Calgary | Calgary | — | — |

The **drive pill** is a floating overlay rendered inside the map container, styled to match the existing `.drive-pill` elements. It is positioned mid-route on the map surface and hidden for Day 5 (no drive segment).

---

## Transitions

When a new day state activates:

1. Previous day's pins and route layer fade out (`opacity` transition, ~200ms)
2. New day's pins and route layer fade in (~200ms)
3. `map.flyToBounds(dayBounds, { padding: 60, duration: 900 })` — GL-smooth camera pan + zoom
4. Drive pill content updates with the new day's time and distance

Total perceived transition: ~1.1s, smooth and non-jarring.

---

## Scroll Detection

A single `IntersectionObserver` watches all `.day-panel` elements.

- `rootMargin`: `-40% 0px -40% 0px` — triggers when a panel crosses the vertical midpoint of the viewport
- On enter: transition map to that day's state
- On exit (direction = up): transition map to the previous day's state (or overview if above Day 1)
- Scroll direction is tracked by comparing the panel's `boundingClientRect.top` to the viewport midpoint at time of intersection

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | Remove SVG content from intro right column and `.map-col`; both become spacers. Add `<div id="dynamic-map">` as a fixed element (appended to `<body>`). Add `data-day="1"` through `data-day="5"` to each `.day-panel`. Add MapLibre CDN links in `<head>`. Add `<script src="map.js">` before `</body>`. |
| `styles.css` | Add `#dynamic-map` fixed positioning rules. Add `.map-col` and `.intro-right` spacer styles (remove existing map-specific styles no longer needed). Add `.map-drive-pill` overlay style. Add `#dynamic-map.hidden` for opacity fade. |
| `map.js` | New file. MapLibre map init, day data (coordinates + route segments + drive pill text), `IntersectionObserver` setup, state transition functions. |
| `CLAUDE.md` | Update File Structure table (add `map.js`). Update Page Sections §4 to describe dynamic map. Add "Dynamic Map" section with state table and library details. Remove static map references. |

---

## Out of Scope

- Mobile/responsive layout (separate work item)
- Map expand modal
- Real photography replacing placeholder content
- Clicking a pin to open an activity detail panel
