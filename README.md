# Cloud Solution Estimator

A small pre-sales toolkit built to replicate the core workflow of a cloud pre-sales
engineer — requirement intake, pricing, architecture, and proposal generation in one pass.

Pick a workload, a cloud provider, and a deployment scale, and the app produces:

- A **live architecture diagram** showing how the selected services connect
- A **cost estimate** broken down by service, with monthly and annual totals
- A **one-page PDF proposal** (requirement summary, architecture, cost table, assumptions) —
  formatted like a mini Statement of Work
- An **Excel cost breakdown** for internal review or client sharing

## Why this exists

Built while preparing for a Pre-Sales Engineer internship application, to demonstrate the
actual deliverables that role produces day to day: pricing estimates across AWS and GCP
(including GenAI services like Bedrock, SageMaker, and Vertex AI), architecture diagrams for
migration/GenAI workloads, and client-facing proposal drafts.

## Screenshots

_Add a screenshot of the running app here before sharing the repo._

## Tech stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework — kept deliberately lightweight
  so the whole tool could ship in a few days)
- **Backend:** Node.js, Express
- **PDF generation:** [pdfkit](https://github.com/foliojs/pdfkit)
- **Excel generation:** [exceljs](https://github.com/exceljs/exceljs)

## Running locally

```bash
npm install
npm start
```

Then open `http://localhost:4000`.

## Project structure

```
server/
  index.js              # Express app entry point
  routes/api.js          # /api/catalog, /api/estimate, /api/export/pdf, /api/export/excel
  data/pricing.json       # Per-service monthly pricing at small/medium/large scale
  data/workloads.json     # Workload templates (Web App Migration, GenAI Chatbot, etc.)
  utils/estimate.js       # Cost calculation logic
  utils/pdfGenerator.js   # One-page proposal PDF renderer
  utils/excelGenerator.js # Cost breakdown Excel export
client/
  index.html
  style.css
  app.js                 # Fetches the catalog, renders the form, diagram, and cost table
```

## Notes & limitations

- Pricing is a hand-maintained approximation of published AWS/GCP list pricing, not a live
  pricing API integration — kept intentionally simple to scope this as a short build.
- No database — all state lives in the browser session.
- Not affiliated with AWS or Google Cloud; for demonstration purposes only.

## Possible next steps

- Wire up the real AWS Price List API for live, always-current pricing
- Add a GCP Pricing Calculator API integration
- Support multi-region pricing comparisons
- Add draw.io/Lucidchart export for the architecture diagram

## License

MIT
