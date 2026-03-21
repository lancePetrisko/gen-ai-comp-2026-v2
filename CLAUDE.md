# CLAUDE.md

## Project Overview

Community Health Event Request System — a proof-of-concept web app for a Gen AI competition (2026). Two-part system: a public intake form and an admin dashboard for reviewing, routing, and tracking event/material requests.

## Tech Stack

- **Vanilla HTML, CSS, JavaScript only** — no frameworks, no libraries, no build tools, no external dependencies
- Runs by opening `index.html` directly in a browser (no server required)
- Data persistence via `localStorage` (cross-page sync between intake and dashboard)

## File Structure

```
├── index.html                  ← Intake Form (landing page)
├── assets/
│   └── logos/                  ← Tab icons (favicons) and navbar logos
├── pages/
│   ├── login.html              ← Demo admin login (pre-filled credentials, no real auth)
│   ├── dashboard.html          ← Admin Dashboard (separate page)
│   ├── user-login.html         ← User portal login (select a demo requestor)
│   └── user-dashboard.html     ← User Dashboard (read-only view of user's requests)
├── css/
│   ├── variables.css           ← Design tokens & CSS custom properties
│   ├── base.css                ← Reset, typography, body
│   ├── navbar.css              ← Shared navigation bar
│   ├── components.css          ← Buttons, badges, modal, toast
│   ├── forms.css               ← Intake form, fieldsets, inputs, confirmation
│   ├── dashboard.css           ← Dashboard layout, cards, queue, detail panel, tabs
│   └── responsive.css          ← Media queries / breakpoints
├── js/
│   ├── store.js                ← Global data store (localStorage sync)
│   ├── helpers.js              ← Shared utilities (escHtml, formatDate, badges, toast)
│   ├── ai.js                   ← AI simulation engine + processNewRequest()
│   ├── intake.js               ← Intake page logic (demo loader, validation, submit)
│   ├── dashboard.js            ← Dashboard page logic (queue, filters, detail, planning, reporting, assets)
│   ├── user-dashboard.js        ← User dashboard logic (read-only, status tracker, staff display)
│   ├── charts.js               ← Canvas chart rendering (donut + bar)
│   └── data/
│       ├── demo-requests.js    ← 12 demo request scenarios + DEMO_SELECT_OPTIONS
│       └── assets.js           ← Asset inventory data (7 categories)
```

## Architecture Notes

- **No build step.** Each HTML page includes its own `<script>` tags in dependency order. Shared globals (Store, AI, helpers) are loaded first.
- **Navigation** between pages uses plain `<a>` links (not SPA routing).
- **Store.save() / Store.load()** serializes `requests[]` and `nextId` to localStorage so data persists across pages and reloads.
- **seedDemoDataIfNeeded()** runs on both pages — if localStorage is empty, it populates 12 demo requests with varied statuses.
- **AI simulation** (`js/ai.js`) runs entirely client-side with regex/heuristic logic — no real API calls.

## Conventions

- CSS uses BEM-lite class names and CSS custom properties (defined in `variables.css`)
- JS uses plain functions (no classes, no modules) since there's no bundler
- All script load order matters — `store.js` → `helpers.js` → `ai.js` → data files → page-specific JS
- Dashboard page paths reference parent with `../` (e.g., `../css/variables.css`, `../js/store.js`)

## Common Tasks

- **Add a new demo request:** Edit `js/data/demo-requests.js`, add to `DEMO_REQUESTS` array and `DEMO_SELECT_OPTIONS`
- **Add a new asset category:** Edit `js/data/assets.js`, add to `ASSETS` array
- **Add a new filter dimension:** Add `<select>` in `pages/dashboard.html` filters section, wire it in `initFilters()` and `applyFilters()` in `js/dashboard.js`
- **Add a new status:** Update the status `<select>` options in both `dashboard.html` and `js/dashboard.js` `renderDetailPanel()`, add badge class in `css/components.css`, add to `statusBadge()` in `js/helpers.js`
- **Reset demo data:** Clear localStorage (`localStorage.clear()` in console) and reload
