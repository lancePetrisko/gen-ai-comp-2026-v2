# Community Health Event Request System

A proof-of-concept web application that replaces a shared inbox + spreadsheet workflow with a smarter, AI-assisted operational platform for managing community health event and material requests.

**Built for the 2026 Generative AI Competition** by Lance Petrisko, Samuel Rawls, and Cohen Phillips.

---

## What It Does

This system digitizes the end-to-end lifecycle of community health event requests:

1. **Requestors** submit event support, material, or staffing requests through a clean intake form
2. The system **automatically categorizes, prioritizes, and routes** each request using AI-simulated logic
3. **Administrators** review, edit, approve, or deny requests from an operations dashboard
4. **Requestors** can log in to check the real-time status of their submissions

The prototype simulates what a production system would look like if integrated with Microsoft workflows, Qualtrics, inventory systems, and staffing calendars.

---

## Live Demo

No server required. Clone the repo and open `index.html` in any browser.

```bash
git clone https://github.com/yourusername/gen-ai-comp-2026-v2.git
cd gen-ai-comp-2026-v2
open index.html
```

The app ships with **12 pre-loaded demo requests** spanning school wellness fairs, church outreach events, hospital programs, rural toolkit requests, high-attendance galas, and out-of-service-area scenarios.

---

## Pages & User Flows

### Intake Form (`index.html`)
The public-facing request form. Users fill out event details, select materials, and submit. A "Load demo request" dropdown auto-fills the form with realistic scenarios for presentation purposes. After submission, users see a confirmation screen with their request ID.

### User Portal (`pages/user-login.html` &rarr; `pages/user-dashboard.html`)
Requestors sign in by selecting their name from a dropdown and see a read-only dashboard showing:
- Summary cards (Total, Pending, Approved, Fulfilled, Denied)
- A table of their submitted requests
- Full-page expanded detail view with:
  - Visual status progress tracker (Submitted &rarr; In Review &rarr; Approved &rarr; Fulfilled)
  - Embedded Google Maps pin for the event location
  - Assigned staff members (simulated)
  - AI routing info and team notes

### Admin Dashboard (`pages/login.html` &rarr; `pages/dashboard.html`)
The operations console for administrators. Includes:
- **Summary cards** with clickable filters (Total, New, In Review, Approved, Fulfilled, Denied, Upcoming)
- **Request Queue** &mdash; searchable, filterable, sortable table with 6 filter dimensions
- **Detail Panel** with AI suggestions, admin override controls, status updates, and event invite generation
- **Planning Tab** &mdash; upcoming events timeline, staffing demand bars, mail fulfillment queue
- **Reporting Tab** &mdash; interactive donut charts (status, category, fulfillment, service area) with click-through drilldowns, plus a weekly workload bar chart
- **Assets Tab** &mdash; inventory of materials organized by category (printed materials, giveaway kits, AV equipment, screening supplies, etc.)
- **Management Tab** &mdash; staff directory with availability, skills, and ratings
- **Providers Tab** &mdash; resupply alerts and bulk supplier directory

---

## AI / Automation Features (Simulated)

All AI features run client-side with heuristic logic &mdash; no external API calls:

| Feature | How It Works |
|---|---|
| **Auto-Categorization** | Regex/keyword matching on event descriptions to classify as School Event, Community Outreach, Health Education, Fundraising, etc. |
| **Priority Scoring** | Weighted score based on attendance size, days until event, request type, and staffing needs |
| **Fulfillment Recommendation** | Logic combining service area, request type, and preferred method to suggest Staff Deployment, Mail, or Pickup |
| **Geographic Service Area** | ZIP code lookup against a defined set of in-area, borderline, and out-of-area codes |
| **NLP Description Insights** | Keyword detection for health screenings, vaccinations, nutrition, mental health, bilingual needs, outdoor events |
| **Smart Tagging** | Auto-generated tags for audience type, large events, multi-material requests, staffing requirements |
| **Staffing Recommendation** | Attendance-based suggestion for number of staff to deploy |

Admins can override any AI suggestion manually.

---

## Tech Stack

- **HTML, CSS, JavaScript only** &mdash; no frameworks, libraries, or build tools
- **localStorage** for cross-page data persistence
- **Canvas API** for donut and bar charts
- **Google Maps embed** for location display (no API key required)
- Fully functional offline &mdash; just open in a browser

