const ExcelJS = require("exceljs");

async function generateEstimateExcel(res, { estimate, clientName }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cloud Solution Estimator";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Cost Estimate");

  sheet.columns = [
    { header: "Service", key: "service", width: 26 },
    { header: "Purpose", key: "purpose", width: 40 },
    { header: "Est. Monthly Cost (USD)", key: "monthly", width: 22 },
    { header: "Est. Annual Cost (USD)", key: "annual", width: 22 },
  ];

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = `Cloud Cost Estimate — ${clientName || "Prospective Client"}`;
  sheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF1F2937" } };
  sheet.insertRow(2, [`Provider: ${estimate.cloud}`, `Scale: ${estimate.scale}`, `Date: ${new Date().toLocaleDateString("en-IN")}`]);
  sheet.insertRow(3, []);

  const headerRow = sheet.getRow(4);
  headerRow.values = ["Service", "Purpose", "Est. Monthly Cost (USD)", "Est. Annual Cost (USD)"];
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    cell.alignment = { vertical: "middle" };
  });

  let rowIdx = 5;
  estimate.lineItems.forEach((item) => {
    const row = sheet.getRow(rowIdx);
    row.values = [item.label, item.desc, item.monthlyCost, Math.round(item.monthlyCost * 12 * 100) / 100];
    row.getCell(3).numFmt = "$#,##0.00";
    row.getCell(4).numFmt = "$#,##0.00";
    rowIdx += 1;
  });

  const totalRow = sheet.getRow(rowIdx + 1);
  totalRow.values = ["", "Total", estimate.monthlyTotal, estimate.annualTotal];
  totalRow.font = { bold: true };
  totalRow.getCell(3).numFmt = "$#,##0.00";
  totalRow.getCell(4).numFmt = "$#,##0.00";

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="cloud-cost-estimate.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateEstimateExcel };
