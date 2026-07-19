const state = {
  cloud: "AWS",
  scale: "medium",
  workloadKey: null,
  selectedServices: new Set(),
  catalog: { pricing: {}, workloads: {} },
};

const el = {
  clientName: document.getElementById("clientName"),
  workloadSelect: document.getElementById("workloadSelect"),
  workloadHint: document.getElementById("workloadHint"),
  cloudSegmented: document.getElementById("cloudSegmented"),
  scaleSegmented: document.getElementById("scaleSegmented"),
  servicesList: document.getElementById("servicesList"),
  notesInput: document.getElementById("notesInput"),
  architectureDiagram: document.getElementById("architectureDiagram"),
  costTableBody: document.getElementById("costTableBody"),
  monthlyTotal: document.getElementById("monthlyTotal"),
  annualTotal: document.getElementById("annualTotal"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  exportExcelBtn: document.getElementById("exportExcelBtn"),
  statusPill: document.getElementById("statusPill"),
};

function money(n) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function loadCatalog() {
  const res = await fetch("/api/catalog");
  const data = await res.json();
  state.catalog = data;

  el.workloadSelect.innerHTML = Object.entries(data.workloads)
    .map(([key, w]) => `<option value="${key}">${w.label}</option>`)
    .join("");

  const firstKey = Object.keys(data.workloads)[0];
  applyWorkload(firstKey);
}

function applyWorkload(key) {
  state.workloadKey = key;
  el.workloadSelect.value = key;
  const workload = state.catalog.workloads[key];
  el.workloadHint.textContent = workload.description;

  const recommended = workload.recommended[state.cloud] || [];
  state.selectedServices = new Set(recommended);
  renderServices();
  refresh();
}

function renderServices() {
  const services = state.catalog.pricing[state.cloud] || {};
  el.servicesList.innerHTML = Object.entries(services)
    .map(([key, svc]) => {
      const checked = state.selectedServices.has(key);
      return `
        <label class="service-item ${checked ? "checked" : ""}" data-key="${key}">
          <input type="checkbox" data-key="${key}" ${checked ? "checked" : ""} />
          <span class="svc-label">${svc.label}</span>
          <span class="svc-desc">${svc.desc}</span>
        </label>
      `;
    })
    .join("");

  el.servicesList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const key = e.target.dataset.key;
      if (e.target.checked) state.selectedServices.add(key);
      else state.selectedServices.delete(key);
      e.target.closest(".service-item").classList.toggle("checked", e.target.checked);
      refresh();
    });
  });
}

function renderArchitecture(lineItems) {
  if (!lineItems.length) {
    el.architectureDiagram.innerHTML = `<div class="arch-empty">Select at least one service to preview the architecture.</div>`;
    return;
  }
  const cloudClass = state.cloud === "AWS" ? "aws" : "gcp";
  const nodes = lineItems.map(
    (item) => `
      <div class="arch-node ${cloudClass}">
        <div class="arch-label">${item.label}</div>
        <div class="arch-desc">${item.desc}</div>
      </div>`
  );
  el.architectureDiagram.innerHTML = nodes.join('<div class="arch-arrow"></div>');
}

function renderCostTable(estimate) {
  el.costTableBody.innerHTML = estimate.lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.label}</td>
        <td class="svc-desc-cell">${item.desc}</td>
        <td class="num">${money(item.monthlyCost)}</td>
      </tr>`
    )
    .join("");
  el.monthlyTotal.textContent = money(estimate.monthlyTotal);
  el.annualTotal.textContent = money(estimate.annualTotal);
}

function currentPayload() {
  return {
    cloud: state.cloud,
    scale: state.scale,
    services: Array.from(state.selectedServices),
    workloadKey: state.workloadKey,
    clientName: el.clientName.value.trim(),
    notes: el.notesInput.value.trim(),
  };
}

async function refresh() {
  const payload = currentPayload();
  if (payload.services.length === 0) {
    renderArchitecture([]);
    el.costTableBody.innerHTML = "";
    el.monthlyTotal.textContent = money(0);
    el.annualTotal.textContent = money(0);
    el.statusPill.textContent = "Draft";
    return;
  }

  el.statusPill.textContent = "Calculating…";
  try {
    const res = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Estimate failed");
    const estimate = await res.json();
    renderArchitecture(estimate.lineItems);
    renderCostTable(estimate);
    el.statusPill.textContent = "Ready";
  } catch (err) {
    el.statusPill.textContent = "Error";
    console.error(err);
  }
}

function setupSegmented(container, dataAttr, onSelect) {
  container.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onSelect(btn.dataset[dataAttr]);
    });
  });
}

async function downloadExport(endpoint, filename) {
  const payload = currentPayload();
  if (payload.services.length === 0) {
    alert("Select at least one service before exporting.");
    return;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    alert("Export failed. Please try again.");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Event wiring
el.workloadSelect.addEventListener("change", (e) => applyWorkload(e.target.value));

setupSegmented(el.cloudSegmented, "cloud", (cloud) => {
  state.cloud = cloud;
  const workload = state.catalog.workloads[state.workloadKey];
  state.selectedServices = new Set(workload.recommended[cloud] || []);
  renderServices();
  refresh();
});

setupSegmented(el.scaleSegmented, "scale", (scale) => {
  state.scale = scale;
  refresh();
});

el.notesInput.addEventListener("input", () => {}); // notes only matter at export time
el.clientName.addEventListener("input", () => {});

el.exportPdfBtn.addEventListener("click", () => downloadExport("/api/export/pdf", "cloud-solution-proposal.pdf"));
el.exportExcelBtn.addEventListener("click", () => downloadExport("/api/export/excel", "cloud-cost-estimate.xlsx"));

loadCatalog();
