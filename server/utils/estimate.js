const pricing = require("../data/pricing.json");
const workloads = require("../data/workloads.json");

const VALID_SCALES = ["small", "medium", "large"];

/**
 * Validates and computes a cost breakdown for the given inputs.
 * @param {string} cloud - "AWS" | "GCP"
 * @param {string} scale - "small" | "medium" | "large"
 * @param {string[]} services - service keys to include
 * @param {string} [workloadKey] - optional workload template key
 * @returns {{ cloud, scale, workload, lineItems, monthlyTotal, annualTotal }}
 */
function computeEstimate({ cloud, scale, services, workloadKey }) {
  if (!pricing[cloud]) {
    throw new Error(`Unknown cloud provider: ${cloud}`);
  }
  if (!VALID_SCALES.includes(scale)) {
    throw new Error(`Unknown scale: ${scale}`);
  }
  if (!Array.isArray(services) || services.length === 0) {
    throw new Error("At least one service must be selected");
  }

  const catalog = pricing[cloud];
  const lineItems = services.map((key) => {
    const svc = catalog[key];
    if (!svc) throw new Error(`Unknown service "${key}" for ${cloud}`);
    return {
      key,
      label: svc.label,
      desc: svc.desc,
      monthlyCost: svc[scale],
    };
  });

  const monthlyTotal = lineItems.reduce((sum, item) => sum + item.monthlyCost, 0);

  const workload = workloadKey && workloads[workloadKey]
    ? { key: workloadKey, ...workloads[workloadKey] }
    : null;

  return {
    cloud,
    scale,
    workload,
    lineItems,
    monthlyTotal,
    annualTotal: Math.round(monthlyTotal * 12 * 100) / 100,
  };
}

/**
 * Computes an AWS estimate and a GCP estimate for the same workload/scale,
 * using each provider's recommended service set, so the two sides are a
 * fair apples-to-apples comparison rather than whatever services the user
 * happens to have manually toggled on one side.
 */
function computeComparison({ workloadKey, scale }) {
  const workload = workloads[workloadKey];
  if (!workload) {
    throw new Error(`Unknown workload "${workloadKey}"`);
  }

  const aws = computeEstimate({
    cloud: "AWS",
    scale,
    services: workload.recommended.AWS,
    workloadKey,
  });
  const gcp = computeEstimate({
    cloud: "GCP",
    scale,
    services: workload.recommended.GCP,
    workloadKey,
  });

  const diff = Math.round((aws.monthlyTotal - gcp.monthlyTotal) * 100) / 100;
  const cheaper = diff === 0 ? "tie" : diff > 0 ? "GCP" : "AWS";

  return { workload: { key: workloadKey, ...workload }, scale, aws, gcp, cheaper, monthlyDifference: Math.abs(diff) };
}

module.exports = { computeEstimate, computeComparison, VALID_SCALES };
