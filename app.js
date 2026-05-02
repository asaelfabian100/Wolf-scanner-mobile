const state = {
  activeSection: "dashboard",
  activeScanner: {
    lineId: null,
    stream: null,
    frameRequest: null
  },
  entries: [
    {
      id: "line-1",
      order: "ENT-0001",
      origin: "Proveedor",
      destination: "CEDIS",
      status: "Pendiente",
      upc: "",
      expectedQty: 12,
      confirmedQty: "",
      notes: ""
    },
    {
      id: "line-2",
      order: "ENT-0002",
      origin: "Tienda",
      destination: "Almacén",
      status: "Pendiente",
      upc: "",
      expectedQty: 8,
      confirmedQty: "",
      notes: ""
    },
    {
      id: "line-3",
      order: "ENT-0003",
      origin: "Marketplace",
      destination: "CEDIS",
      status: "Pendiente",
      upc: "",
      expectedQty: 4,
      confirmedQty: "",
      notes: ""
    }
  ]
};

const sectionMeta = {
  dashboard: ["Dashboard", "Resumen general del sistema"],
  entradas: ["Entradas", "Confirmación de órdenes y captura UPC"],
  inventario: ["Inventario", "Vista base de existencias"],
  usuarios: ["Usuarios y permisos", "Administración de roles"],
  configuracion: ["Configuración", "Parámetros base del sistema"]
};

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindActions();
  renderEntries();
  updateMetrics();
});

window.addEventListener("beforeunload", () => {
  stopScannerStream();
});

function bindNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      setActiveSection(section);
    });
  });
}

function bindActions() {
  document.getElementById("addEntryLineBtn").addEventListener("click", addEntryLine);
}

function setActiveSection(section) {
  state.activeSection = section;
  closeInlineUPCScanner();

  document.querySelectorAll(".section").forEach((el) => {
    el.classList.toggle("active", el.id === section);
  });

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.section === section);
  });

  const [title, subtitle] = sectionMeta[section] || sectionMeta.dashboard;
  document.getElementById("sectionTitle").textContent = title;
  document.getElementById("sectionSubtitle").textContent = subtitle;
}

