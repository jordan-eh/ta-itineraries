const map = new maplibregl.Map({
  container: 'dynamic-map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [-116.5, 52.0],
  zoom: 5.8,
  attributionControl: false,
});

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
    pill: { time: '2 hr 57 min drive', dist: '287 km (178 mi)' },
  },
  {
    stops: [
      { name: 'Canmore', lnglat: [-115.3589, 51.0893] },
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
    ],
    route: [[-115.3589, 51.0893], [-114.0719, 51.0447]],
    bounds: [[-115.6, 51.0], [-113.7, 51.3]],
    pill: { time: '58 min drive', dist: '102 km (63 mi)' },
  },
  {
    stops: [
      { name: 'Calgary', lnglat: [-114.0719, 51.0447] },
    ],
    route: null,
    bounds: [[-114.5, 50.8], [-113.6, 51.4]],
    pill: null,
  },
  // Day 6 — Drumheller → Brooks → Medicine Hat
  {
    stops: [
      { name: 'Drumheller',  lnglat: [-112.7013, 51.4639] },
      { name: 'Brooks',      lnglat: [-111.8973, 50.5645] },
      { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
    ],
    route: [[-112.7013, 51.4639], [-111.8973, 50.5645], [-110.6768, 50.0405]],
    bounds: [[-113.0, 49.9], [-110.3, 51.7]],
    pill: { time: '2 hr 45 min drive', dist: '270 km (168 mi)' },
  },
  // Day 7 — Medicine Hat base (day trip to Cypress Hills, returns to Medicine Hat)
  {
    stops: [
      { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
    ],
    route: null,
    bounds: [[-111.2, 49.6], [-110.1, 50.5]],
    pill: null,
  },
  // Day 8 — Medicine Hat → Milk River → Lethbridge
  {
    stops: [
      { name: 'Medicine Hat', lnglat: [-110.6768, 50.0405] },
      { name: 'Milk River',   lnglat: [-112.0744, 49.1089] },
      { name: 'Lethbridge',   lnglat: [-112.8186, 49.6890] },
    ],
    route: [[-110.6768, 50.0405], [-112.0744, 49.1089], [-112.8186, 49.6890]],
    bounds: [[-113.2, 48.9], [-110.4, 50.3]],
    pill: { time: '2 hr 35 min drive', dist: '213 km (132 mi)' },
  },
  // Day 9 — Lethbridge → Waterton Lakes
  {
    stops: [
      { name: 'Lethbridge',    lnglat: [-112.8186, 49.6890] },
      { name: 'Waterton Lakes', lnglat: [-113.9023, 49.0510] },
    ],
    route: [[-112.8186, 49.6890], [-113.9023, 49.0510]],
    bounds: [[-114.2, 48.8], [-112.5, 49.9]],
    pill: { time: '1 hr drive', dist: '84 km (52 mi)' },
  },
  // Day 10 — Waterton → Crowsnest Pass
  {
    stops: [
      { name: 'Waterton Lakes', lnglat: [-113.9023, 49.0510] },
      { name: 'Crowsnest Pass', lnglat: [-114.4969, 49.6239] },
    ],
    route: [[-113.9023, 49.0510], [-114.4969, 49.6239]],
    bounds: [[-114.8, 48.9], [-113.6, 49.9]],
    pill: { time: '1 hr 25 min drive', dist: '118 km (73 mi)' },
  },
  // Day 11 — Fort Macleod → Longview → Calgary
  {
    stops: [
      { name: 'Fort Macleod', lnglat: [-113.4075, 49.7199] },
      { name: 'Longview',     lnglat: [-114.1742, 50.5314] },
      { name: 'Calgary',      lnglat: [-114.0719, 51.0447] },
    ],
    route: [[-113.4075, 49.7199], [-114.1742, 50.5314], [-114.0719, 51.0447]],
    bounds: [[-114.5, 49.5], [-113.2, 51.3]],
    pill: { time: '2 hr 32 min drive', dist: '229 km (142 mi)' },
  },
];

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

let overviewMarkers = [];
let dayMarkers = [];
let currentState = 'overview';
const pillEl = document.querySelector('.map-drive-pill');

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

  // ── Overview markers ──
  OVERVIEW_STOPS.forEach((stop, i) => {
    const m = new maplibregl.Marker({ element: makeMarkerEl(String(i + 1), '#00A79A', stop.name) })
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
      const el = makeMarkerEl(String(j + 1), color, stop.name);
      el.style.visibility = 'hidden';
      return new maplibregl.Marker({ element: el })
        .setLngLat(stop.lnglat)
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
  overviewMarkers.forEach(m => { m.getElement().style.visibility = isOverview ? 'visible' : 'hidden'; });
  dayMarkers.forEach((markers, i) => {
    const vis = i === dayIndex ? 'visible' : 'hidden';
    markers.forEach(m => { m.getElement().style.visibility = vis; });
  });

  // Camera — only if day data exists (days beyond DAYS array just keep last view)
  const dayData = isOverview ? null : DAYS[dayIndex];
  const bounds = isOverview ? OVERVIEW_BOUNDS : (dayData ? dayData.bounds : null);
  if (bounds) map.fitBounds(bounds, { padding: 60, duration: 900 });

  // Drive pill
  const pillData = isOverview ? null : (dayData ? dayData.pill : null);
  if (pillData) {
    pillEl.querySelector('.pill-time').textContent = pillData.time;
    pillEl.querySelector('.pill-dist').textContent = pillData.dist;
    pillEl.classList.remove('hidden');
  } else {
    pillEl.classList.add('hidden');
  }
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

  function update() {
    const day = getActiveDay();
    setState(day === 0 ? 'overview' : day);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });

  update();
}
