/* ============================================================================
 * Designer-Notes — Stage gate (Travel Alberta styled)
 * ----------------------------------------------------------------------------
 * Blocks the page until a reviewer enters their NAME + the shared PASSWORD.
 * The name is stored locally and becomes the author on every comment they
 * leave (see comments.js → getGateUser()). Password is only asked once per
 * browser; after that, returning reviewers just confirm their name.
 *
 * Loaded FIRST, in <head>, so content stays hidden until authenticated.
 * Deep links with ?chrome=off skip the gate (for screenshots / clean views).
 * ==========================================================================*/
(function() {
  var GATE_PASSWORD = 'travelalberta';
  var GATE_STORAGE_KEY = 'ta-gate-auth';
  var GATE_NAME_KEY = 'ta-gate-user';   // MUST match comments.js GATE_NAME_KEY

  // ?logout — clear saved auth so the gate shows again (handy for demos)
  if (new URLSearchParams(window.location.search).get('logout') !== null) {
    localStorage.removeItem(GATE_STORAGE_KEY);
    localStorage.removeItem(GATE_NAME_KEY);
    try {
      var clean = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', clean);
    } catch (e) {}
  }

  // Access logging — POSTs to the ta-dn-proxy Worker, which appends the entry
  // (server-timestamped) to the access log in Cloudflare KV. Set API_BASE to the
  // deployed Worker URL (no trailing slash); '' disables logging.
  var API_BASE = 'https://ta-dn-proxy.andrewturnbull.workers.dev';

  function logAccess(user) {
    if (!API_BASE || API_BASE.indexOf('__') === 0 || !user) return;
    var page = location.pathname.split('/').pop().split('?')[0] || 'index';
    fetch(API_BASE + '/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: user, page: page })
    }).catch(function() {});
  }

  // Skip the gate for clean deep links (e.g. screenshots) — still log the visit
  if (new URLSearchParams(window.location.search).get('chrome') === 'off') {
    logAccess('Anonymous');
    return;
  }

  // Already authenticated this browser — log and let the page through
  if (localStorage.getItem(GATE_STORAGE_KEY) === GATE_PASSWORD && localStorage.getItem(GATE_NAME_KEY)) {
    logAccess(localStorage.getItem(GATE_NAME_KEY));
    return;
  }

  // Hide page content until authenticated (restored on DOM ready)
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.style.visibility = '';

    var hasPassword = localStorage.getItem(GATE_STORAGE_KEY) === GATE_PASSWORD;
    var nameOnly = hasPassword && !localStorage.getItem(GATE_NAME_KEY);

    // --- Scoped styles (Travel Alberta palette: red #9C0F00, teal #00A79A,
    //     mint #E6F7F5, navy #073142; Outfit/Futura type) ---
    var style = document.createElement('style');
    style.textContent = [
      '.tadn-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;',
      '  background:radial-gradient(circle at 50% 20%, #0b4257 0%, #073142 60%, #052531 100%);',
      "  font-family:'Outfit','Futura PT',Futura,'Century Gothic','Trebuchet MS',sans-serif;}",
      '.tadn-card{width:100%;max-width:360px;background:#fff;border-radius:16px;padding:36px 32px 32px;',
      '  box-shadow:0 24px 60px rgba(5,37,49,.45);text-align:left;box-sizing:border-box;animation:tadn-rise .35s cubic-bezier(.22,1,.36,1) both;}',
      '@keyframes tadn-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
      '.tadn-eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#00A79A;margin:0 0 10px;}',
      '.tadn-title{font-size:1.55rem;font-weight:700;color:#073142;margin:0 0 22px;line-height:1.15;}',
      '.tadn-field{display:block;font-size:.7rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#69727A;margin:0 0 6px;}',
      '.tadn-input{width:100%;padding:11px 13px;border:1.5px solid #E2E8ED;border-radius:9px;font-size:.95rem;',
      '  font-family:inherit;color:#073142;outline:none;box-sizing:border-box;margin-bottom:16px;background:#fff;transition:border-color .15s,box-shadow .15s;}',
      '.tadn-input::placeholder{color:#b3bcc2;}',
      '.tadn-input:focus{border-color:#00A79A;box-shadow:0 0 0 3px rgba(0,167,154,.15);}',
      '.tadn-btn{width:100%;padding:12px;border:none;border-radius:9px;background:#9C0F00;color:#fff;',
      '  font-size:.95rem;font-weight:600;font-family:inherit;letter-spacing:.01em;cursor:pointer;transition:background .15s,transform .05s;}',
      '.tadn-btn:hover{background:#7d0c00;}',
      '.tadn-btn:active{transform:translateY(1px);}',
      '.tadn-err{font-size:.75rem;color:#9C0F00;margin:-6px 0 12px;min-height:1em;opacity:0;transition:opacity .15s;}',
      '.tadn-err.show{opacity:1;}'
    ].join('');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'tadn-gate';

    overlay.innerHTML =
      '<div class="tadn-card">' +
        '<p class="tadn-eyebrow">Travel Alberta &middot; Itinerary Review</p>' +
        '<h1 class="tadn-title">' + (nameOnly ? 'Welcome back' : 'Sign in to review') + '</h1>' +
        '<label class="tadn-field" for="tadn-name">First name</label>' +
        '<input id="tadn-name" class="tadn-input" type="text" placeholder="e.g. Jordan" autocomplete="given-name">' +
        (nameOnly ? '' :
          '<label class="tadn-field" for="tadn-pass">Password</label>' +
          '<input id="tadn-pass" class="tadn-input" type="password" placeholder="Password" autocomplete="current-password">') +
        '<div class="tadn-err" id="tadn-err">Enter your first name and the correct password.</div>' +
        '<button class="tadn-btn" id="tadn-go">Continue</button>' +
      '</div>';

    document.body.appendChild(overlay);

    var nameInput = overlay.querySelector('#tadn-name');
    var passInput = overlay.querySelector('#tadn-pass');
    var errEl = overlay.querySelector('#tadn-err');
    var goBtn = overlay.querySelector('#tadn-go');

    nameInput.focus();

    function showError() {
      errEl.classList.add('show');
      setTimeout(function() { errEl.classList.remove('show'); }, 2400);
    }

    function trySubmit() {
      var name = nameInput.value.trim();
      var pass = nameOnly ? GATE_PASSWORD : (passInput ? passInput.value : '');
      if (name && pass === GATE_PASSWORD) {
        localStorage.setItem(GATE_NAME_KEY, name);
        localStorage.setItem(GATE_STORAGE_KEY, GATE_PASSWORD);
        overlay.parentNode.removeChild(overlay);
        logAccess(name);
      } else {
        showError();
      }
    }

    goBtn.addEventListener('click', trySubmit);
    if (nameOnly) {
      nameInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') trySubmit(); });
    } else {
      nameInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); passInput.focus(); } });
      passInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') trySubmit(); });
    }
  });
})();
