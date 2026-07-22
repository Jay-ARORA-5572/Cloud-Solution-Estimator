# Cloud Solution Estimator

A small pre-sales toolkit built to replicate the core workflow of a cloud pre-sales
engineer — requirement intake, pricing, discovery, and deal tracking.

**Live demo:** https://cloud-solution-estimator.onrender.com
*(free-tier hosting — spins down after inactivity, so the first load can take ~30-50s to wake up)*

## Features

**Estimator**
- Live cost breakdown as you pick a workload, cloud (AWS/GCP), and scale
- One-page PDF proposal export (requirement summary, cost table, assumptions)
- Excel cost breakdown export
- **Shareable links** — the URL encodes your current selection; copy it and reopen it anywhere
- **Saved estimates** — save a configuration to the browser and reload it later

**AWS vs GCP**
- Side-by-side cost comparison for the same workload, using each provider's recommended
  service set, with a plain-language "X is $Y/mo cheaper" summary

**Discovery Questionnaire**
- Auto-generated discovery checklist per workload (e.g. GenAI Chatbot vs. Healthcare AI ask
  different questions)
- Take notes per question, export as a one-page (or paginated) PDF of call notes

**Deal Tracker**
- Log prospects with workload, estimated monthly cost, and pipeline stage
  (Discovery → Proposal Sent → Won/Lost)
- One click to add the estimate you're currently configuring as a tracked deal
- Persisted in the browser (no backend/database required)

## Why this exists

Built while preparing for a Pre-Sales Engineer internship application, to demonstrate the
actual deliverables that role produces day to day: pricing estimates across AWS and GCP
(including GenAI services like Bedrock, SageMaker, and Vertex AI), discovery questionnaires,
client-facing proposal drafts, and deal tracking.

## Tech stack

- **Frontend:** Angular 17 (standalone components)
- **Backend:** Node.js, Express
- **PDF generation:** [pdfkit](https://github.com/foliojs/pdfkit)
- **Excel generation:** [exceljs](https://github.com/exceljs/exceljs)
- **Persistence:** localStorage for saved estimates and deals (no database — see Notes below)

## Running locally
```bash
npm run build:client   # builds the Angular app
npm install             # installs server dependencies
npm start                # serves everything on http://localhost:4000
```

For frontend development with hot reload:

```bash
cd client && npm install && npm start   # http://localhost:4200
```

### Running tests

```bash
npm test
```

Covers the cost calculation logic in `server/utils/estimate.js` (sum correctness, annual
total math, error handling for bad input, and the AWS-vs-GCP comparison logic) using Node's
built-in test runner — no extra dependencies.

## Project structure

```
server/
  index.js                     # Express entry point — also serves the built Angular app
  routes/api.js                 # /api/catalog, /api/estimate, /api/export/pdf|excel|discovery-pdf
  data/pricing.json              # Per-service monthly pricing at small/medium/large scale
  data/workloads.json            # Workload templates + discovery questions per workload
  utils/estimate.js              # Cost calculation logic
  utils/pdfGenerator.js          # Proposal PDF + discovery call notes PDF
  utils/excelGenerator.js        # Cost breakdown Excel export
client/                        # Angular 17 app (standalone components)
  src/app/
    app.component.ts             # Tab navigation, URL state, saved estimates
    models/                       # estimate, discovery, deal
    services/
      estimator-api.service.ts    # HttpClient calls to the Express API
      url-state.service.ts        # Reads/writes the shareable-link query string
      saved-estimates.service.ts  # localStorage CRUD for saved estimates
      deal-tracker.service.ts     # localStorage CRUD for tracked deals
    components/
      workload-form/               # Client name, workload, cloud/scale, service checklist
      cost-table/                   # Line items + totals
      discovery-questionnaire/      # Per-workload discovery checklist + notes
      deal-tracker/                  # Deal pipeline table
```

## Notes & limitations

- Pricing is a hand-maintained approximation of published AWS/GCP list pricing, not a live
  pricing API integration — kept intentionally simple to scope this as a short build.
- Saved estimates and deals live in the browser's localStorage, not a database — by design,
  to keep this a frontend-heavy portfolio piece rather than a full SaaS product.
- Not affiliated with AWS or Google Cloud; for demonstration purposes only.

## Possible next steps

- Wire up the real AWS Price List API for live, always-current pricing
- Add a GCP Pricing Calculator API integration
- Move saved estimates/deals to a real backend + database
- **Re-add a live architecture diagram** (boxes-and-arrows visualization of selected services,
  both on-screen and in the PDF proposal) — was in an earlier version, removed for scope, and
  is the top candidate for a future pass
- Add draw.io/Lucidchart export for the architecture diagram

## License

MIT
