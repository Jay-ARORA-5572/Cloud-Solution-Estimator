const PDFDocument = require("pdfkit");

const NAVY = "#1f2937";
const GREY = "#6b7280";
const ACCENT = "#2563eb";
const LIGHT = "#eef2ff";

function money(n) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Draws a simple boxes-and-arrows architecture diagram for the selected services.
 * Returns the y-coordinate immediately below the diagram.
 */
function drawArchitecture(doc, leftX, y, width, lineItems) {
  const boxW = 110;
  const boxH = 46;
  const gap = (width - boxW * lineItems.length) / Math.max(lineItems.length - 1, 1);
  const clampedGap = Math.max(Math.min(gap, 40), 16);
  const totalW = boxW * lineItems.length + clampedGap * (lineItems.length - 1);
  const startX = leftX + (width - totalW) / 2;
  const boxY = y;

  const centers = [];
  lineItems.forEach((item, i) => {
    const bx = startX + i * (boxW + clampedGap);
    doc.roundedRect(bx, boxY, boxW, boxH, 6).fillAndStroke(LIGHT, ACCENT);
    doc
      .fillColor(NAVY)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(item.label, bx + 6, boxY + 10, { width: boxW - 12, align: "center", lineBreak: true });
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor(GREY)
      .text(item.desc, bx + 6, boxY + 24, { width: boxW - 12, align: "center", lineBreak: true });
    centers.push({ y: boxY + boxH / 2, right: bx + boxW, left: bx });
  });

  doc.strokeColor(ACCENT).lineWidth(1.2);
  for (let i = 0; i < centers.length - 1; i++) {
    const a = centers[i];
    const b = centers[i + 1];
    doc.moveTo(a.right, a.y).lineTo(b.left, b.y).stroke();
    doc.moveTo(b.left - 5, b.y - 3).lineTo(b.left, b.y).lineTo(b.left - 5, b.y + 3).stroke();
  }

  // Reset the cursor so subsequent doc.text(...) calls (which read doc.x/doc.y
  // when no explicit position is given) don't inherit the diagram's last x position.
  doc.x = leftX;
  doc.y = boxY + boxH + 14;
  return doc.y;
}

function sectionHeading(doc, leftX, text) {
  doc.x = leftX;
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(ACCENT).text(text, leftX, doc.y);
  doc.x = leftX;
  doc.moveDown(0.2);
}

/**
 * Streams a one-page proposal PDF to the given response.
 */
function generateProposalPdf(res, { estimate, clientName, notes }) {
  const doc = new PDFDocument({ size: "A4", margin: 42 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="cloud-solution-proposal.pdf"');
  doc.pipe(res);

  const leftX = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Header
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text("Cloud Solution Proposal", leftX, doc.y, { align: "left" });
  doc.x = leftX;
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`Prepared for: ${clientName || "Prospective Client"}`, leftX, doc.y);
  doc.x = leftX;
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, leftX, doc.y);

  doc.x = leftX;
  doc.moveDown(0.8);
  doc.strokeColor(ACCENT).lineWidth(1.5).moveTo(leftX, doc.y).lineTo(leftX + pageWidth, doc.y).stroke();
  doc.moveDown(0.8);
  doc.x = leftX;

  // 1. Requirement Summary
  sectionHeading(doc, leftX, "1. Requirement Summary");
  const workloadLabel = estimate.workload ? estimate.workload.label : "Custom Workload";
  const workloadDesc = estimate.workload ? estimate.workload.description : "Custom-scoped cloud workload.";
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111827")
    .text(
      `The client requires a ${estimate.scale}-scale ${workloadLabel.toLowerCase()} deployed on ${estimate.cloud}. ${workloadDesc}`,
      leftX,
      doc.y,
      { width: pageWidth }
    );
  doc.x = leftX;
  doc.moveDown(0.6);

  // 2. Proposed Architecture
  sectionHeading(doc, leftX, "2. Proposed Architecture");
  drawArchitecture(doc, leftX, doc.y + 4, pageWidth, estimate.lineItems);
  doc.moveDown(0.4);
  doc.x = leftX;

  // 3. Cost Estimate table
  sectionHeading(doc, leftX, "3. Estimated Monthly Cost");
  const colService = leftX;
  const colDesc = leftX + 150;
  const colCost = leftX + pageWidth - 90;
  const rowH = 18;
  let ty = doc.y + 2;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY);
  doc.text("Service", colService, ty, { width: 150 });
  doc.text("Purpose", colDesc, ty, { width: colCost - colDesc - 10 });
  doc.text("Est. Monthly", colCost, ty, { width: 90, align: "right" });
  ty += rowH;
  doc.moveTo(leftX, ty - 4).lineTo(leftX + pageWidth, ty - 4).strokeColor("#d1d5db").lineWidth(0.7).stroke();

  doc.font("Helvetica").fontSize(9).fillColor("#111827");
  estimate.lineItems.forEach((item) => {
    doc.text(item.label, colService, ty, { width: 150 });
    doc.text(item.desc, colDesc, ty, { width: colCost - colDesc - 10 });
    doc.text(money(item.monthlyCost), colCost, ty, { width: 90, align: "right" });
    ty += rowH;
  });

  doc.moveTo(leftX, ty).lineTo(leftX + pageWidth, ty).strokeColor("#d1d5db").lineWidth(0.7).stroke();
  ty += 6;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY);
  doc.text("Estimated Monthly Total", colDesc, ty, { width: colCost - colDesc - 10 });
  doc.text(money(estimate.monthlyTotal), colCost, ty, { width: 90, align: "right" });
  ty += rowH;
  doc.font("Helvetica").fontSize(9).fillColor(GREY);
  doc.text("Estimated Annual Total", colDesc, ty, { width: colCost - colDesc - 10 });
  doc.text(money(estimate.annualTotal), colCost, ty, { width: 90, align: "right" });
  ty += rowH + 6;
  doc.x = leftX;
  doc.y = ty;

  // 4. Assumptions
  sectionHeading(doc, leftX, "4. Assumptions & Next Steps");
  doc.font("Helvetica").fontSize(9).fillColor("#111827");
  const bullets = [
    `Pricing reflects a ${estimate.scale} deployment tier and is indicative, not a formal quote.`,
    "Estimate excludes data transfer, support plans, and one-time migration effort.",
    "Final architecture and pricing to be confirmed after a discovery call.",
    notes || "Open items to be captured during the requirements workshop.",
  ];
  bullets.forEach((b) => {
    const by = doc.y;
    doc.circle(leftX + 2, by + 5, 1.4).fill("#111827");
    doc.fillColor("#111827").text(b, leftX + 10, by, { width: pageWidth - 10 });
    doc.x = leftX;
    doc.moveDown(0.15);
  });

  doc.end();
}

