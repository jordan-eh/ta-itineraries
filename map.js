const map = new maplibregl.Map({
  container: 'dynamic-map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [-116.5, 52.0],
  zoom: 5.8,
  attributionControl: false,
});

map.scrollZoom.disable();

const OVERVIEW_BOUNDS = [[-118.5, 48.7], [-110.2, 53.2]];

const OVERVIEW_ROUTE = [
  [-114.0719, 51.0447],  // Calgary
  [-115.5708, 51.1784],  // Banff
  [-116.1773, 51.4254],  // Lake Louise
  [-117.2297, 52.2197],  // Columbia Icefield
  [-118.0814, 52.8737],  // Jasper
  [-115.3589, 51.0893],  // Canmore
  [-114.0719, 51.0447],  // Calgary
  [-112.7013, 51.4639],  // Drumheller
  [-111.8973, 50.5645],  // Brooks
  [-110.6768, 50.0405],  // Medicine Hat
  [-112.0744, 49.1089],  // Milk River
  [-112.8186, 49.6890],  // Lethbridge
  [-113.9023, 49.0510],  // Waterton Lakes
  [-114.4969, 49.6239],  // Crowsnest Pass
  [-113.4075, 49.7199],  // Fort Macleod
  [-114.1742, 50.5314],  // Longview
  [-114.0719, 51.0447],  // Calgary
];

const OVERVIEW_STOPS = [
  { name: 'Calgary',           lnglat: [-114.0719, 51.0447] },
  { name: 'Banff',             lnglat: [-115.5708, 51.1784] },
  { name: 'Lake Louise',       lnglat: [-116.1773, 51.4254] },
  { name: 'Columbia Icefield', lnglat: [-117.2297, 52.2197] },
  { name: 'Jasper',            lnglat: [-118.0814, 52.8737] },
  { name: 'Canmore',           lnglat: [-115.3589, 51.0893] },
  { name: 'Drumheller',        lnglat: [-112.7013, 51.4639] },
  { name: 'Brooks',            lnglat: [-111.8973, 50.5645] },
  { name: 'Medicine Hat',      lnglat: [-110.6768, 50.0405] },
  { name: 'Milk River',        lnglat: [-112.0744, 49.1089] },
  { name: 'Lethbridge',        lnglat: [-112.8186, 49.6890] },
  { name: 'Waterton Lakes',    lnglat: [-113.9023, 49.0510] },
  { name: 'Crowsnest Pass',    lnglat: [-114.4969, 49.6239] },
  { name: 'Fort Macleod',      lnglat: [-113.4075, 49.7199] },
  { name: 'Longview',          lnglat: [-114.1742, 50.5314] },
];

