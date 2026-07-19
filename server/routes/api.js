const express = require("express");
const router = express.Router();

const pricing = require("../data/pricing.json");
const workloads = require("../data/workloads.json");
const { computeEstimate } = require("../utils/estimate");
const { generateProposalPdf } = require("../utils/pdfGenerator");
const { generateEstimateExcel } = require("../utils/excelGenerator");

// GET /api/catalog - pricing catalog + workload templates, for populating the form
router.get("/catalog", (req, res) => {
  res.json({ pricing, workloads });
});

// POST /api/estimate - compute a cost breakdown
router.post("/estimate", (req, res) => {
  try {
    const { cloud, scale, services, workloadKey } = req.body;
    const estimate = computeEstimate({ cloud, scale, services, workloadKey });
    res.json(estimate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/export/pdf - stream a one-page proposal PDF
router.post("/export/pdf", (req, res) => {
  try {
    const { cloud, scale, services, workloadKey, clientName, notes } = req.body;
    const estimate = computeEstimate({ cloud, scale, services, workloadKey });
    generateProposalPdf(res, { estimate, clientName, notes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/export/excel - stream an .xlsx cost breakdown
router.post("/export/excel", async (req, res) => {
  try {
    const { cloud, scale, services, workloadKey, clientName } = req.body;
    const estimate = computeEstimate({ cloud, scale, services, workloadKey });
    await generateEstimateExcel(res, { estimate, clientName });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
