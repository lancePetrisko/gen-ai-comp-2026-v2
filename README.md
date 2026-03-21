# Community Health Event Request System

A proof of concept web app that replaces a shared inbox + spreadsheet workflow with an AI assisted platform for managing community health event and material requests.

**2026 University of Utah Generative AI Competition** — Lance Petrisko, Samuel Rawls, Cohen Phillips

## Quick Start

No server, no dependencies. Clone and open in a browser:

```bash
git clone https://github.com/yourusername/gen-ai-comp-2026-v2.git
open index.html
```

Ships with 12 pre-loaded demo requests. Demo credentials are pre-filled on all login pages.

## Pages

- **Intake Form** (`index.html`) — Public request submission with demo auto-fill
- **User Portal** (`pages/user-login.html`) — Requestors check their status, view assigned staff, see location on a map
- **Admin Dashboard** (`pages/login.html`) — Operations console with request queue, AI suggestions, planning, reporting, assets, staff management, and providers

## AI Features (Simulated)

All client-side, no API calls:

- **Auto-categorization** from event descriptions (School Event, Community Outreach, Health Education, etc.)
- **Priority scoring** based on attendance, timing, request type, and staffing needs
- **Fulfillment routing** — Staff Deployment, Mail, or Pickup based on service area and request type
- **Geographic service area** checks via ZIP code lookup
- **NLP insights** — detects health screenings, bilingual needs, outdoor events, etc.

Admins can override any AI suggestion.

## Tech Stack

Vanilla HTML, CSS, and JavaScript only. Data persists via `localStorage`. Charts rendered with Canvas API. Maps via Google Maps embed.

## Reset Demo Data

```js
localStorage.clear()
// then reload the page
```
