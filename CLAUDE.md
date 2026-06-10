# TA Itineraries — Claude Code Context

## Project

Pixel-accurate HTML/CSS replica of a **Travel Alberta** itinerary detail page, built from Figma designs in the file **TA-26-1099 | Maps Everywhere** (file key: `vTnlWwl3Ip0hDRpoNm38GJ`, page: `↳ Itineraries`, frame node: `10699:19236`).

Live site: https://jordan-eh.github.io/ta-itineraries/

## File Structure

| File | Purpose |
|---|---|
| `index.html` | All HTML structure |
| `styles.css` | All CSS — no preprocessor, plain CSS custom properties |
| `server.js` | Zero-dep Node.js dev server (`node server.js` → `http://localhost:3000`) |

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
| Content padding (most sections) | `112px` (CSS var `--content-pad`) |
| Content padding (discover/kbyg/footer) | `214px` (CSS var `--wide-pad`) |
| Primary font | Futura PT → Outfit (Google Fonts fallback) |

## Page Sections (top → bottom)

1. **Nav** — White, 100px tall. Dark red logo block, main + secondary links.
2. **Breadcrumb + H1 + Hero** — H1 at 47.8px bold, full-width hero image placeholder.
3. **Intro** — 2-col (557px left / 524px right). Left: headline, body, best-for box, at-a-glance mint card. Right: map with SVG route + "Expand map" pill button.
4. **Map + Itinerary** — 2-col. Left: 5 day panels (Day 1 open, Days 2–5 collapsed). Right: sticky map.
5. **Discover more** — 3-card grid at 214px padding. Cards with "X DAYS" red badge.
6. **Know before you go** — Mint bg, 214px padding, 3×2 teal icon link grid.
7. **Footer** — Dark navy, 214px padding. Logo, 4 link columns, teal "Back to Top" button.

## Figma Reference Node IDs

| Section | Node ID |
|---|---|
| Full page frame | `10699:19236` |
| Intro section | `10699:19257` |
| Day 1 panel | `10699:19323` |
| Day 2 panel | `10699:19366` |
| Activities container | `10699:19344` |
| Discover/KBYG/Footer group | `10699:19545` |
| Activity card | `10699:19551` |

## Coding Conventions

- **No build tools.** Plain HTML + CSS only — no Sass, no bundler, no framework.
- **No JavaScript yet.** Interactions (accordion, carousel, map expand) are next steps.
- **Pixel values from Figma are exact.** Absolute line-heights (e.g. `26.22px`) come directly from Figma's pixel measurements — do not convert to relative ratios without checking.
- **CSS custom properties** are defined in `:root` in `styles.css` — use them for all repeated values.
- **No comments** unless the why is non-obvious (hidden constraint, Figma quirk, etc.).

## Next Steps

- [ ] Add JavaScript interactions: accordion open/close, image carousel, map expand modal
- [ ] Replace all placeholder images/colors with real photography
- [ ] Sticky nav behaviour on scroll
- [ ] Mobile/responsive breakpoints