---

## Project Structure

```
gen-ai-comp-2026-v2/
├── index.html                      # Intake Form (landing page)
├── README.md
├── CLAUDE.md                       # AI assistant context file
├── assets/
│   └── logos/                      # Favicons and navbar logos
├── pages/
│   ├── login.html                  # Admin login (pre-filled demo credentials)
│   ├── dashboard.html              # Admin Dashboard
│   ├── user-login.html             # User portal login (select a requestor)
│   └── user-dashboard.html         # User Dashboard (read-only)
├── css/
│   ├── variables.css               # Design tokens & CSS custom properties
│   ├── base.css                    # Reset, typography, footer
│   ├── navbar.css                  # Shared navigation bar
│   ├── components.css              # Buttons, badges, modal, toast, chart tooltips
│   ├── forms.css                   # Intake form styles
│   ├── dashboard.css               # Dashboard layout, queue, detail panel, tabs
│   └── responsive.css              # Mobile breakpoints
├── js/
│   ├── store.js                    # Global data store (localStorage sync)
│   ├── helpers.js                  # Shared utilities (formatting, badges, toast)
│   ├── ai.js                       # AI simulation engine
│   ├── intake.js                   # Intake form logic
│   ├── dashboard.js                # Admin dashboard logic
│   ├── user-dashboard.js           # User dashboard logic
│   ├── charts.js                   # Canvas chart rendering (donut + bar)
│   ├── minimap.js                  # Admin detail panel map
│   ├── management.js               # Staff management tab
│   └── data/
│       ├── demo-requests.js        # 12 demo request scenarios
│       ├── assets.js               # Asset inventory (7 categories)
│       ├── staff.js                # Staff directory data
│       └── providers.js            # Supplier/provider data
```

---

## Demo Scenarios

The app includes 12 pre-built demo requests covering a range of real-world scenarios:

| Scenario | Type | Attendance | Service Area |
|---|---|---|---|
| School Wellness Fair | Staffing + Materials | 320 | In Area |
| Church Health Sunday | Staffed Event | 150 | In Area |
| Hospital Employee Wellness | Materials (Pickup) | 500 | In Area |
| Rural County Health Resource Day | Toolkit (Mail) | 75 | Out of Area |
| Fundraising Gala | Staffing + Materials | 650 | In Area |
| Summer Health & Fitness Festival | Staffing + Materials | 1,200 | In Area |
| Out-of-State Health Summit | Materials (Mail) | 200 | Out of Area |
| Youth Mental Health Day (YMCA) | Staffed Event | 180 | In Area |
| Senior Medicare Workshop | Materials (Pickup) | 45 | In Area |
| Back to School Block Party | Staffing + Materials | 800 | In Area |
| Diabetes Prevention Walk | Staffed Event | 250 | In Area |
| Student Health & Safety Expo | Staffing + Materials | 400 | Out of Area |

---

## Request Statuses

Requests move through visible workflow stages:

**Submitted** &rarr; **In Review** &rarr; **Approved** &rarr; **Sent to Qualtrics** &rarr; **Fulfilled**

Requests can also be marked as **Denied** at any stage.

---

## Resetting Demo Data

The app seeds demo data into `localStorage` on first load. To reset:

1. Open your browser's developer console
2. Run `localStorage.clear()`
3. Reload the page

---

## Design Principles

- **Accessible**: Good color contrast, visible focus states, ARIA labels, semantic HTML
- **Responsive**: Works on laptop screens and tablets
- **Realistic**: Designed to look like a production operations tool, not a school project
- **Presentation-ready**: Demo loaders, pre-filled credentials, and polished UI for live demos

---

## Future Integration Points

This prototype is designed to eventually connect with:

- Microsoft Power Automate / SharePoint workflows
- Qualtrics survey and feedback systems
- Inventory and fulfillment management systems
- Staffing calendars and scheduling tools
- Reporting and analytics dashboards

---

## Built With

This project was built with the assistance of generative AI tools as part of the 2026 Gen AI Competition.

**Team**: Lance Petrisko, Samuel Rawls, Cohen Phillips
