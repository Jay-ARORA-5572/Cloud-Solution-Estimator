const test = require("node:test");
const assert = require("node:assert/strict");
const { computeEstimate, computeComparison } = require("./estimate");

test("computeEstimate sums line item costs correctly", () => {
  const result = computeEstimate({ cloud: "AWS", scale: "medium", services: ["EC2", "S3"] });
  assert.equal(result.lineItems.length, 2);
  assert.equal(result.monthlyTotal, 120 + 20); // EC2 medium + S3 medium
});

test("computeEstimate annualTotal is exactly 12x monthlyTotal", () => {
  const result = computeEstimate({ cloud: "GCP", scale: "small", services: ["ComputeEngine"] });
  assert.equal(result.annualTotal, result.monthlyTotal * 12);
});

test("computeEstimate throws on an unknown cloud provider", () => {
  assert.throws(
    () => computeEstimate({ cloud: "AZURE", scale: "medium", services: ["EC2"] }),
    /Unknown cloud provider/
  );
});

test("computeEstimate throws when no services are selected", () => {
  assert.throws(
    () => computeEstimate({ cloud: "AWS", scale: "medium", services: [] }),
    /At least one service must be selected/
  );
});

test("computeComparison returns both providers and picks the cheaper one", () => {
  const result = computeComparison({ workloadKey: "web-app-migration", scale: "medium" });
  assert.ok(result.aws.monthlyTotal > 0);
  assert.ok(result.gcp.monthlyTotal > 0);
  assert.ok(["AWS", "GCP", "tie"].includes(result.cheaper));
  const expectedDiff = Math.abs(result.aws.monthlyTotal - result.gcp.monthlyTotal);
  assert.equal(result.monthlyDifference, expectedDiff);
});