function renderEntries() {
  const tbody = document.getElementById("entriesTableBody");
  tbody.innerHTML = "";

  state.entries.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.dataset.lineId = entry.id;

    tr.innerHTML = `
      <td>
        <input value="${escapeHtml(entry.order)}" data-field="order" data-id="${entry.id}" />
      </td>
      <td>
        <input value="${escapeHtml(entry.origin)}" data-field="origin" data-id="${entry.id}" />
      </td>
      <td>
        <input value="${escapeHtml(entry.destination)}" data-field="destination" data-id="${entry.id}" />
      </td>
      <td>
        <span class="badge ${getStatusClass(entry.status)}" data-status-badge="${entry.id}">
          ${escapeHtml(entry.status)}
        </span>
      </td>
      <td class="scan-cell">
        <div class="upc-scan-slot" data-scanner-slot="${entry.id}">
          ${renderScannerButton(entry.id)}
        </div>
      </td>
      <td>
        <input
          value="${escapeHtml(entry.upc)}"
          inputmode="numeric"
          placeholder="UPC escaneado"
          data-field="upc"
          data-id="${entry.id}"
          data-upc-input="${entry.id}"
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value="${entry.expectedQty}"
          data-field="expectedQty"
          data-id="${entry.id}"
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value="${entry.confirmedQty}"
          placeholder="Cantidad confirmada"
          data-field="confirmedQty"
          data-id="${entry.id}"
          data-confirmed-input="${entry.id}"
        />
      </td>
      <td>
        <textarea
          placeholder="Notas"
          data-field="notes"
          data-id="${entry.id}"
        >${escapeHtml(entry.notes)}</textarea>
      </td>
      <td>
        <div class="actions">
          <button type="button" class="primary-btn" data-confirm="${entry.id}">Confirmar</button>
          <button type="button" class="warning-btn" data-approval="${entry.id}" hidden>Solicitar aprobación</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", onEntryInputChange);
  });

  tbody.querySelectorAll("[data-confirm]").forEach((button) => {
    button.addEventListener("click", () => confirmEntry(button.dataset.confirm));
  });

  tbody.querySelectorAll("[data-approval]").forEach((button) => {
    button.addEventListener("click", () => requestApproval(button.dataset.approval));
  });

  refreshApprovalButtons();
}

function renderScannerButton(lineId) {
  return `
    <button
      type="button"
      class="btn-upc-scan"
      data-open-scanner="${lineId}"
      onclick="openInlineUPCScanner('${lineId}')"
    >
      Capturar UPC
    </button>
  `;
}

function onEntryInputChange(event) {
  const { id, field } = event.target.dataset;
  const entry = state.entries.find((item) => item.id === id);
  if (!entry) return;

  if (field === "expectedQty" || field === "confirmedQty") {
    entry[field] = event.target.value === "" ? "" : Number(event.target.value);
  } else {
    entry[field] = event.target.value;
  }

  refreshEntryStatus(id);
  refreshApprovalButtons();
  updateMetrics();
}

function addEntryLine() {
  const next = state.entries.length + 1;
  state.entries.push({
    id: `line-${Date.now()}`,
    order: `ENT-${String(next).padStart(4, "0")}`,
    origin: "",
    destination: "",
    status: "Pendiente",
    upc: "",
    expectedQty: 0,
    confirmedQty: "",
    notes: ""
  });

  renderEntries();
  updateMetrics();
}

async function openInlineUPCScanner(lineId) {
  await closeInlineUPCScanner();

  const slot = document.querySelector(`[data-scanner-slot="${lineId}"]`);
  if (!slot) return;

  const template = document.getElementById("inlineScannerTemplate");
  const scannerNode = template.content.firstElementChild.cloneNode(true);
  const video = scannerNode.querySelector("video");
  const closeButton = scannerNode.querySelector(".inline-upc-scanner__close");

  closeButton.addEventListener("click", closeInlineUPCScanner);

  slot.innerHTML = "";
  slot.appendChild(scannerNode);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });

    state.activeScanner.lineId = lineId;
    state.activeScanner.stream = stream;
    video.srcObject = stream;
    await video.play();

    startInlineUPCDetection(lineId, video);
  } catch (error) {
    console.error("No se pudo abrir la cámara:", error);
    restoreScannerButton(lineId);
    alert("No se pudo abrir la cámara. Revisa permisos del navegador.");
  }
}

async function closeInlineUPCScanner() {
  const lineId = state.activeScanner.lineId;

  stopScannerStream();

  if (lineId) {
    restoreScannerButton(lineId);
  }

  state.activeScanner.lineId = null;
  state.activeScanner.stream = null;
  state.activeScanner.frameRequest = null;
}

function stopScannerStream() {
  if (state.activeScanner.frameRequest) {
    cancelAnimationFrame(state.activeScanner.frameRequest);
  }

  if (state.activeScanner.stream) {
    state.activeScanner.stream.getTracks().forEach((track) => track.stop());
  }
}

function restoreScannerButton(lineId) {
  const slot = document.querySelector(`[data-scanner-slot="${lineId}"]`);
  if (!slot) return;

  slot.innerHTML = renderScannerButton(lineId);
}

function startInlineUPCDetection(lineId, video) {
  if (!("BarcodeDetector" in window)) {
    console.info("BarcodeDetector no está disponible en este navegador. La captura manual sigue funcionando.");
    return;
  }

  const detector = new BarcodeDetector({
    formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"]
  });

  const scan = async () => {
    if (state.activeScanner.lineId !== lineId) return;

    try {
      const codes = await detector.detect(video);
      if (codes && codes.length > 0 && codes[0].rawValue) {
        handleInlineUPCDetected(lineId, codes[0].rawValue);
        return;
      }
    } catch (error) {
      console.warn("Error leyendo UPC:", error);
    }

    state.activeScanner.frameRequest = requestAnimationFrame(scan);
  };

  state.activeScanner.frameRequest = requestAnimationFrame(scan);
}

function handleInlineUPCDetected(lineId, upcValue) {
  const entry = state.entries.find((item) => item.id === lineId);
  if (entry) {
    entry.upc = upcValue;
  }

  const upcInput = document.querySelector(`[data-upc-input="${lineId}"]`);
  if (upcInput) {
    upcInput.value = upcValue;
    upcInput.dispatchEvent(new Event("input", { bubbles: true }));
    upcInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  closeInlineUPCScanner();

  const confirmedInput = document.querySelector(`[data-confirmed-input="${lineId}"]`);
  if (confirmedInput) confirmedInput.focus();
}

function confirmEntry(lineId) {
  const entry = state.entries.find((item) => item.id === lineId);
  if (!entry) return;

  refreshEntryStatus(lineId);

  if (Number(entry.confirmedQty) !== Number(entry.expectedQty)) {
    alert("Existe diferencia contra cantidad esperada. Solicita aprobación.");
    return;
  }

  entry.status = "Confirmado";
  updateStatusBadge(lineId);
  refreshApprovalButtons();
  updateMetrics();
}

function requestApproval(lineId) {
  const entry = state.entries.find((item) => item.id === lineId);
  if (!entry) return;

  entry.status = "Diferencia";
  updateStatusBadge(lineId);
  refreshApprovalButtons();
  updateMetrics();
  alert("Solicitud de aprobación registrada.");
}

function refreshEntryStatus(lineId) {
  const entry = state.entries.find((item) => item.id === lineId);
  if (!entry) return;

  const expected = Number(entry.expectedQty);
  const confirmed = entry.confirmedQty === "" ? "" : Number(entry.confirmedQty);

  if (confirmed === "") {
    entry.status = "Pendiente";
  } else if (confirmed === expected) {
    entry.status = "Pendiente";
  } else {
    entry.status = "Diferencia";
  }

  updateStatusBadge(lineId);
}

function refreshApprovalButtons() {
  state.entries.forEach((entry) => {
    const button = document.querySelector(`[data-approval="${entry.id}"]`);
    if (!button) return;

    const hasConfirmedQty = entry.confirmedQty !== "";
    const hasDifference = hasConfirmedQty && Number(entry.confirmedQty) !== Number(entry.expectedQty);
    button.hidden = !hasDifference;
  });
}

function updateStatusBadge(lineId) {
  const entry = state.entries.find((item) => item.id === lineId);
  const badge = document.querySelector(`[data-status-badge="${lineId}"]`);
  if (!entry || !badge) return;

  badge.textContent = entry.status;
  badge.className = `badge ${getStatusClass(entry.status)}`;
}

function getStatusClass(status) {
  if (status === "Confirmado") return "done";
  if (status === "Diferencia") return "diff";
  return "pending";
}

function updateMetrics() {
  document.getElementById("metricOrders").textContent = state.entries.length;
  document.getElementById("metricUpcs").textContent = state.entries.filter((entry) => entry.upc).length;
  document.getElementById("metricDiffs").textContent = state.entries.filter((entry) => entry.status === "Diferencia").length;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.openInlineUPCScanner = openInlineUPCScanner;
window.closeInlineUPCScanner = closeInlineUPCScanner;
