(function() {
  'use strict';

  // === Constants ===
  // Comments sync through the ta-dn-proxy Cloudflare Worker, which stores them in
  // Cloudflare KV — so there's NO GitHub token anywhere (repo or browser). The
  // Worker exposes GET/PUT /comments and POST /log.
  // Set API_BASE to the deployed Worker URL (no trailing slash); '' disables sync.
  var API_BASE = 'https://ta-dn-proxy.andrewturnbull.workers.dev';

  var GATE_PASSWORD = 'travelalberta';
  var GATE_STORAGE_KEY = 'ta-gate-auth';
  var GATE_NAME_KEY = 'ta-gate-user';   // MUST match gate.js GATE_NAME_KEY

  // Single comment type (no type dropdown). Colour drives pin/badge styling.
  // Designer-notes blue — intentionally distinct from the TA site palette.
  var COMMENT_TYPES = {
    'Comment': '#3b82f6'
  };
  var DEFAULT_TYPE = 'Comment';
  var lastUsedType = DEFAULT_TYPE;

  // Desktop and the mobile frame are the same page rendered two ways. Each keeps
  // its own comment set (so pins don't bleed between views), but BOTH appear as
  // pages in the side panel. They share one comments.md, keyed by PAGE_ID.
  var _isFramed = false;
  try { _isFramed = window.self !== window.top; } catch (e) { _isFramed = true; }
  var _baseId = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
  var PAGE_ID = _isFramed ? _baseId + '-mobile' : _baseId;

  var PAGE_LABELS = {};
  PAGE_LABELS[_baseId] = 'Desktop';
  PAGE_LABELS[_baseId + '-mobile'] = 'Mobile';
  var PAGE_ORDER = [_baseId, _baseId + '-mobile'];

  // === State ===
  var comments = [];       // all comments across all pages
  var commentMode = false;
  var pinsVisible = true;  // show/hide comment pins
  var pureViewMode = false; // Cmd+. hides all chrome
  var editingComment = null;
  var panelOpen = false;
  var panelWasOpened = false;

  // === CSS Injection ===
  var style = document.createElement('style');
  style.textContent = [
    /* --- Comment mode cursor --- */
    'body.pc-comment-mode, body.pc-comment-mode * { cursor: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'22\' height=\'22\' viewBox=\'0 0 22 22\'%3E%3Cline x1=\'11\' y1=\'3\' x2=\'11\' y2=\'19\' stroke=\'%23374151\' stroke-width=\'1.5\'/%3E%3Cline x1=\'3\' y1=\'11\' x2=\'19\' y2=\'11\' stroke=\'%23374151\' stroke-width=\'1.5\'/%3E%3C/svg%3E") 11 11, crosshair !important; }',
    'body.pc-comment-mode .pc-pin, body.pc-comment-mode .pc-pin *, body.pc-comment-mode .pc-panel, body.pc-comment-mode .pc-panel *, body.pc-comment-mode .pc-popover, body.pc-comment-mode .pc-popover *, body.pc-comment-mode .pc-toggle, body.pc-comment-mode .pc-toggle *, body.pc-comment-mode #demo-menu-btn, body.pc-comment-mode #demo-menu-btn *, body.pc-comment-mode #demo-menu, body.pc-comment-mode #demo-menu * { cursor: default !important; }',

    /* --- Pins --- */
    '.pc-pin {',
    '  position: absolute; width: 28px; height: 28px; border-radius: 50%;',
    '  display: flex; align-items: center; justify-content: center;',
    '  color: #fff; font-size: 12px; font-weight: 600; font-family: system-ui, sans-serif;',
    '  box-shadow: 0 2px 6px rgba(0,0,0,.25); cursor: pointer;',
    '  z-index: 9900; transition: transform 0.15s ease; user-select: none;',
    '  pointer-events: auto;',
    '}',
    '.pc-pin:hover { transform: scale(1.1); }',
    '.pc-pin.pc-pin-active { filter: brightness(0.85); box-shadow: 0 0 0 3px rgba(255,255,255,.8), 0 2px 6px rgba(0,0,0,.25); }',
    '.pc-pin.pc-pin-dragging { transform: scale(1.15); cursor: grabbing !important; }',
    '.pc-pin.pc-pin-detached { background: #9ca3af !important; border: 2px dashed #6b7280; }',
    '.pc-pin-pulse { animation: pc-pulse 0.3s ease 2; }',
    '@keyframes pc-pulse { 50% { transform: scale(1.3); } }',

    /* --- Pin overlay wrapper (makes pins position relative to element) --- */
    '.pc-pin-overlay {',
    '  position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
    '  pointer-events: none; z-index: 9899;',
    '}',

    /* --- Popover (ported from staging/index.html .dn-popover-* → .pc-popover-*) --- */
    '.pc-popover {',
    '  --pc-brand: #3b82f6;',
    '  --pc-brand-hover: #2563eb;',
    '  --pc-danger: #ef4444;',
    '  --pc-danger-hover: #dc2626;',
    '  --pc-text: #0f172a;',
    '  --pc-text-secondary: #475569;',
    '  --pc-text-muted: #94a3b8;',
    '  --pc-text-faint: #cbd5e1;',
    '  --pc-bg: #f8fafc;',
    '  --pc-bg-subtle: #f1f5f9;',
    '  --pc-bg-tinted: #e2e8f0;',
    '  --pc-bg-hover: #dbeafe;',
    '  --pc-border: #cbd5e1;',
    '  --pc-border-light: #e2e8f0;',
    '  --pc-font-xs: 11px;',
    '  --pc-font-sm: 12px;',
    '  --pc-font-base: 13px;',
    '  --pc-font-lg: 15px;',
    '  box-sizing: border-box;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
    '  line-height: 1.4;',
    '  -webkit-font-smoothing: antialiased;',
    '}',
    '.pc-popover {',
    '  position: fixed;',
    '  background: var(--pc-bg);',
    '  border-radius: 10px;',
    '  box-shadow: 0 8px 30px rgba(0,0,0,.15), 0 2px 6px rgba(0,0,0,.1);',
    '  width: 360px;',
    '  z-index: 10200;',
    '  transform-origin: top left;',
    '}',
    '.pc-popover.pc-popover-enter { animation: pc-popover-in .2s cubic-bezier(0.25,1,0.5,1) forwards; }',
    '.pc-popover.pc-popover-exit { animation: pc-popover-out .15s cubic-bezier(0.5,0,0.75,0) forwards; }',
    '@keyframes pc-popover-in { 0% { opacity: 0; transform: scale(.95) translateY(4px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }',
    '@keyframes pc-popover-out { 0% { opacity: 1; transform: scale(1) translateY(0); } 100% { opacity: 0; transform: scale(.97) translateY(2px); } }',
    '@media(prefers-reduced-motion: reduce) { .pc-popover.pc-popover-enter, .pc-popover.pc-popover-exit { animation: none; } }',

    '/* Comment type colours */',
    '.pc-popover { --pc-type-color: var(--pc-brand); }',
    '.pc-popover[data-type="UX Note"] { --pc-type-color: #3b82f6; }',
    '.pc-popover[data-type="Question"] { --pc-type-color: #a855f7; }',
    '.pc-popover[data-type="Tech Requirement"] { --pc-type-color: #22c55e; }',
    '.pc-popover[data-type="Change Request"] { --pc-type-color: #ef4444; }',
    '.pc-popover[data-type="Meeting Note"] { --pc-type-color: #f97316; }',

    '/* Header */',
    '.pc-popover-header {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  padding: 8px 8px 8px 12px;',
    '  background: var(--pc-bg-tinted);',
    '  border-bottom: 1px solid var(--pc-border-light);',
    '  border-radius: 10px 10px 0 0;',
    '}',
    '.pc-popover-badge {',
    '  width: 22px;',
    '  height: 22px;',
    '  border-radius: 50%;',
    '  background: var(--pc-type-color);',
    '  color: #fff;',
    '  font-size: 11px;',
    '  font-weight: 700;',
    '  font-family: monospace;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex-shrink: 0;',
    '  line-height: 1;',
    '}',

    '/* Custom type dropdown trigger */',
    '.pc-type-trigger {',
    '  position: relative;',
    '  box-sizing: border-box;',
    '  height: 28px;',
    '  font-size: 11px;',
    '  font-weight: 600;',
    '  font-family: inherit;',
    '  color: var(--pc-text-secondary);',
    '  background: #fff;',
    '  border: 1px solid var(--pc-border);',
    '  border-radius: 4px;',
    '  padding: 0 18px 0 6px;',
    '  cursor: pointer;',
    '  transition: border-color .15s, color .15s;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 5px;',
    '  white-space: nowrap;',
    '  user-select: none;',
    '  min-width: 0;',
    '}',
    '.pc-type-trigger::after {',
    '  content: "";',
    '  position: absolute;',
    '  right: 5px;',
    '  top: 50%;',
    '  transform: translateY(-50%);',
    '  width: 0;',
    '  height: 0;',
    '  border-left: 3.5px solid transparent;',
    '  border-right: 3.5px solid transparent;',
    '  border-top: 4px solid var(--pc-text-muted);',
    '}',
    '.pc-type-trigger:hover { border-color: var(--pc-text-muted); color: var(--pc-text); }',
    '.pc-type-trigger .pc-type-chip {',
    '  width: 8px;',
    '  height: 8px;',
    '  border-radius: 50%;',
    '  flex-shrink: 0;',
    '}',

    '/* Custom type dropdown menu */',
    '.pc-type-menu {',
    '  display: none;',
    '  position: absolute;',
    '  top: calc(100% + 4px);',
    '  left: 0;',
    '  background: #fff;',
    '  border: 1px solid var(--pc-border);',
    '  border-radius: 8px;',
    '  box-shadow: 0 4px 16px rgba(0,0,0,.12);',
    '  padding: 4px;',
    '  z-index: 10210;',
    '  min-width: 160px;',
    '}',
    '.pc-type-menu.pc-type-menu-open {',
    '  display: block;',
    '  animation: pc-menu-in .15s cubic-bezier(0.25,1,0.5,1) forwards;',
    '}',
    '@keyframes pc-menu-in { 0% { opacity: 0; transform: scale(.95) translateY(-4px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }',
    '.pc-type-option {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  width: 100%;',
    '  padding: 6px 10px;',
    '  border: none;',
    '  background: none;',
    '  border-radius: 6px;',
    '  font-size: var(--pc-font-base);',
    '  font-weight: 500;',
    '  font-family: inherit;',
    '  color: var(--pc-text);',
    '  cursor: pointer;',
    '  transition: background .15s;',
    '  text-align: left;',
    '  white-space: nowrap;',
    '}',
    '.pc-type-option:hover { background: var(--pc-bg-hover); }',
    '.pc-type-option.pc-type-selected { background: var(--pc-bg-subtle); }',
    '.pc-type-option .pc-type-chip {',
    '  width: 10px;',
    '  height: 10px;',
    '  border-radius: 50%;',
    '  flex-shrink: 0;',
    '}',

    '/* Header toolbar */',
    '.pc-popover-actions {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 2px;',
    '  margin-left: auto;',
    '  flex-shrink: 0;',
    '}',
    '.pc-popover-toolbar-divider {',
    '  width: 1px;',
    '  height: 16px;',
    '  background: var(--pc-border);',
    '  margin: 0 2px;',
    '}',
    '.pc-popover-header-btn {',
    '  width: 28px;',
    '  height: 28px;',
    '  border-radius: 6px;',
    '  border: none;',
    '  background: transparent;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  color: var(--pc-text-muted);',
    '  transition: background .15s, color .15s;',
    '}',
    '.pc-popover-header-btn:hover { background: var(--pc-bg-hover); color: var(--pc-text); }',
    '.pc-popover-header-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }',
    '.pc-popover-header-btn.pc-popover-close-btn svg { width: 18px; height: 18px; stroke-width: 2.5; }',
    '.pc-popover-header-btn.pc-popover-delete-btn:hover { background: #fef2f2; color: var(--pc-danger); }',

    '/* Body */',
    '.pc-popover-body { padding: 0; position: relative; }',
    '.pc-popover-read-text {',
    '  padding: 8px 12px 10px;',
    '  font-size: 14px;',
    '  color: var(--pc-text);',
    '  line-height: 1.5;',
    '  word-wrap: break-word;',
    '  min-height: calc(14px * 1.5 * 2 + 18px);',
    '}',
    '.pc-popover-read-text strong { font-weight: 600; }',
    '.pc-popover-read-text em { font-style: italic; }',
    '.pc-popover-read-text ul { margin: 4px 0; padding-left: 20px; list-style: disc; }',
    '.pc-popover-read-text li { margin: 2px 0; }',
    '.pc-popover-read-empty {',
    '  color: var(--pc-text-faint);',
    '  font-style: italic;',
    '}',
    '.pc-popover-textarea {',
    '  width: 100%;',
    '  min-height: calc(14px * 1.5 * 2 + 16px);',
    '  border: none;',
    '  border-radius: 0;',
    '  padding: 8px 12px;',
    '  font-size: 14px;',
    '  font-family: inherit;',
    '  color: var(--pc-text);',
    '  caret-color: var(--pc-text);',
    '  resize: none;',
    '  outline: none;',
    '  background: transparent;',
    '  position: relative;',
    '  z-index: 1;',
    '  overflow: hidden;',
    '  line-height: 1.5;',
    '  box-sizing: border-box;',
    '}',
    '.pc-popover-textarea:focus, .pc-popover-textarea:focus-visible { outline: none !important; }',
    '.pc-popover-textarea::placeholder { color: var(--pc-text-faint); }',

    '/* Edit footer (submit) */',
    '.pc-popover-edit-footer {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 6px 8px;',
    '  border-top: 1px solid var(--pc-border-light);',
    '  background: var(--pc-bg-subtle);',
    '  border-radius: 0 0 10px 10px;',
    '}',
    '.pc-popover-edit-secondary {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 2px;',
    '}',
    '.pc-popover-submit {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 8px;',
    '  border: none;',
    '  background: var(--pc-type-color);',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  color: #fff;',
    '  transition: background .15s;',
    '}',
    '.pc-popover-submit:hover { filter: brightness(.9); }',
    '.pc-popover-submit svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }',

    '/* Read footer (author + timestamp) */',
    '.pc-popover-read-footer {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0;',
    '  padding: 6px 12px;',
    '  border-top: 1px solid var(--pc-border-light);',
    '  background: var(--pc-bg-subtle);',
    '  border-radius: 0 0 10px 10px;',
    '  font-size: 11px;',
    '  color: var(--pc-text-muted);',
    '}',
    '.pc-popover-author {',
    '  font-weight: 600;',
    '  color: var(--pc-text-secondary);',
    '}',
    '.pc-popover-footer-sep {',
    '  margin: 0 6px;',
    '  color: var(--pc-border);',
    '}',

    /* --- Side Panel --- */
    '.pc-panel {',
    '  --pc-brand: #3b82f6;',
    '  --pc-text: #0f172a;',
    '  --pc-text-secondary: #475569;',
    '  --pc-text-muted: #94a3b8;',
    '  --pc-text-faint: #cbd5e1;',
    '  --pc-bg: #f8fafc;',
    '  --pc-bg-subtle: #f1f5f9;',
    '  --pc-bg-tinted: #e2e8f0;',
    '  --pc-bg-hover: #dbeafe;',
    '  --pc-border: #cbd5e1;',
    '  --pc-border-light: #e2e8f0;',
    '  --pc-font-xs: 11px;',
    '  --pc-font-sm: 12px;',
    '  --pc-font-base: 13px;',
    '  position: fixed; top: 0; right: 0; width: 360px; height: 100vh;',
    '  background: #fff; box-shadow: -4px 0 20px rgba(0,0,0,.1);',
    '  z-index: 10150; font-family: system-ui, -apple-system, sans-serif;',
    '  display: flex; flex-direction: column; transform: translateX(100%);',
    '  transition: transform 0.2s ease-out;',
    '}',
    '.pc-panel.pc-panel-open { transform: translateX(0); }',
    '.pc-panel.pc-no-anim { transition: none !important; }',
    '.pc-panel-header {',
    '  display: flex; align-items: center; gap: 8px; padding: 16px;',
    '  border-bottom: 1px solid #e5e7eb; flex-shrink: 0;',
    '}',
    '.pc-panel-header h2 { font-size: 16px; font-weight: 600; margin: 0; flex-shrink: 0; }',
    '.pc-panel-visibility-btn.pc-panel-visibility-btn {',
    '  width: auto; height: 26px; padding: 0 8px; gap: 5px;',
    '  border: 1px solid #e2e8f0; border-radius: 5px; background: #fff;',
    '  font-size: 11px; font-weight: 500; color: #64748b; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: all .15s; flex-shrink: 0;',
    '}',
    '.pc-panel-visibility-btn.pc-panel-visibility-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #334155; }',
    '.pc-panel-visibility-btn.pc-vis-off { color: #94a3b8; border-style: dashed; }',

    /* --- Panel filter dropdown --- */
    '.pc-panel-filter { position: relative; margin-left: auto; flex-shrink: 0; }',
    '.pc-panel-filter-trigger {',
    '  display: inline-flex; align-items: center; gap: 8px;',
    '  height: 34px; padding: 0 28px 0 12px;',
    '  font-size: 13px; font-weight: 500;',
    '  font-family: system-ui, -apple-system, sans-serif;',
    '  color: #374151; background: #fff;',
    '  border: 1px solid #d1d5db; border-radius: 8px;',
    '  cursor: pointer; white-space: nowrap; user-select: none;',
    '  position: relative; box-sizing: border-box;',
    '  transition: border-color 0.15s, box-shadow 0.15s;',
    '}',
    '.pc-panel-filter-trigger:hover { border-color: #9ca3af; }',
    '.pc-panel-filter-trigger::after {',
    '  content: ""; position: absolute; right: 10px; top: 50%;',
    '  transform: translateY(-50%); width: 0; height: 0;',
    '  border-left: 4px solid transparent; border-right: 4px solid transparent;',
    '  border-top: 5px solid #9ca3af;',
    '}',
    '.pc-panel-filter-chip {',
    '  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;',
    '}',
    '.pc-panel-filter-menu {',
    '  display: none !important; position: absolute; top: calc(100% + 6px); right: 0;',
    '  background: #fff; border: 1px solid #d1d5db; border-radius: 10px;',
    '  box-shadow: 0 4px 20px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.06);',
    '  padding: 6px; z-index: 10210; min-width: 200px; box-sizing: border-box;',
    '}',
    '.pc-panel-filter-menu.open { display: flex !important; flex-direction: column; animation: pc-menu-in .15s cubic-bezier(0.25,1,0.5,1) forwards; }',
    '.pc-panel-filter-opt {',
    '  display: flex !important; align-items: center !important; justify-content: flex-start !important; gap: 10px;',
    '  width: 100% !important; padding: 8px 12px !important; margin: 0; border: none; background: none;',
    '  border-radius: 8px; font-size: 13px !important; font-weight: 500;',
    '  font-family: system-ui, -apple-system, sans-serif;',
    '  color: #1a1a1a !important; cursor: pointer; text-align: left !important; white-space: nowrap;',
    '  box-sizing: border-box; transition: background 0.1s;',
    '}',
    '.pc-panel-filter-opt:hover { background: #f0f4ff !important; }',
    '.pc-panel-filter-opt.active { background: #f1f5f9 !important; font-weight: 600; }',
    '.pc-panel-header button {',
    '  width: 28px; height: 28px; border: none; background: none;',
    '  cursor: pointer; border-radius: 6px; font-size: 16px; color: #6b7280;',
    '  display: flex; align-items: center; justify-content: center;',
    '}',
    '.pc-panel-header button:hover { background: #f3f4f6; color: #1a1a1a; }',
    '.pc-panel-list { flex: 1; overflow-y: auto; padding: 0; }',

    /* --- Accordion --- */
    '.pc-accordion { border-bottom: 1px solid #e5e7eb; }',
    '.pc-accordion:last-child { border-bottom: none; }',
    '.pc-accordion-trigger {',
    '  display: flex; align-items: center; gap: 8px; width: 100%;',
    '  padding: 10px 12px; border: none; background: none; cursor: pointer;',
    '  font-size: 13px; font-weight: 600; font-family: inherit; color: #374151;',
    '  text-align: left;',
    '}',
    '.pc-accordion-trigger:hover { background: #f9fafb; }',
    '.pc-accordion-chevron {',
    '  width: 22px; height: 22px; flex-shrink: 0;',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: transform 0.15s ease; color: #9ca3af;',
    '}',
    '.pc-accordion-trigger.pc-accordion-open .pc-accordion-chevron { transform: rotate(90deg); }',
    '.pc-accordion-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.pc-accordion-current { font-size: 9px; color: #9ca3af; font-weight: 500; letter-spacing: 0.5px; border: 1px solid #d1d5db; border-radius: 4px; padding: 1px 5px; margin-left: 6px; vertical-align: middle; }',
    '.pc-accordion-count {',
    '  flex-shrink: 0; min-width: 20px; height: 20px; border-radius: 10px;',
    '  background: #e5e7eb; color: #6b7280; font-size: 11px; font-weight: 600;',
    '  display: flex; align-items: center; justify-content: center; padding: 0 6px;',
    '}',
    '.pc-accordion-content { padding: 0 0 4px; }',
    '.pc-panel-card {',
    '  display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px;',
    '  border-radius: 8px; cursor: pointer;',
    '  margin-bottom: 4px; transition: background 0.1s;',
    '}',
    '.pc-panel-card:hover { background: #f9fafb; }',
    '.pc-panel-card.pc-card-active { background: #f0f7ff; }',
    '.pc-panel-card-badge {',
    '  width: 22px; height: 22px; border-radius: 50%; display: flex;',
    '  align-items: center; justify-content: center; color: #fff;',
    '  font-size: 10px; font-weight: 700; flex-shrink: 0;',
    '}',
    '.pc-panel-card-meta {',
    '  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;',
    '}',
    '.pc-panel-card-top { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }',
    '.pc-panel-card-type {',
    '  font-weight: 600; display: flex; align-items: center; gap: 4px;',
    '}',
    '.pc-panel-card-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }',
    '.pc-panel-card-text {',
    '  font-size: 13px; color: #374151; line-height: 1.4;',
    '  word-wrap: break-word;',
    '}',
    '.pc-panel-card-text strong { font-weight: 600; }',
    '.pc-panel-card-text em { font-style: italic; }',
    '.pc-panel-card-text ul { margin: 4px 0; padding-left: 18px; list-style: disc; }',
    '.pc-panel-card-text li { margin: 2px 0; }',
    '.pc-panel-empty {',
    '  color: #9ca3af; font-size: 13px; padding: 6px 12px 10px 42px;',
    '}',

    /* --- Toggle button (bottom-right, next to demo-menu) --- */
    '.pc-toggle {',
    '  position: fixed; bottom: 24px; left: 24px; width: 56px; height: 56px;',
    '  border-radius: 50%; background: #08192E; color: #fff; border: 2px solid #fff;',
    '  cursor: pointer; z-index: 10000; display: flex; align-items: center;',
    '  justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);',
    '  font-size: 20px; transition: transform 0.2s; overflow: visible;',
    '}',
    '.pc-toggle:hover { transform: scale(1.08); }',
    '.pc-toggle.pc-toggle-active { background: #3b82f6; border-color: #3b82f6; }',
    '.pc-toggle-badge {',
    '  position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px;',
    '  border-radius: 9px; background: #3b82f6; color: #fff; font-size: 10px;',
    '  font-weight: 700; display: none; align-items: center; justify-content: center;',
    '  padding: 0 4px;',
    '}',

    /* --- Gate overlay (only shown if not already authenticated) --- */
    '.pc-gate {',
    '  position: fixed; inset: 0; background: rgba(0,0,0,.5);',
    '  z-index: 10500; display: flex; align-items: center; justify-content: center;',
    '}',
    '.pc-gate-box {',
    '  background: #fff; border-radius: 12px; padding: 32px; width: 320px;',
    '  box-shadow: 0 20px 60px rgba(0,0,0,.2); font-family: system-ui, sans-serif;',
    '}',
    '.pc-gate-box h3 { margin: 0 0 16px; font-size: 18px; }',
    '.pc-gate-box input {',
    '  width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;',
    '  font-size: 14px; margin-bottom: 12px; box-sizing: border-box; font-family: inherit;',
    '}',
    '.pc-gate-box input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,.15); }',
    '.pc-gate-box button {',
    '  width: 100%; padding: 8px; border-radius: 8px; border: none;',
    '  background: #1a1a1a; color: #fff; font-size: 14px; cursor: pointer; font-family: inherit;',
    '}',
    '.pc-gate-box button:hover { background: #333; }',
    '.pc-gate-error { color: #ef4444; font-size: 13px; margin-bottom: 12px; display: none; }',

    /* --- Confirm dialog --- */
    '.pc-confirm-overlay {',
    '  position: fixed; inset: 0; background: rgba(0,0,0,.4);',
    '  z-index: 10500; display: flex; align-items: center; justify-content: center;',
    '}',
    '.pc-confirm {',
    '  background: #f8fafc; border-radius: 10px;',
    '  box-shadow: 0 8px 30px rgba(0,0,0,.15), 0 2px 6px rgba(0,0,0,.1);',
    '  width: 340px; padding: 20px 20px 16px;',
    '  font-family: system-ui, -apple-system, sans-serif;',
    '}',
    '.pc-confirm-msg { font-size: 15px; font-weight: 500; color: #0f172a; margin-bottom: 20px; line-height: 1.45; }',
    '.pc-confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }',
    '.pc-confirm-btn {',
    '  height: 32px; padding: 0 16px; border-radius: 8px; border: none;',
    '  font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;',
    '  transition: background 0.15s;',
    '}',
    '.pc-confirm-cancel { background: #e2e8f0; color: #475569; }',
    '.pc-confirm-cancel:hover { background: #dbeafe; color: #0f172a; }',
    '.pc-confirm-danger { background: #ef4444; color: #fff; }',
    '.pc-confirm-danger:hover { background: #dc2626; }'
  ].join('\n');
  document.head.appendChild(style);

  // When running inside a same-origin iframe (the mobile preview frame), the
  // comment toggle is mounted in the TOP document so it lands at the page's
  // global bottom-left instead of being clipped inside the phone. Pins, popover
  // and panel stay in THIS (content) document. uiDoc() returns the document the
  // toggle should live in.
  function uiDoc() {
    try {
      if (window.self !== window.top && window.top.document) return window.top.document;
    } catch (e) {}
    return document;
  }
  var IS_IFRAMED = uiDoc() !== document;
  if (IS_IFRAMED) {
    // Mirror the comment styles into the top document so the toggle (the only
    // element mounted there) is styled. All selectors are .pc-* — no collisions.
    if (!uiDoc().getElementById('pc-styles-top')) {
      var topStyle = uiDoc().createElement('style');
      topStyle.id = 'pc-styles-top';
      topStyle.textContent = style.textContent;
      uiDoc().head.appendChild(topStyle);
    }
  }

  // === Utility: CSS escape for selectors ===
  function cssEscape(str) {
    return str.replace(/([^\w-])/g, '\\$1');
  }

  // === Utility: relative timestamp ===
  function timeAgo(isoStr) {
    if (!isoStr) return '';
    var diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 172800) return 'Yesterday';
    var d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // === Utility: simple markdown renderer ===
  function renderMarkdown(text) {
    if (!text) return '';
    var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var lines = escaped.split('\n');
    var out = '';
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      // Check for bullet before inline formatting
      var bulletMatch = line.match(/^[-*] (.+)$/);
      if (bulletMatch) {
        if (!inList) { out += '<ul>'; inList = true; }
        out += '<li>' + inlineFormat(bulletMatch[1]) + '</li>';
      } else {
        var wasList = inList;
        if (inList) { out += '</ul>'; inList = false; }
        if (out && !wasList) out += '<br>';
        out += inlineFormat(line);
      }
    }
    if (inList) out += '</ul>';
    return out;
  }

  function inlineFormat(str) {
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  // === Utility: get page comments ===
  function getPageComments(page) {
    return comments.filter(function(c) { return c.page === page; });
  }

  // === Utility: get comment number (1-indexed within page) ===
  function getCommentNumber(comment) {
    var pageComments = getPageComments(comment.page);
    return pageComments.indexOf(comment) + 1;
  }

  // === Confirm dialog ===
  function showConfirm(msg, onConfirm) {
    if (commentMode) exitCommentMode();
    var overlay = document.createElement('div');
    overlay.className = 'pc-confirm-overlay';
    overlay.innerHTML =
      '<div class="pc-confirm">' +
        '<div class="pc-confirm-msg">' + msg + '</div>' +
        '<div class="pc-confirm-actions">' +
          '<button class="pc-confirm-btn pc-confirm-cancel">Cancel</button>' +
          '<button class="pc-confirm-btn pc-confirm-danger">Delete</button>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.pc-confirm-cancel').addEventListener('click', function() { overlay.remove(); });
    overlay.querySelector('.pc-confirm-danger').addEventListener('click', function() { overlay.remove(); onConfirm(); });
    document.body.appendChild(overlay);
  }

  function getGateUser() {
    return localStorage.getItem(GATE_NAME_KEY) || '';
  }

  function isAuthenticated() {
    // Authenticated if we have a name — password only needed on first entry
    return !!getGateUser();
  }

  // === Selector computation (adapted from designer-notes) ===
  function computeSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    if (el.id && !/^\d/.test(el.id) && !el.id.startsWith('pc-')) return '#' + cssEscape(el.id);
    var parts = [];
    var current = el;
    var maxDepth = 5;
    while (current && current !== document.body && current !== document.documentElement && maxDepth-- > 0) {
      if (current.id && !/^\d/.test(current.id) && !current.id.startsWith('pc-')) {
        parts.unshift('#' + cssEscape(current.id));
        break;
      }
      var seg = current.tagName.toLowerCase();
      var cls = Array.from(current.classList || [])
        .filter(function(c) { return !/^(ng-|css-|sc-|jsx-|astro-|dn-|pc-|geist|__next)/.test(c) && c.length < 40; })
        .slice(0, 2);
      if (cls.length > 0) seg += '.' + cls.map(function(c) { return cssEscape(c); }).join('.');
      var par = current.parentElement;
      if (par) {
        var sibs = Array.from(par.children).filter(function(s) { return s.tagName === current.tagName; });
        if (sibs.length > 1) seg += ':nth-child(' + (Array.from(par.children).indexOf(current) + 1) + ')';
      }
      parts.unshift(seg);
      current = current.parentElement;
    }
    if (!parts[0] || !parts[0].startsWith('#')) parts.unshift('body');
    var sel = parts.join(' > ');
    try { if (document.querySelector(sel) === el) return sel; } catch (e) {}
    // Fallback: full nth-child path
    parts = [];
    current = el;
    while (current && current !== document.body) {
      var idx = Array.from(current.parentElement.children).indexOf(current) + 1;
      parts.unshift(current.tagName.toLowerCase() + ':nth-child(' + idx + ')');
      current = current.parentElement;
    }
    parts.unshift('body');
    return parts.join(' > ');
  }

  // === Get element metadata ===
  function getElementMeta(el) {
    var text = '';
    var heading = el.querySelector('h1, h2, h3, p, button, span');
    if (heading) text = heading.textContent.trim();
    if (!text) text = el.textContent.trim();
    return {
      tagName: el.tagName,
      textPreview: text.slice(0, 60)
    };
  }

  // === Pin rendering ===
  var pinOverlays = []; // track overlay elements for cleanup

  function clearAllPins() {
    // Restore position:static on parents we changed
    document.querySelectorAll('[data-pc-was-static]').forEach(function(el) {
      el.style.position = '';
      el.removeAttribute('data-pc-was-static');
    });
    pinOverlays.forEach(function(el) { if (el.parentNode) el.parentNode.removeChild(el); });
    pinOverlays = [];
  }

  function renderAllPins() {
    clearAllPins();
    if (!pinsVisible) return;
    var pageComments = getPageComments(PAGE_ID);
    pageComments.forEach(function(comment, idx) {
      renderPin(comment, idx + 1);
    });
  }

  function setPinsVisible(visible) {
    pinsVisible = visible;
    sessionStorage.setItem('pc-pins-visible', visible ? '1' : '0');
    renderAllPins();
    if (!visible && popoverEl) closePopover();
    // Update toggle button in panel
    var btn = document.querySelector('.pc-panel-visibility-btn');
    if (btn) {
      var eyeOpen = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeClosed = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';
      btn.innerHTML = (pinsVisible ? eyeOpen : eyeClosed) + '<span>' + (pinsVisible ? 'Visible' : 'Hidden') + '</span>';
      btn.classList.toggle('pc-vis-off', !pinsVisible);
    }
  }

  function renderPin(comment, number) {
    var target;
    try { target = document.querySelector(comment.selector); } catch (e) {}

    if (!target) {
      // Detached pin — render at last known position on body
      renderDetachedPin(comment, number);
      return;
    }

    // Void elements (img, input, etc.) can't have children — use parent
    var VOID_TAGS = {IMG:1,INPUT:1,BR:1,HR:1,SOURCE:1,EMBED:1,COL:1,AREA:1,WBR:1,TRACK:1,CANVAS:1};
    var overlayParent = target;
    if (VOID_TAGS[target.tagName]) {
      overlayParent = target.parentElement;
    }
    if (!overlayParent || overlayParent === document.body) {
      renderDetachedPin(comment, number);
      return;
    }

    var pos = getComputedStyle(overlayParent).position;
    if (pos === 'static') {
      overlayParent.style.position = 'relative';
      overlayParent.setAttribute('data-pc-was-static', '1');
    }

    var overlay = document.createElement('div');
    overlay.className = 'pc-pin-overlay';
    overlay.setAttribute('data-pc-comment-id', comment.id);
    overlayParent.appendChild(overlay);
    pinOverlays.push(overlay);

    // Render pin
    var pin = document.createElement('div');
    pin.className = 'pc-pin';
    pin.setAttribute('data-pc-comment-id', comment.id);
    var color = COMMENT_TYPES[comment.type] || COMMENT_TYPES[DEFAULT_TYPE];
    pin.style.background = color;
    pin.style.left = 'calc(' + comment.x + '% - 14px)';
    pin.style.top = 'calc(' + comment.y + '% - 14px)';
    pin.textContent = number;
    overlay.appendChild(pin);

    // Pin click → open popover (preventDefault blocks link navigation underneath)
    pin.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openPopover(comment);
    });

    // Pin drag
    setupPinDrag(pin, comment, target);
  }

  function renderDetachedPin(comment, number) {
    // Render a gray pin at a fixed position as a fallback
    var pin = document.createElement('div');
    pin.className = 'pc-pin pc-pin-detached';
    pin.setAttribute('data-pc-comment-id', comment.id);
    pin.style.position = 'fixed';
    pin.style.left = '20px';
    pin.style.top = (60 + (number - 1) * 36) + 'px';
    pin.textContent = number;
    document.body.appendChild(pin);
    pinOverlays.push(pin);

    pin.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openPopover(comment);
    });
  }

  // === Pin dragging ===
  function setupPinDrag(pin, comment, target) {
    var isDragging = false;
    var startX, startY;
    var DRAG_THRESHOLD = 3;

    // Prevent native browser image drag on the pin
    pin.addEventListener('dragstart', function(e) { e.preventDefault(); });

    pin.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;

      var dragClone = null;

      function onMove(e2) {
        var dx = e2.clientX - startX;
        var dy = e2.clientY - startY;
        if (!isDragging && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
          isDragging = true;
          pin.classList.add('pc-pin-dragging');
          // Create a clone on document.body so no ancestor can constrain it
          dragClone = pin.cloneNode(true);
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '10500';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.margin = '0';
          document.body.appendChild(dragClone);
          pin.style.opacity = '0';
        }
        if (isDragging && dragClone) {
          dragClone.style.left = (e2.clientX - 14) + 'px';
          dragClone.style.top = (e2.clientY - 14) + 'px';
        }
      }

      function onUp(e2) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        pin.classList.remove('pc-pin-dragging');
        pin.style.opacity = '';
        if (dragClone && dragClone.parentNode) dragClone.parentNode.removeChild(dragClone);
        dragClone = null;
        if (isDragging) {
          e2.preventDefault();
          e2.stopPropagation();
          // Resolve the element under the cursor as the new target
          var underneath = document.elementFromPoint(e2.clientX, e2.clientY);
          var VOID_TAGS = {IMG:1,INPUT:1,BR:1,HR:1,SOURCE:1,EMBED:1,COL:1,AREA:1,WBR:1,TRACK:1,CANVAS:1};
          var newTarget = underneath;
          // Walk up past tiny elements and comment system elements
          while (newTarget && newTarget !== document.body && (newTarget.offsetHeight < 20 || newTarget.closest('.pc-pin-overlay, .pc-region, .pc-pin'))) {
            newTarget = newTarget.parentElement;
          }
          if (VOID_TAGS[newTarget && newTarget.tagName] && newTarget.parentElement) {
            newTarget = newTarget.parentElement;
          }
          if (!newTarget || newTarget === document.body || newTarget === document.documentElement) {
            newTarget = target; // fallback to original
          }
          var rect = newTarget.getBoundingClientRect();
          comment.selector = computeSelector(newTarget);
          var meta = getElementMeta(newTarget);
          comment.tagName = meta.tagName;
          comment.textPreview = meta.textPreview;
          comment.x = Math.round((e2.clientX - rect.left) / rect.width * 1000) / 10;
          comment.y = Math.round((e2.clientY - rect.top) / rect.height * 1000) / 10;
          comment.updatedAt = new Date().toISOString();
          saveComments();
          renderAllPins();
          // Block the click event that follows mouseup (prevents link navigation)
          window.addEventListener('click', function blockClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            window.removeEventListener('click', blockClick, true);
          }, true);
        }
      }

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
  }

  // === Load / save (via the Cloudflare Worker, which stores in KV) ===
  function syncEnabled() { return API_BASE && API_BASE.indexOf('__') !== 0; }

  async function loadComments() {
    if (!syncEnabled()) return;
    try {
      var res = await fetch(API_BASE + '/comments');
      if (!res.ok) return;
      var data = await res.json();
      if (Array.isArray(data)) comments = data;
    } catch (e) {
      console.warn('Failed to load comments', e);
    }
  }

  var _saveTimer = null;
  function saveComments() {
    if (!syncEnabled()) return;
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function() {
      _saveTimer = null;
      _doSave();
    }, 500);
  }
  async function _doSave() {
    try {
      await fetch(API_BASE + '/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comments)
      });
    } catch (e) { console.warn('Failed to save comments', e); }
  }

  // === Popover ===
  var popoverEl = null;
  var popoverEditing = false; // true in edit mode → popover is fixed + tracks scroll;
                              // in read mode it's absolute and scrolls away with the page

  // Reposition popover on scroll so it tracks the pin/region (edit mode only)
  var _scrollRaf = 0;
  var _scrollTimeout = 0;
  function _onScrollReposition() {
    if (!popoverEl || !editingComment || !popoverEditing) return;
    // Kill animation/transition during scroll to prevent wiggle
    popoverEl.style.animation = 'none';
    popoverEl.style.transition = 'none';
    cancelAnimationFrame(_scrollRaf);
    _scrollRaf = requestAnimationFrame(function() {
      if (popoverEl && editingComment) positionPopover(editingComment);
    });
    // Restore after scroll settles
    clearTimeout(_scrollTimeout);
    _scrollTimeout = setTimeout(function() {
      if (popoverEl) {
        popoverEl.style.animation = '';
        popoverEl.style.transition = '';
      }
    }, 100);
  }
  function _bindScrollReposition() {
    window.addEventListener('scroll', _onScrollReposition, true);
  }
  function _unbindScrollReposition() {
    window.removeEventListener('scroll', _onScrollReposition, true);
    cancelAnimationFrame(_scrollRaf);
  }

  function closePopover() {
    _unbindScrollReposition();
    popoverEditing = false;
    discardEmptyComment();
    if (popoverEl && popoverEl.parentNode) {
      popoverEl.parentNode.removeChild(popoverEl);
    }
    popoverEl = null;
    editingComment = null;
    document.querySelectorAll('.pc-pin-active').forEach(function(p) { p.classList.remove('pc-pin-active'); });
    renderAllPins();
  }

  function discardEmptyComment() {
    if (editingComment && !editingComment.text.trim()) {
      var idx = comments.indexOf(editingComment);
      if (idx >= 0) comments.splice(idx, 1);
    }
  }

  function openPopover(comment, editMode) {
    closePopover();
    editingComment = comment;

    // Mark pin as active
    var pin = document.querySelector('.pc-pin[data-pc-comment-id="' + comment.id + '"]');
    if (pin) pin.classList.add('pc-pin-active');

    var number = getCommentNumber(comment);
    var color = COMMENT_TYPES[comment.type] || COMMENT_TYPES[DEFAULT_TYPE];
    var isNew = editMode === true && !comment.text;

    popoverEl = document.createElement('div');
    popoverEl.className = 'pc-popover';
    popoverEl.setAttribute('data-type', comment.type || DEFAULT_TYPE);

    popoverEl.innerHTML =
      '<div class="pc-popover-header">' +
        '<div class="pc-popover-badge" style="background:' + color + '">' + number + '</div>' +
        '<span style="font-size:13px;font-weight:600;color:var(--pc-text-secondary)">Comment</span>' +
        '<div class="pc-popover-actions">' +
          '<button class="pc-popover-header-btn pc-popover-edit-btn" title="Edit">' +
            '<svg viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>' +
          '</button>' +
          '<button class="pc-popover-header-btn pc-popover-delete-btn" title="Delete">' +
            '<svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          '</button>' +
          '<div class="pc-popover-toolbar-divider"></div>' +
          '<button class="pc-popover-header-btn pc-popover-close-btn" title="Close">' +
            '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="pc-popover-body">' +
        '<div class="pc-popover-read-text"></div>' +
        '<textarea class="pc-popover-textarea" placeholder="Type comment and hit enter."></textarea>' +
      '</div>' +
      '<div class="pc-popover-edit-footer">' +
        '<div class="pc-popover-edit-secondary"></div>' +
        '<button class="pc-popover-submit" title="Submit">' +
          '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="pc-popover-read-footer">' +
        '<span class="pc-popover-author"></span>' +
        '<span class="pc-popover-footer-sep">|</span>' +
        '<span class="pc-popover-timestamp"></span>' +
      '</div>';

    // Stop clicks inside popover from propagating to comment mode handler
    popoverEl.addEventListener('click', function(e) { e.stopPropagation(); });

    // Close button
    popoverEl.querySelector('.pc-popover-close-btn').onclick = function(e) {
      e.stopPropagation();
      // If new and empty, discard
      if (isNew) {
        var ta = popoverEl.querySelector('.pc-popover-textarea');
        if (ta && !ta.value.trim()) {
          discardEmptyComment();
          renderAllPins();
          renderPanelList();
          updateToggleBadge();
        }
      }
      closePopover();
    };

    // Submit button
    popoverEl.querySelector('.pc-popover-submit').onclick = function(e) {
      e.stopPropagation();
      submitPopover();
    };

    // Edit button
    popoverEl.querySelector('.pc-popover-edit-btn').onclick = function(e) {
      e.stopPropagation();
      setPopoverMode('edit');
    };

    // Delete button
    popoverEl.querySelector('.pc-popover-delete-btn').onclick = function(e) {
      e.stopPropagation();
      if (editingComment) {
        var commentToDelete = editingComment;
        showConfirm('Delete this comment?', function() {
          var idx = comments.indexOf(commentToDelete);
          if (idx >= 0) comments.splice(idx, 1);
          closePopover();
          renderAllPins();
          renderPanelList();
          updateToggleBadge();
          saveComments();
        });
      }
    };

    // Textarea events
    var textarea = popoverEl.querySelector('.pc-popover-textarea');
    textarea.addEventListener('input', function() { autoResizeTextarea(textarea); });
    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        submitPopover();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePopover();
      }
    });

    document.body.appendChild(popoverEl);

    // Set initial mode
    if (editMode) {
      setPopoverMode('edit');
      textarea.value = comment.text || '';
    } else {
      setPopoverMode('read');
    }

    // Position after DOM render so offsetHeight is available
    requestAnimationFrame(function() {
      positionPopover(comment);
      if (popoverEl) popoverEl.classList.add('pc-popover-enter');
      // scroll-tracking is bound by setPopoverMode (edit only)
    });
  }

  function setPopoverMode(mode) {
    if (!popoverEl) return;
    var textarea = popoverEl.querySelector('.pc-popover-textarea');
    var readText = popoverEl.querySelector('.pc-popover-read-text');
    var editFooter = popoverEl.querySelector('.pc-popover-edit-footer');
    var readFooter = popoverEl.querySelector('.pc-popover-read-footer');
    var editBtn = popoverEl.querySelector('.pc-popover-edit-btn');
    var deleteBtn = popoverEl.querySelector('.pc-popover-delete-btn');
    var divider = popoverEl.querySelector('.pc-popover-toolbar-divider');
    var isNew = editingComment && !editingComment.text;

    if (mode === 'edit') {
      // Editing: make it fixed and track scroll (sticky)
      popoverEditing = true;
      _bindScrollReposition();
      if (editingComment) positionPopover(editingComment);
      readText.style.display = 'none';
      textarea.style.display = '';
      editFooter.style.display = '';
      readFooter.style.display = 'none';
      editBtn.style.display = 'none';
      deleteBtn.style.display = isNew ? 'none' : '';
      divider.style.display = isNew ? 'none' : '';
      // Populate textarea with current comment text if empty
      if (editingComment && !textarea.value && editingComment.text) {
        textarea.value = editingComment.text;
      }
      setTimeout(function() {
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }, 0);
    } else {
      // Read mode: stop tracking scroll and anchor to the page so it stays put
      popoverEditing = false;
      _unbindScrollReposition();
      if (editingComment) positionPopover(editingComment);
      var text = editingComment ? editingComment.text : '';
      if (text) {
        readText.innerHTML = renderMarkdown(text);
        readText.classList.remove('pc-popover-read-empty');
      } else {
        readText.textContent = 'No comment yet';
        readText.classList.add('pc-popover-read-empty');
      }
      readText.style.display = '';
      textarea.style.display = 'none';
      editFooter.style.display = 'none';
      editBtn.style.display = '';
      deleteBtn.style.display = '';
      divider.style.display = '';
      // Author + timestamp footer
      if (editingComment && editingComment.createdAt) {
        var author = editingComment.author || getGateUser() || 'Unknown';
        popoverEl.querySelector('.pc-popover-author').textContent = author;
        popoverEl.querySelector('.pc-popover-timestamp').textContent = timeAgo(editingComment.updatedAt || editingComment.createdAt);
        readFooter.style.display = '';
      } else {
        readFooter.style.display = 'none';
      }
    }
  }

  function submitPopover() {
    if (!popoverEl || !editingComment) return;
    var ta = popoverEl.querySelector('.pc-popover-textarea');
    var text = ta ? ta.value.trim() : '';

    if (!text) {
      // Discard empty comment
      discardEmptyComment();
      closePopover();
    } else {
      editingComment.text = text;
      editingComment.updatedAt = new Date().toISOString();
      if (!editingComment.author) editingComment.author = getGateUser() || 'Unknown';
      // Switch to read mode, keep popover open
      setPopoverMode('read');
    }

    renderAllPins();
    renderPanelList();
    updateToggleBadge();
    saveComments();
  }

  function autoResizeTextarea(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }

  function positionPopover(comment) {
    if (!popoverEl) return;

    // Use viewport-relative coordinates (popover is position:fixed)
    var pin = document.querySelector('.pc-pin[data-pc-comment-id="' + comment.id + '"]');
    var rect;
    if (pin) {
      var vr = pin.getBoundingClientRect();
      if (vr.top === 0 && vr.left === 0 && vr.width === 0) pin = null;
      else rect = { top: vr.top, left: vr.left, right: vr.right, bottom: vr.bottom };
    }

    // Fallback: compute position from the target element + percentage coordinates
    if (!pin) {
      var target;
      try { target = document.querySelector(comment.selector); } catch (e) {}
      if (target) {
        var elRect = target.getBoundingClientRect();
        var vpTop = elRect.top + (comment.y / 100) * elRect.height;
        var vpLeft = elRect.left + (comment.x / 100) * elRect.width;
        rect = { top: vpTop, left: vpLeft, right: vpLeft + 28, bottom: vpTop + 28 };
      } else {
        popoverEl.style.position = popoverEditing ? 'fixed' : 'absolute';
        popoverEl.style.top = (100 + (popoverEditing ? 0 : (window.scrollY || 0))) + 'px';
        popoverEl.style.left = (100 + (popoverEditing ? 0 : (window.scrollX || 0))) + 'px';
        return;
      }
    }

    var popW = 360;
    var popH = popoverEl.offsetHeight || 200;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Usable viewport bounds
    var panelW = panelOpen ? 360 : 0;
    var menuZone = 80; // bottom-right buttons area height
    var viewTop = 10;
    var viewBottom = vh - 10;
    var viewLeft = 10;
    var viewRight = vw - panelW - 20;

    // Anchor the popover to the pin
    var anchor = rect;

    var left, top;

    // Try positions in order: right, below, left, above
    if (anchor.right + 12 + popW <= viewRight) {
      // Right of anchor
      left = anchor.right + 12;
      top = anchor.top;
    } else if (anchor.bottom + 8 + popH <= viewBottom - menuZone) {
      // Below anchor
      left = anchor.left;
      top = anchor.bottom + 8;
    } else if (anchor.left - 12 - popW >= viewLeft) {
      // Left of anchor
      left = anchor.left - popW - 12;
      top = anchor.top;
    } else {
      // Above anchor
      left = anchor.left;
      top = anchor.top - popH - 8;
    }

    // Clamp to viewport
    if (left + popW > viewRight) left = viewRight - popW;
    if (left < viewLeft) left = viewLeft;
    if (top + popH > viewBottom) top = viewBottom - popH;
    if (top < viewTop) top = viewTop;

    // Edit mode: fixed (tracks scroll). Read mode: absolute in the page so it
    // stays anchored to its spot and scrolls away with the content.
    if (popoverEditing) {
      popoverEl.style.position = 'fixed';
      popoverEl.style.top = top + 'px';
      popoverEl.style.left = left + 'px';
    } else {
      popoverEl.style.position = 'absolute';
      popoverEl.style.top = (top + (window.scrollY || 0)) + 'px';
      popoverEl.style.left = (left + (window.scrollX || 0)) + 'px';
    }
  }

  // === Comment mode ===
  function blockClicks(e) {
    if (e.target.closest('.pc-popover, .pc-panel, .pc-toggle, .pc-pin, .pc-gate, .pc-draw-overlay, #demo-menu-btn, #demo-menu')) return;
    e.preventDefault();
    e.stopPropagation();
  }
  function blockDragStart(e) { e.preventDefault(); }

  function enterCommentMode() {
    if (!isAuthenticated()) {
      showGate(function() { enterCommentMode(); });
      return;
    }
    if (pureViewMode) togglePureViewMode();
    else if (!pinsVisible) setPinsVisible(true);
    commentMode = true;
    document.body.classList.add('pc-comment-mode');
    document.addEventListener('mousedown', onCommentMouseDown, true);
    document.addEventListener('click', blockClicks, true);
    document.addEventListener('dragstart', blockDragStart, true);
    if (toggleBtn) toggleBtn.classList.add('pc-toggle-active');
    var v = document.getElementById('hero-video');
    if (v && !v.paused) { v.pause(); v._pausedByComments = true; }
  }

  function exitCommentMode() {
    commentMode = false;
    document.body.classList.remove('pc-comment-mode');
    document.removeEventListener('mousedown', onCommentMouseDown, true);
    document.removeEventListener('click', blockClicks, true);
    document.removeEventListener('dragstart', blockDragStart, true);
    if (toggleBtn) toggleBtn.classList.remove('pc-toggle-active');
    var v = document.getElementById('hero-video');
    if (v && v._pausedByComments) { v.play(); v._pausedByComments = false; }
  }

  function toggleCommentMode() {
    if (commentMode) exitCommentMode();
    else enterCommentMode();
  }

  var commentDragState = null;

  function onCommentMouseDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest('.pc-popover, .pc-panel, .pc-toggle, .pc-pin, .pc-gate, .pc-draw-overlay, #demo-menu-btn, #demo-menu')) return;
    e.preventDefault();
    e.stopPropagation();

    commentDragState = { startX: e.clientX, startY: e.clientY, target: e.target, dragging: false };
    window.addEventListener('mousemove', onCommentMouseMove, true);
    window.addEventListener('mouseup', onCommentMouseUp, true);
  }

  function onCommentMouseMove() {
    // Region drawing removed — comments are single points, nothing to preview.
  }

  function onCommentMouseUp(e) {
    window.removeEventListener('mousemove', onCommentMouseMove, true);
    window.removeEventListener('mouseup', onCommentMouseUp, true);
    if (!commentDragState) return;

    var target = commentDragState.target;
    commentDragState = null;

    // If a popover is open for an empty (new) comment, reposition its pin
    if (popoverEl && editingComment && !editingComment.text.trim()) {
      var VOID_TAGS2 = {IMG:1,INPUT:1,BR:1,HR:1,SOURCE:1,EMBED:1,COL:1,AREA:1,WBR:1,TRACK:1,CANVAS:1};
      var el2 = target;
      while (el2 && el2 !== document.body && el2.offsetHeight < 20 && el2.parentElement) el2 = el2.parentElement;
      if (VOID_TAGS2[el2.tagName] && el2.parentElement) el2 = el2.parentElement;
      if (el2 && el2 !== document.body && el2 !== document.documentElement) {
        var rect2 = el2.getBoundingClientRect();
        var meta2 = getElementMeta(el2);
        editingComment.selector = computeSelector(el2);
        editingComment.tagName = meta2.tagName;
        editingComment.textPreview = meta2.textPreview;
        editingComment.x = Math.round((e.clientX - rect2.left) / rect2.width * 1000) / 10;
        editingComment.y = Math.round((e.clientY - rect2.top) / rect2.height * 1000) / 10;
        closePopover();
        renderAllPins();
        openPopover(editingComment, true);
      }
      return;
    }

    // If a popover is open for an existing comment, just dismiss it
    if (popoverEl) {
      closePopover();
      renderAllPins();
      renderPanelList();
      return;
    }

    var VOID_TAGS = {IMG:1,INPUT:1,BR:1,HR:1,SOURCE:1,EMBED:1,COL:1,AREA:1,WBR:1,TRACK:1,CANVAS:1};
    var el = target;
    while (el && el !== document.body && el.offsetHeight < 20 && el.parentElement) {
      el = el.parentElement;
    }
    // Void elements can't hold pin overlays — use parent for both selector and rect
    if (VOID_TAGS[el.tagName] && el.parentElement) {
      el = el.parentElement;
    }
    if (!el || el === document.body || el === document.documentElement) return;

    var rect = el.getBoundingClientRect();
    var meta = getElementMeta(el);
    var selector = computeSelector(el);

    var comment = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      page: PAGE_ID,
      selector: selector,
      tagName: meta.tagName,
      textPreview: meta.textPreview,
      x: Math.round((e.clientX - rect.left) / rect.width * 1000) / 10,
      y: Math.round((e.clientY - rect.top) / rect.height * 1000) / 10,
      text: '',
      type: lastUsedType,
      author: getGateUser() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    comments.push(comment);
    renderAllPins();
    openPopover(comment, true);
  }

  // === Gate overlay ===
  function showGate(callback) {
    var overlay = document.createElement('div');
    overlay.className = 'pc-gate';
    overlay.innerHTML =
      '<div class="pc-gate-box">' +
        '<h3>Enter your name to comment</h3>' +
        '<input type="text" placeholder="Your name" class="pc-gate-name">' +
        '<button class="pc-gate-submit">Continue</button>' +
      '</div>';

    var nameInput = overlay.querySelector('.pc-gate-name');

    function tryLogin() {
      var name = nameInput.value.trim();
      if (name) {
        localStorage.setItem(GATE_NAME_KEY, name);
        localStorage.setItem(GATE_STORAGE_KEY, GATE_PASSWORD);
        overlay.parentNode.removeChild(overlay);
        if (callback) callback();
      }
    }

    overlay.querySelector('.pc-gate-submit').addEventListener('click', tryLogin);
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') tryLogin();
    });

    // Close on backdrop click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.parentNode.removeChild(overlay);
    });

    document.body.appendChild(overlay);
    nameInput.focus();
  }

  // === Keyboard shortcuts ===
  function togglePureViewMode() {
    pureViewMode = !pureViewMode;
    // Hide/show comment toggle button (may live in the top doc when iframed)
    if (toggleBtn) toggleBtn.style.display = pureViewMode ? 'none' : '';
    // Hide/show demo menu button
    var menuBtn = document.getElementById('demo-menu-btn');
    if (menuBtn) menuBtn.style.display = pureViewMode ? 'none' : '';
    // Close everything if entering pure view
    if (pureViewMode) {
      if (popoverEl) closePopover();
      if (panelOpen) togglePanel();
      if (commentMode) exitCommentMode();
      // Close demo menu if open
      var menu = document.getElementById('demo-menu');
      if (menu && menu.style.opacity === '1') menuBtn && menuBtn.click();
      setPinsVisible(false);
    } else {
      setPinsVisible(true);
    }
  }

  function bindKeyboard() {
    function onKeydown(e) {
      // Cmd/Ctrl + . → toggle pure viewing mode
      if (e.key === '.' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePureViewMode();
        return;
      }
      // Ignore if typing in an input or using modifier keys
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (!commentMode) {
          enterCommentMode();           // C1: enter comment mode
          panelWasOpened = false;
        } else if (!panelOpen && !panelWasOpened) {
          togglePanel();                // C2: open panel
          panelWasOpened = true;
        } else if (panelOpen) {
          togglePanel();                // C3: close panel
        } else {
          exitCommentMode();            // C4: exit comment mode
          panelWasOpened = false;
        }
      }
      if (e.key === 'm' || e.key === 'M') {
        if (commentMode) exitCommentMode();
        // Let demo-menu.html's own M handler toggle the menu
      }
      if ((e.key === 'e' || e.key === 'E') && popoverEl) {
        var readText = popoverEl.querySelector('.pc-popover-read-text');
        if (readText && readText.style.display !== 'none') {
          e.preventDefault();
          setPopoverMode('edit');
        }
      }
      if ((e.key === 'v' || e.key === 'V') && (commentMode || popoverEl || panelOpen)) {
        e.preventDefault();
        if (popoverEl) closePopover();
        if (panelOpen) togglePanel();
        if (commentMode) exitCommentMode();
      }
      if (e.key === 'Escape') {
        if (popoverEl) closePopover();
        else if (panelOpen) togglePanel();
        else if (commentMode) exitCommentMode();
      }
    }
    document.addEventListener('keydown', onKeydown);
    // On the mobile frame, keyboard focus is usually on the top page (outside
    // the phone iframe), so listen there too — keys still drive the iframe tool.
    if (IS_IFRAMED) uiDoc().addEventListener('keydown', onKeydown);
  }

  // === Toggle button ===
  var toggleBtn = null;

  function renderToggleButton() {
    if (toggleBtn) return;
    var doc = uiDoc();
    // Clear any stale toggle left in the top doc by a previous iframe load
    var stale = doc.getElementById('pc-toggle-btn');
    if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
    toggleBtn = doc.createElement('button');
    toggleBtn.id = 'pc-toggle-btn';
    toggleBtn.className = 'pc-toggle';
    toggleBtn.title = 'Comments';
    toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span class="pc-toggle-badge">0</span>';
    toggleBtn.addEventListener('click', function() {
      // Always dismiss any open popover first
      if (popoverEl) {
        discardEmptyComment();
        closePopover();
        renderAllPins();
      }
      if (commentMode) {
        // Already in comment mode — open panel
        togglePanel();
      } else {
        // Enter comment mode
        toggleCommentMode();
      }
    });
    uiDoc().body.appendChild(toggleBtn);
    updateToggleBadge();
  }

  function updateToggleBadge() {
    if (!toggleBtn) return;
    var badge = toggleBtn.querySelector('.pc-toggle-badge');
    var count = comments.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // === Side Panel ===
  var panelEl = null;
  var panelTypeFilter = null; // null = all, or a type string

  function renderPanel() {
    if (panelEl) return;
    var doc = uiDoc();
    // Clear any stale panel left in the top doc by a previous iframe load
    var stalePanel = doc.getElementById('pc-panel-el');
    if (stalePanel && stalePanel.parentNode) stalePanel.parentNode.removeChild(stalePanel);
    panelEl = doc.createElement('div');
    panelEl.id = 'pc-panel-el';
    panelEl.className = 'pc-panel';

    var eyeOpen = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    var eyeClosed = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';

    panelEl.innerHTML =
      '<div class="pc-panel-header">' +
        '<h2>Comments</h2>' +
        '<button class="pc-panel-visibility-btn' + (pinsVisible ? '' : ' pc-vis-off') + '" title="Show/hide pins" style="margin-left:auto">' +
          (pinsVisible ? eyeOpen : eyeClosed) +
          '<span>' + (pinsVisible ? 'Visible' : 'Hidden') + '</span>' +
        '</button>' +
        '<button class="pc-panel-close" title="Close">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="pc-panel-list"></div>';

    panelEl.querySelector('.pc-panel-close').addEventListener('click', togglePanel);
    panelEl.querySelector('.pc-panel-visibility-btn').addEventListener('click', function() {
      setPinsVisible(!pinsVisible);
    });

    // Restore open state BEFORE first paint so the panel appears already-open
    // with no slide-in (avoids the jarring flash on each pageview).
    if (sessionStorage.getItem('pc-panel-open') === '1') {
      panelOpen = true;
      panelEl.classList.add('pc-panel-open', 'pc-no-anim');
      uiDoc().body.classList.add('pc-panel-shifted');
    }

    uiDoc().body.appendChild(panelEl);
    renderPanelList();

    // Drop the no-anim guard after first paint so later toggles animate normally
    if (panelOpen) {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (panelEl) panelEl.classList.remove('pc-no-anim');
        });
      });
    }
  }


  function togglePanel() {
    panelOpen = !panelOpen;
    sessionStorage.setItem('pc-panel-open', panelOpen ? '1' : '0');
    if (panelEl) {
      panelEl.classList.toggle('pc-panel-open', panelOpen);
      document.body.classList.toggle('pc-panel-shifted', panelOpen);
      if (panelOpen) {
        // Close the demo page menu if it's open
        var demoMenu = document.getElementById('demo-menu');
        if (demoMenu && demoMenu.style.opacity === '1') {
          demoMenu.style.opacity = '0';
          demoMenu.style.transform = 'translateY(10px)';
          demoMenu.style.pointerEvents = 'none';
        }
        renderPanelList();
      }
    }
  }

  var panelOpenSections = {}; // track which accordion sections are open
  panelOpenSections[PAGE_ID] = true; // current page starts open

  function renderPanelList() {
    if (!panelEl) return;
    var list = panelEl.querySelector('.pc-panel-list');
    var pageKeys = PAGE_ORDER;
    // Accordion only makes sense across multiple pages; for a single-page
    // prototype, list the comments directly with no collapsible section.
    var multiPage = pageKeys.length > 1;

    var html = '';

    pageKeys.forEach(function(page) {
      var pageComments = getPageComments(page);
      if (panelTypeFilter) {
        pageComments = pageComments.filter(function(c) { return c.type === panelTypeFilter; });
      }
      var isOpen = !multiPage || panelOpenSections[page] === true;
      var isCurrent = page === PAGE_ID;
      var label = PAGE_LABELS[page] || page.replace(/-/g, ' ');
      var count = pageComments.length;

      if (multiPage) {
        html += '<div class="pc-accordion">' +
          '<button class="pc-accordion-trigger' + (isOpen ? ' pc-accordion-open' : '') + '" data-page="' + page + '">' +
            '<svg class="pc-accordion-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>' +
            '<span class="pc-accordion-label">' + label + (isCurrent ? ' <span class="pc-accordion-current">CURRENT</span>' : '') + '</span>' +
            '<span class="pc-accordion-count">' + count + '</span>' +
          '</button>' +
          '<div class="pc-accordion-content" style="' + (isOpen ? '' : 'display:none') + '">';
      } else {
        html += '<div class="pc-accordion-content" style="padding-top:6px">';
      }

      if (pageComments.length === 0) {
        html += '<div class="pc-panel-empty" style="' + (multiPage ? '' : 'padding-left:16px') + '"><span>No comments yet</span></div>';
      } else {
        pageComments.forEach(function(comment, idx) {
          var number = idx + 1;
          var color = COMMENT_TYPES[comment.type] || COMMENT_TYPES[DEFAULT_TYPE];

          html += '<div class="pc-panel-card" data-pc-card-id="' + comment.id + '" data-pc-card-page="' + page + '">' +
            '<div class="pc-panel-card-badge" style="background:' + color + '">' + number + '</div>' +
            '<div class="pc-panel-card-meta">' +
              '<div class="pc-panel-card-top">' +
                '<span class="pc-panel-card-type">' + comment.type + '</span>' +
                '<span>\u00B7</span>' +
                '<span>' + (comment.author || 'Unknown') + '</span>' +
                '<span>\u00B7</span>' +
                '<span>' + timeAgo(comment.createdAt) + '</span>' +
              '</div>' +
              '<div class="pc-panel-card-text">' + (comment.text ? renderMarkdown(comment.text) : '<em style="color:#9ca3af">(empty)</em>') + '</div>' +
            '</div>' +
          '</div>';
        });
      }

      html += multiPage ? '</div></div>' : '</div>';
    });


    list.innerHTML = html;

    // Bind accordion triggers
    list.querySelectorAll('.pc-accordion-trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        var page = trigger.getAttribute('data-page');
        panelOpenSections[page] = !panelOpenSections[page];
        trigger.classList.toggle('pc-accordion-open');
        var content = trigger.nextElementSibling;
        content.style.display = panelOpenSections[page] ? '' : 'none';
      });
    });

    // Bind card click handlers
    list.querySelectorAll('.pc-panel-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = card.getAttribute('data-pc-card-id');
        var cardPage = card.getAttribute('data-pc-card-page');
        var comment = comments.find(function(c) { return c.id === id; });
        if (!comment) return;

        // Highlight card
        list.querySelectorAll('.pc-panel-card').forEach(function(c) {
          c.classList.remove('pc-card-active');
        });
        card.classList.add('pc-card-active');

        if (cardPage === PAGE_ID) {
          scrollToComment(id);
        } else {
          // Comment belongs to the other view (desktop ↔ mobile frame), which is
          // a separate URL — navigate there and land on the comment via the hash.
          var targetUrl = /-mobile$/.test(cardPage) ? 'frame.html' : (cardPage.replace(/-mobile$/, '') + '.html');
          (window.top || window).location.href = targetUrl + '#pc-comment-' + id;
        }
      });
    });

    updateToggleBadge();
  }

  // === Scroll to comment by ID ===
  function scrollToComment(id) {
    var pin = document.querySelector('.pc-pin[data-pc-comment-id="' + id + '"]');
    var comment = comments.find(function(c) { return c.id === id; });
    if (pin) {
      pin.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pin.classList.add('pc-pin-pulse');
      setTimeout(function() { pin.classList.remove('pc-pin-pulse'); }, 700);
      // Open popover after scroll settles
      if (comment) {
        setTimeout(function() { openPopover(comment); }, 400);
      }
    } else if (comment) {
      openPopover(comment);
    }
  }

  // === Init ===
  // === Dismiss popover on outside click (when not in comment mode) ===
  document.addEventListener('click', function(e) {
    if (!popoverEl || commentMode) return;
    if (e.target.closest('.pc-popover, .pc-pin, .pc-region, .pc-panel, .pc-toggle')) return;
    // Dismiss popover and clean up empty comments
    discardEmptyComment();
    closePopover();
    renderAllPins();
    renderPanelList();
  });

  async function init() {
    // Restore pins visibility from sessionStorage (or demo config default)
    var storedVis = sessionStorage.getItem('pc-pins-visible');
    if (storedVis !== null) pinsVisible = storedVis === '1';

    // Build the chrome IMMEDIATELY (restored from sessionStorage) so the panel
    // and toggle don't pop in after the network fetch — they're there instantly.
    renderToggleButton();
    renderPanel();
    bindKeyboard();

    // Deep link: ?chrome=off triggers pure view mode
    if (new URLSearchParams(window.location.search).get('chrome') === 'off') {
      togglePureViewMode();
    }

    // Re-render pins when async nav content loads (selectors may resolve later)
    document.addEventListener('nav-loaded', function() { renderAllPins(); });
    if (window.__navLoaded) renderAllPins();

    // Now fetch the comments and fill in the pins + panel list
    await loadComments();
    renderAllPins();
    renderPanelList();

    // Check URL hash for comment anchor (e.g. #pc-comment-abc123). When iframed
    // (mobile frame) the anchor is on the TOP url, so read that too.
    var hash = window.location.hash;
    if (hash.indexOf('#pc-comment-') !== 0 && IS_IFRAMED) {
      try { hash = window.top.location.hash || hash; } catch (e) {}
    }
    if (hash.indexOf('#pc-comment-') === 0) {
      var commentId = hash.replace('#pc-comment-', '');
      setTimeout(function() { scrollToComment(commentId); }, 400);
    }
  }

  // Boot when DOM is ready (gated on demo config)
  function boot() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  if (window.__demoConfig) {
    window.__demoConfig.then(function(cfg) {
      if (cfg.comments === false) return;
      if (cfg.commentPins === false) pinsVisible = false;
      boot();
    });
  } else {
    boot();
  }
})();