const DAYS = [
  {
    stops: [
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
      { name: 'Banff',   lnglat: [-115.5708, 51.1784] },
    ],
    route: [[-114.0719, 51.0447], [-115.5708, 51.1784]],
    bounds: [[-115.9, 50.95], [-113.8, 51.35]],
    segments: [
      { time: '1 hr 23 min', dist: '127 km (79 mi)' },
    ],
  },
  {
    stops: [
      { name: 'Lake Louise',       lnglat: [-116.1773, 51.4254] },
      { name: 'Columbia Icefield', lnglat: [-117.2297, 52.2197] },
      { name: 'Jasper',            lnglat: [-118.0814, 52.8737] },
    ],
    route: [[-116.1773, 51.4254], [-117.2297, 52.2197], [-118.0814, 52.8737]],
    bounds: [[-118.4, 51.2], [-115.8, 53.0]],
    approachFrom: { lnglat: [-115.5708, 51.1784], seg: { time: '38 min', dist: '57.1 km (35.4 mi)' } },
    segments: [
      { time: '1 hr 20 min', dist: '126 km (78 mi)' },
      { time: '1 hr 10 min', dist: '103 km (64 mi)' },
    ],
  },
  {
    stops: [
      { name: 'Jasper',  lnglat: [-118.0814, 52.8737] },
      { name: 'Canmore', lnglat: [-115.3589, 51.0893] },
    ],
    route: [[-118.0814, 52.8737], [-115.3589, 51.0893]],
    bounds: [[-118.4, 50.9], [-115.0, 53.1]],
    segments: [
      { time: '2 hr 57 min', dist: '287 km (178 mi)' },
    ],
  },
  {
    stops: [
      { name: 'Canmore', lnglat: [-115.3589, 51.0893] },
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
    ],
    route: [[-115.3589, 51.0893], [-114.0719, 51.0447]],
    bounds: [[-115.6, 51.0], [-113.7, 51.3]],
    segments: [
      { time: '58 min', dist: '102 km (63 mi)' },
    ],
  },
  {
    stops: [
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
    ],
    route: null,
    bounds: [[-114.5, 50.8], [-113.6, 51.4]],
    segments: [],
  },
  // Day 6 — Drumheller → Brooks → Medicine Hat
  {
    stops: [
      { name: 'Drumheller',   lnglat: [-112.7013, 51.4639] },
      { name: 'Brooks',       lnglat: [-111.8973, 50.5645] },
      { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
    ],
    route: [[-112.7013, 51.4639], [-111.8973, 50.5645], [-110.6768, 50.0405]],
    bounds: [[-113.1, 49.8], [-110.3, 51.7]],
    approachFrom: { lnglat: [-114.0719, 51.0447], seg: { time: '1 hr 30 min', dist: '139 km (86 mi)' } },
    segments: [
      { time: '55 min', dist: '88 km (55 mi)' },
      { time: '1 hr 45 min', dist: '180 km (112 mi)' },
    ],
  },
  // Day 7 — Medicine Hat base (day trip to Cypress Hills, returns to Medicine Hat)
  {
    stops: [
      { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
    ],
    route: null,
    bounds: [[-111.2, 49.6], [-110.1, 50.5]],
    segments: [],
  },
  // Day 8 — Medicine Hat → Milk River → Lethbridge
  {
    stops: [
      { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
      { name: 'Milk River',   lnglat: [-112.0744, 49.1089] },
      { name: 'Lethbridge',   lnglat: [-112.8186, 49.6890] },
    ],
    route: [[-110.6768, 50.0405], [-112.0744, 49.1089], [-112.8186, 49.6890]],
    bounds: [[-113.15, 48.85], [-110.35, 50.3]],
    segments: [
      { time: '1 hr 35 min', dist: '157 km (98 mi)' },
      { time: '55 min', dist: '85 km (53 mi)' },
    ],
  },
  // Day 9 — Lethbridge → Waterton Lakes
  {
    stops: [
      { name: 'Lethbridge',    lnglat: [-112.8186, 49.6890] },
      { name: 'Waterton Lakes', lnglat: [-113.9023, 49.0510] },
    ],
    route: [[-112.8186, 49.6890], [-113.9023, 49.0510]],
    bounds: [[-114.2, 48.8], [-112.5, 49.9]],
    segments: [
      { time: '1 hr', dist: '84 km (52 mi)' },
    ],
  },
  // Day 10 — Waterton → Crowsnest Pass
  {
    stops: [
      { name: 'Waterton Lakes', lnglat: [-113.9023, 49.0510] },
      { name: 'Crowsnest Pass', lnglat: [-114.4969, 49.6239] },
    ],
    route: [[-113.9023, 49.0510], [-114.4969, 49.6239]],
    bounds: [[-114.8, 48.9], [-113.6, 49.9]],
    segments: [
      { time: '1 hr 25 min', dist: '118 km (73 mi)' },
    ],
  },
  // Day 11 — Fort Macleod → Longview → Calgary
  {
    stops: [
      { name: 'Fort Macleod', lnglat: [-113.4075, 49.7199] },
      { name: 'Longview',     lnglat: [-114.1742, 50.5314] },
      { name: 'Calgary',      lnglat: [-114.0719, 51.0447] },
    ],
    route: [[-113.4075, 49.7199], [-114.1742, 50.5314], [-114.0719, 51.0447]],
    bounds: [[-114.6, 49.45], [-113.1, 51.2]],
    approachFrom: { lnglat: [-114.4969, 49.6239], seg: { time: '1 hr 25 min', dist: '118 km (73 mi)' } },
    segments: [
      { time: '1 hr', dist: '96 km (60 mi)' },
      { time: '1 hr 30 min', dist: '130 km (81 mi)' },
    ],
  },
];

const ACTIVITIES = [
  // Day 1 — Banff
  [
    { name: 'Banff National Park',          lnglat: [-115.5708, 51.1784] },
    { name: 'Mt Norquay Via Ferrata',       lnglat: [-115.5920, 51.2066] },
    { name: 'Lake Minnewanka Cruise',       lnglat: [-115.4060, 51.2260] },
    { name: 'Trail Ride – Banff',           lnglat: [-115.5600, 51.1750] },
    { name: 'Fairmont Banff Springs',       lnglat: [-115.5680, 51.1620] },
  ],
  // Day 2 — Lake Louise / Icefield Pkwy / Jasper
  [
    { name: 'Fairmont Chateau Lake Louise', lnglat: [-116.1780, 51.4254] },
    { name: 'Glacier SkyWalk',              lnglat: [-117.2000, 52.1960] },
    { name: 'Columbia Icefield Adventure',  lnglat: [-117.2297, 52.2197] },
    { name: 'Fairmont Jasper Park Lodge',   lnglat: [-118.0628, 52.8793] },
    { name: 'Jasper Planetarium',           lnglat: [-118.0900, 52.8680] },
  ],
  // Day 3 — Jasper and Canmore
  [
    { name: 'Maligne Lake Cruise',          lnglat: [-117.6309, 52.6713] },
    { name: 'Jasper SkyTram',               lnglat: [-118.1074, 52.8831] },
    { name: 'Drive to Canmore',             lnglat: [-115.3589, 51.0893] },
  ],
  // Day 4 — Canmore and Calgary
  [
    { name: 'Canmore Cave Tours',           lnglat: [-115.3589, 51.0893] },
    { name: 'Carter-Ryan Gallery',          lnglat: [-115.3540, 51.0870] },
    { name: 'Yamnuska Wolfdog Sanctuary',   lnglat: [-115.0492, 51.1241] },
    { name: 'Canada Olympic Park',          lnglat: [-114.1830, 51.0868] },
    { name: 'Calgary East Village',         lnglat: [-114.0519, 51.0480] },
  ],
  // Day 5 — Calgary
  [
    { name: 'Heritage Park',                lnglat: [-114.1275, 50.9858] },
    { name: 'Calgary Food Tour',            lnglat: [-114.0680, 51.0445] },
    { name: 'Calgary Tower',                lnglat: [-114.0625, 51.0432] },
  ],
  // Day 6 — Southern Alberta
  [
    { name: 'Drumheller Hoodoos',           lnglat: [-112.6813, 51.4530] },
    { name: 'Royal Tyrrell Museum',         lnglat: [-112.8009, 51.4783] },
    { name: 'Dinosaur Provincial Park',     lnglat: [-111.4865, 50.7726] },
    { name: 'Medicine Hat',                 lnglat: [-110.6768, 50.0405] },
  ],
  // Day 7 — Medicine Hat
  [
    { name: 'Saamis Teepee',                lnglat: [-110.6768, 50.0405] },
    { name: 'Medalta Potteries',            lnglat: [-110.6920, 50.0300] },
    { name: 'Cypress Hills Park',           lnglat: [-110.0058, 49.6117] },
    { name: "Hell's Basement Brewery",      lnglat: [-110.6800, 50.0450] },
  ],
  // Day 8 — Writing-on-Stone and Lethbridge
  [
    { name: 'Writing-on-Stone Park',        lnglat: [-111.6199, 49.0766] },
    { name: 'Fort Whoop-Up',                lnglat: [-112.8362, 49.6928] },
    { name: 'Galt Museum',                  lnglat: [-112.8186, 49.6890] },
    { name: 'Nikka Yuko Garden',            lnglat: [-112.8320, 49.6980] },
  ],
  // Day 9 — Waterton Lakes
  [
    { name: 'Waterton Townsite',            lnglat: [-113.9023, 49.0510] },
    { name: 'Alpine Stables',               lnglat: [-113.8890, 49.0620] },
    { name: 'Prince of Wales Hotel',        lnglat: [-113.9170, 49.0552] },
    { name: 'Cameron Lake',                 lnglat: [-113.9997, 48.9775] },
    { name: 'Shoreline Cruise',             lnglat: [-113.9023, 49.0560] },
  ],
  // Day 10 — Southern Rockies
  [
    { name: 'Red Rock Canyon',              lnglat: [-113.9300, 49.0310] },
    { name: 'Crowsnest Pass',               lnglat: [-114.4969, 49.6239] },
    { name: 'Bellevue Mine',                lnglat: [-114.3660, 49.5780] },
    { name: 'Frank Slide',                  lnglat: [-114.4162, 49.6021] },
  ],
  // Day 11 — Southern Alberta to Calgary
  [
    { name: 'Head-Smashed-In Buffalo Jump', lnglat: [-113.6396, 49.7193] },
    { name: 'Bar U Ranch',                  lnglat: [-114.1960, 50.5180] },
    { name: 'Eau Claire Distillery',        lnglat: [-114.1220, 50.3620] },
  ],
];

function screenPerp(a, b) {
  const dlng = b[0] - a[0];
  const dlat = b[1] - a[1];
  const len = Math.sqrt(dlng * dlng + dlat * dlat) || 1;
  return [-dlat / len, -dlng / len]; // left-of-travel in screen space
}

function makeSegmentPillEl(time, dist) {
  const pill = document.createElement('div');
  pill.className = 'map-segment-pill';
  const km = dist.replace(/ \(.*\)/, '');
  pill.innerHTML =
    '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M11.6671 2.66667C12.107 2.66667 12.4802 2.94659 12.6136 3.33981L13.9267 7.11974C13.9734 7.25974 14.0003 7.41321 14.0003 7.55987V12.3329C14.0003 12.8863 13.5465 13.3333 12.9999 13.3333C12.4468 13.3331 12.0005 12.8794 12.0005 12.3329V11.9995H4.00052V12.3329C4.00052 12.8861 3.55428 13.3331 3.00117 13.3333C2.44785 13.3333 2.00078 12.8863 2.00078 12.3329V7.55987C2.00078 7.40654 2.02764 7.25974 2.0743 7.11974L3.38744 3.33981C3.52748 2.94659 3.89408 2.66669 4.33398 2.66667H11.6671ZM4.33398 8C3.78083 8.00002 3.33382 8.44625 3.33359 8.99935C3.33359 9.55265 3.78069 9.99972 4.33398 9.99974C4.88729 9.99974 5.33437 9.55267 5.33437 8.99935C5.33414 8.44623 4.88715 8 4.33398 8ZM11.6671 8C11.1139 8.00002 10.6669 8.44624 10.6667 8.99935C10.6667 9.55265 11.1138 9.99972 11.6671 9.99974C12.2204 9.99974 12.6674 9.55267 12.6674 8.99935C12.6672 8.44623 12.2202 8 11.6671 8ZM4.8145 3.66706C4.52795 3.66706 4.27413 3.85312 4.18071 4.11961L3.33359 6.66615H12.6674L11.8203 4.11961C11.727 3.85327 11.4739 3.66726 11.1876 3.66706H4.8145Z" fill="#69727A"/>' +
    '</svg>' +
    `<span class="seg-time">${time}</span><span class="seg-dist">${km}</span>`;
  return pill;
}

function resolveSegmentPillOverlaps() {
  if (!segmentPillMarkers.length) return;
  const PILL_W = 120, PILL_H = 22, PAD = 4, STEP = 10, MAX = 8;
  const dayIdx = typeof currentState === 'number' ? currentState - 1 : -1;

  const stops = (dayIdx >= 0 ? dayMarkers[dayIdx] || [] : [])
    .filter(m => m.getElement().style.visibility !== 'hidden')
    .map(m => ({ p: map.project(m.getLngLat()), hw: 18, hh: 18 }));

  const pills = segmentPillMarkers.map(({ marker, a, b }) => ({
    marker,
    base: map.project(marker.getLngLat()),
    perp: screenPerp(a, b),
    t: 0,
  }));

  function hits(pill) {
    const cx = pill.base.x + pill.perp[0] * pill.t;
    const cy = pill.base.y + pill.perp[1] * pill.t;
    for (const s of stops) {
      if (Math.abs(cx - s.p.x) < PILL_W / 2 + s.hw + PAD &&
          Math.abs(cy - s.p.y) < PILL_H / 2 + s.hh + PAD) return true;
    }
    for (const o of pills) {
      if (o === pill) continue;
      const ox = o.base.x + o.perp[0] * o.t;
      const oy = o.base.y + o.perp[1] * o.t;
      if (Math.abs(cx - ox) < PILL_W + PAD && Math.abs(cy - oy) < PILL_H + PAD) return true;
    }
    return false;
  }

  pills.forEach(pill => {
    if (!hits(pill)) return;
    // Try both perpendicular directions, pick whichever needs fewer steps
    let posSteps = MAX + 1, negSteps = MAX + 1;
    for (let s = 1; s <= MAX; s++) { pill.t = s * STEP; if (!hits(pill)) { posSteps = s; break; } }
    for (let s = 1; s <= MAX; s++) { pill.t = -s * STEP; if (!hits(pill)) { negSteps = s; break; } }
    if (posSteps <= negSteps && posSteps <= MAX) pill.t = posSteps * STEP;
    else if (negSteps <= MAX) pill.t = -negSteps * STEP;
    else pill.t = 0;
  });

  pills.forEach(({ marker, perp, t }) => marker.setOffset([perp[0] * t, perp[1] * t]));
}

function makeSmallMarkerEl(color) {
  const dot = document.createElement('div');
  dot.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};` +
    'border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);cursor:default;';
  return dot;
}

function makeMarkerEl(label, color, name) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';

  const pin = document.createElement('div');
  pin.style.cssText = 'width:32px;height:32px;border-radius:50%;border:3px solid #fff;' +
    `background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.3);` +
    'display:flex;align-items:center;justify-content:center;' +
    "color:#fff;font-size:12px;font-weight:700;font-family:'Outfit',sans-serif;cursor:default;";
  pin.textContent = label;
  wrapper.appendChild(pin);

  if (name) {
    const namePill = document.createElement('div');
    namePill.style.cssText = 'background:#fff;border:1px solid #E2E8ED;border-radius:100px;' +
      'padding:5px 12px;font-size:12px;font-weight:500;white-space:nowrap;' +
      "box-shadow:0 2px 8px rgba(0,0,0,0.12);font-family:'Futura PT',Futura,'Century Gothic',sans-serif;color:#000;";
    namePill.textContent = name;
    wrapper.appendChild(namePill);
  }

  return wrapper;
}

const OVERVIEW_STOPS_OPT1 = [
  { name: 'Calgary',      lnglat: [-114.0719, 51.0447] },
  { name: 'Jasper',       lnglat: [-118.0814, 52.8737] },
  { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
];

function makeActivityMarkerEl(name) {
  const wrap = document.createElement('div');
  wrap.className = 'activity-pin';
  wrap.innerHTML =
    '<div class="activity-pin-dot"></div>' +
    '<div class="activity-pin-label">' + name + '</div>';
  return wrap;
}

let overviewMarkersOpt1 = [];
let overviewMarkersOpt2 = [];
let dayMarkers = [];
let segmentPillMarkers = [];
let approachPinMarkers = [];
let activityMarkers = [];
let showActivities = false;
let currentState = 'overview';
let activeOverviewOption = 2;
const destPillEl = document.querySelector('.map-destinations-pill');

map.on('load', () => {
  // Remove bottom controls (logo + attribution)
  ['maplibregl-ctrl-bottom-left', 'maplibregl-ctrl-bottom-right'].forEach(cls => {
    const el = map.getContainer().querySelector('.' + cls);
    if (el) el.remove();
  });
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

  // ── Overview markers — Option 1 (3 full featured pins + small dots for the rest) ──
  OVERVIEW_STOPS.forEach((stop) => {
    const featuredIdx = OVERVIEW_STOPS_OPT1.findIndex(s => s.name === stop.name);
    const el = featuredIdx === 0
      ? makeMarkerEl('1', '#00A79A', stop.name)
      : featuredIdx > 0
        ? makeMarkerEl('', '#00A79A', stop.name)
        : makeSmallMarkerEl('#00A79A');
    el.style.visibility = 'hidden';
    const m = new maplibregl.Marker({ element: el })
      .setLngLat(stop.lnglat)
      .setPopup(new maplibregl.Popup({ offset: 20 }).setText(stop.name))
      .addTo(map);
    overviewMarkersOpt1.push(m);
  });

  // ── Overview markers — Option 2 (Calgary pin + small dots for all stops) ──
  OVERVIEW_STOPS.forEach((stop, i) => {
    const el = i === 0
      ? makeMarkerEl('', '#00A79A', stop.name)
      : makeSmallMarkerEl('#00A79A');
    el.style.visibility = 'visible';
    const m = new maplibregl.Marker({ element: el })
      .setLngLat(stop.lnglat)
      .setPopup(new maplibregl.Popup({ offset: 20 }).setText(stop.name))
      .addTo(map);
    overviewMarkersOpt2.push(m);
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

  // ── Approach route layers (dashed connector from previous day's last stop) ──
  DAYS.forEach((day, i) => {
    if (!day.approachFrom) return;
    map.addSource(`approach-day-${i + 1}`, {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [day.approachFrom.lnglat, day.stops[0].lnglat] } },
    });
    map.addLayer({
      id: `layer-approach-day-${i + 1}`,
      type: 'line',
      source: `approach-day-${i + 1}`,
      layout: { 'line-join': 'round', 'line-cap': 'round', visibility: 'none' },
      paint: { 'line-color': '#9C0F00', 'line-width': 2, 'line-dasharray': [2, 3], 'line-opacity': 0.5 },
    });
  });

  // ── Per-day markers (hidden initially) ──
  DAYS.forEach((day, i) => {
    const markers = day.stops.map((stop, j) => {
      const color = j === 0 ? '#9C0F00' : '#00A79A';
      const el = makeMarkerEl(String(j + 1), color, stop.name);
      el.style.visibility = 'hidden';
      return new maplibregl.Marker({ element: el })
        .setLngLat(stop.lnglat)
        .addTo(map);
    });
    dayMarkers.push(markers);
  });

  destPillEl.querySelector('.dest-count').textContent = OVERVIEW_STOPS.length;
  destPillEl.classList.remove('hidden');

  // fitBounds on initial load — setState skips this because currentState is already 'overview'
  map.fitBounds(OVERVIEW_BOUNDS, { padding: 60, duration: 0 });

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
  DAYS.forEach((day, i) => {
    if (!day.approachFrom) return;
    map.setLayoutProperty(`layer-approach-day-${i + 1}`, 'visibility', i === dayIndex ? 'visible' : 'none');
  });

  // Marker visibility
  const activeOverview = activeOverviewOption === 1 ? overviewMarkersOpt1 : overviewMarkersOpt2;
  const inactiveOverview = activeOverviewOption === 1 ? overviewMarkersOpt2 : overviewMarkersOpt1;
  activeOverview.forEach(m => { m.getElement().style.visibility = isOverview ? 'visible' : 'hidden'; });
  inactiveOverview.forEach(m => { m.getElement().style.visibility = 'hidden'; });
  dayMarkers.forEach((markers, i) => {
    const vis = i === dayIndex ? 'visible' : 'hidden';
    markers.forEach(m => { m.getElement().style.visibility = vis; });
  });

  // Camera — only if day data exists (days beyond DAYS array just keep last view)
  const dayData = isOverview ? null : DAYS[dayIndex];
  const bounds = isOverview ? OVERVIEW_BOUNDS : (dayData ? dayData.bounds : null);
  if (bounds) map.fitBounds(bounds, { padding: 60, duration: 900 });

  // Approach origin pin (small teal dot at previous day's last location)
  approachPinMarkers.forEach(m => m.remove());
  approachPinMarkers = [];
  if (!isOverview && dayData && dayData.approachFrom) {
    approachPinMarkers.push(
      new maplibregl.Marker({ element: makeSmallMarkerEl('#00A79A') })
        .setLngLat(dayData.approachFrom.lnglat).addTo(map)
    );
  }

  // Segment pills — remove previous, place new ones on the route line, resolve overlaps after animation
  segmentPillMarkers.forEach(({ marker }) => marker.remove());
  segmentPillMarkers = [];
  if (!isOverview && dayData) {
    const addPill = (a, b, time, dist) => {
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const marker = new maplibregl.Marker({ element: makeSegmentPillEl(time, dist), anchor: 'center' })
        .setLngLat(mid).addTo(map);
      segmentPillMarkers.push({ marker, a, b });
    };
    dayData.segments.forEach((seg, i) => addPill(dayData.stops[i].lnglat, dayData.stops[i + 1].lnglat, seg.time, seg.dist));
    map.once('moveend', resolveSegmentPillOverlaps);
  }

  // Destinations pill (overview only)
  if (isOverview) {
    destPillEl.classList.remove('hidden');
  } else {
    destPillEl.classList.add('hidden');
  }

  setActivityMarkers(isOverview ? 0 : newState);
}

function setActivityMarkers(day) {
  activityMarkers.forEach(m => m.remove());
  activityMarkers = [];
  if (!showActivities || day < 1) return;
  (ACTIVITIES[day - 1] || []).forEach(act => {
    const el = makeActivityMarkerEl(act.name);
    activityMarkers.push(
      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(act.lnglat).addTo(map)
    );
  });
}

function initScrollDetection() {
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

  const dayDotEls = Array.from(document.querySelectorAll('.day-dot'));
  let lastActiveDotDay = 0;

  function updateDotStates(day) {
    if (day === lastActiveDotDay) return;
    dayDotEls.forEach((dot, i) => dot.classList.toggle('is-active', i + 1 === day));
    lastActiveDotDay = day;
  }

  function update() {
    const day = getActiveDay();
    setState(day === 0 ? 'overview' : day);
    updateDotStates(day);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });

  update();
}

document.querySelectorAll('.map-option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const opt = parseInt(btn.dataset.option, 10);
    if (opt === activeOverviewOption) return;
    activeOverviewOption = opt;
    document.querySelectorAll('.map-option-btn').forEach(b => b.classList.toggle('active', b === btn));
    if (currentState === 'overview') {
      const next = opt === 1 ? overviewMarkersOpt1 : overviewMarkersOpt2;
      const prev = opt === 1 ? overviewMarkersOpt2 : overviewMarkersOpt1;
      prev.forEach(m => { m.getElement().style.visibility = 'hidden'; });
      next.forEach(m => { m.getElement().style.visibility = 'visible'; });
    }
  });
});

function updateConnectorLine() {
  const col = document.querySelector('.itinerary-col');
  const startDot = document.querySelector('.location-dot');
  const dayDots = document.querySelectorAll('.day-dot');
  if (!col || !startDot || !dayDots.length) return;

  const lastDot = dayDots[dayDots.length - 1];
  const colRect = col.getBoundingClientRect();
  const startRect = startDot.getBoundingClientRect();
  const endRect = lastDot.getBoundingClientRect();

  const lineTop = startRect.top + startRect.height / 2 - colRect.top;
  const lineEnd = endRect.top + endRect.height / 2 - colRect.top;

  col.style.setProperty('--line-top', lineTop + 'px');
  col.style.setProperty('--line-height', (lineEnd - lineTop) + 'px');
}

updateConnectorLine();
window.addEventListener('load', updateConnectorLine);
window.addEventListener('resize', updateConnectorLine);

document.querySelectorAll('.map-view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const activating = btn.dataset.view === 'activities';
    if (activating === showActivities) return;
    showActivities = activating;
    document.querySelectorAll('.map-view-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    const day = typeof currentState === 'number' ? currentState : 0;
    setActivityMarkers(day);
  });
});
