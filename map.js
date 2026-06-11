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