/**
 * Streams a discovery call notes PDF: one question per block, with either
 * the supplied notes text or a blank box to fill in by hand. Paginates
 * automatically if the question set runs past one page.
 */
function generateDiscoveryPdf(res, { workloadLabel, clientName, questions }) {
  const doc = new PDFDocument({ size: "A4", margin: 42 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="discovery-call-notes.pdf"');
  doc.pipe(res);

  const leftX = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const bottomLimit = doc.page.height - doc.page.margins.bottom;

  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text("Discovery Call Notes", leftX, doc.y);
  doc.x = leftX;
  doc.fillColor(GREY).font("Helvetica").fontSize(10).text(`Prospect: ${clientName || "Prospective Client"}`, leftX, doc.y);
  doc.x = leftX;
  doc.text(`Workload: ${workloadLabel}`, leftX, doc.y);
  doc.x = leftX;
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, leftX, doc.y);

  doc.x = leftX;
  doc.moveDown(0.7);
  doc.strokeColor(ACCENT).lineWidth(1.5).moveTo(leftX, doc.y).lineTo(leftX + pageWidth, doc.y).stroke();
  doc.moveDown(0.6);
  doc.x = leftX;

  questions.forEach((q, i) => {
    const questionText = `${i + 1}. ${q.question}`;
    const notesText = (q.notes || "").trim();

    // Estimate the block height so we can page-break before it, not mid-block.
    doc.font("Helvetica-Bold").fontSize(10);
    const questionHeight = doc.heightOfString(questionText, { width: pageWidth });
    const notesBoxHeight = notesText ? Math.max(34, doc.font("Helvetica").fontSize(9).heightOfString(notesText, { width: pageWidth - 16 }) + 16) : 34;
    const blockHeight = questionHeight + notesBoxHeight + 18;

    if (doc.y + blockHeight > bottomLimit) {
      doc.addPage();
      doc.x = leftX;
      doc.y = doc.page.margins.top;
    }

    doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY).text(questionText, leftX, doc.y, { width: pageWidth });
    doc.x = leftX;
    doc.moveDown(0.25);

    const boxY = doc.y;
    doc.roundedRect(leftX, boxY, pageWidth, notesBoxHeight, 4).stroke("#d1d5db");
    if (notesText) {
      doc.font("Helvetica").fontSize(9).fillColor("#111827").text(notesText, leftX + 8, boxY + 8, { width: pageWidth - 16 });
    }
    doc.x = leftX;
    doc.y = boxY + notesBoxHeight + 16;
  });

  doc.end();
}

module.exports = { generateProposalPdf, generateDiscoveryPdf };
