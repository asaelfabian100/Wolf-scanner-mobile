const DEMO_USERS = [
  {
    email: "admin@wolf.com",
    password: "admin123",
    name: "Superadmin",
    role: "Superadmin"
  }
];

const state = {
  activeSection: "dashboard",
  nextOrderSequence: 1,
  activeScanner: {
    lineId: null,
    stream: null,
    frameRequest: null
  },
  currentUser: null,
  entryDraft: {
    internalId: "",
    lines: []
  },
  orders: []
};

const sectionMeta = {
  dashboard: ["Dashboard", "Resumen general del sistema"],
  entradas: ["Entradas", "Generación de órdenes desde México"],
  confirmaciones: ["Confirmaciones de órdenes", "Recepción y validación contra cantidades esperadas"],
  inventario: ["Inventario", "Vista base de existencias"],
  usuarios: ["Usuarios y permisos", "Administración de roles"],
  configuracion: ["Configuración", "Parámetros base del sistema"]
};

document.addEventListener("DOMContentLoaded", () => {
  bindAuth();
  bindNavigation();
  bindActions();
  initializeDraft();
  restoreSession();
  renderEntryLines();
  renderConfirmations();
  updateMetrics();
});

window.addEventListener("beforeunload", () => {
  stopScannerStream();
});

function bindAuth() {
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const user = DEMO_USERS.find((item) => item.email === email && item.password === password);

    if (!user) {
      document.getElementById("loginError").hidden = false;
      return;
    }

    document.getElementById("loginError").hidden = true;
    setSession(user);
  });
}

function setSession(user) {
  state.currentUser = {
    email: user.email,
    name: user.name,
    role: user.role
  };

  sessionStorage.setItem("wicSession", JSON.stringify(state.currentUser));

  document.getElementById("currentUserName").textContent = state.currentUser.name;
  document.getElementById("currentUserEmail").textContent = state.currentUser.email;

  document.getElementById("loginView").hidden = true;
  document.getElementById("appView").hidden = false;
}

function restoreSession() {
  const saved = sessionStorage.getItem("wicSession");

  if (!saved) {
    document.getElementById("loginView").hidden = false;
    document.getElementById("appView").hidden = true;
    return;
  }

  try {
    const user = JSON.parse(saved);
    setSession(user);
  } catch {
    sessionStorage.removeItem("wicSession");
    document.getElementById("loginView").hidden = false;
    document.getElementById("appView").hidden = true;
  }
}

function logout() {
  closeInlineUPCScanner();
  sessionStorage.removeItem("wicSession");
  state.currentUser = null;

  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").hidden = true;
  document.getElementById("appView").hidden = true;
  document.getElementById("loginView").hidden = false;
  document.getElementById("loginEmail").focus();
}

function bindNavigation() {
  document.querySelectorAll(".nav-item[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSection(button.dataset.section);
    });
  });
}

function bindActions() {
  document.getElementById("addEntryLineBtn").addEventListener("click", addEntryLine);
  document.getElementById("captureEntryOrderBtn").addEventListener("click", captureEntryOrder);
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

function initializeDraft() {
  state.entryDraft.internalId = generateInternalFolio();
  state.entryDraft.lines = [
    createDraftLine(),
    createDraftLine()
  ];

  document.getElementById("entryInternalId").value = state.entryDraft.internalId;
}

function generateInternalFolio() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(state.nextOrderSequence).padStart(4, "0");
  return `WIC-${y}${m}${d}-${seq}`;
}

function safeRandomId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function createDraftLine() {
  return {
    id: safeRandomId("draft"),
    upc: "",
    expectedQty: ""
  };
}

function setActiveSection(section) {
  state.activeSection = section;
  closeInlineUPCScanner();

  document.querySelectorAll(".section").forEach((el) => {
    el.classList.toggle("active", el.id === section);
  });

  document.querySelectorAll(".nav-item[data-section]").forEach((el) => {
    el.classList.toggle("active", el.dataset.section === section);
  });

  const [title, subtitle] = sectionMeta[section] || sectionMeta.dashboard;
  document.getElementById("sectionTitle").textContent = title;
  document.getElementById("sectionSubtitle").textContent = subtitle;
}

function renderEntryLines() {
  const tbody = document.getElementById("entryLinesBody");
  tbody.innerHTML = "";

  state.entryDraft.lines.forEach((line) => {
    const tr = document.createElement("tr");
    tr.dataset.lineId = line.id;

    tr.innerHTML = `
      <td class="scan-cell">
        <div class="upc-scan-slot" data-scanner-slot="${line.id}">
          ${renderScannerButton(line.id)}
        </div>
      </td>
      <td>
        <input
          value="${escapeHtml(line.upc)}"
          inputmode="numeric"
          placeholder="UPC escaneado"
          data-draft-field="upc"
          data-id="${line.id}"
          data-upc-input="${line.id}"
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value="${escapeHtml(line.expectedQty)}"
          placeholder="Cantidad esperada"
          data-draft-field="expectedQty"
          data-id="${line.id}"
        />
      </td>
      <td>
        <button type="button" class="danger-btn" data-remove-line="${line.id}">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-draft-field]").forEach((input) => {
    input.addEventListener("input", onDraftLineChange);
  });

  tbody.querySelectorAll("[data-remove-line]").forEach((button) => {
    button.addEventListener("click", () => removeDraftLine(button.dataset.removeLine));
  });
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

function onDraftLineChange(event) {
  const { id, draftField } = event.target.dataset;
  const line = state.entryDraft.lines.find((item) => item.id === id);
  if (!line) return;

  line[draftField] = draftField === "expectedQty"
    ? event.target.value === "" ? "" : Number(event.target.value)
    : event.target.value;
}

function addEntryLine() {
  state.entryDraft.lines.push(createDraftLine());
  renderEntryLines();
}

function removeDraftLine(lineId) {
  if (state.entryDraft.lines.length === 1) {
    alert("Debe existir al menos una línea en la orden.");
    return;
  }

  state.entryDraft.lines = state.entryDraft.lines.filter((line) => line.id !== lineId);
  renderEntryLines();
}

function captureEntryOrder() {
  closeInlineUPCScanner();

  const mexicoOrderNumber = document.getElementById("entryOrderNumber").value.trim();
  const origin = document.getElementById("entryOrigin").value.trim();
  const destination = document.getElementById("entryDestination").value.trim();

  if (!mexicoOrderNumber) {
    alert("Captura el número de orden México.");
    return;
  }

  if (!origin || !destination) {
    alert("Captura origen y destino.");
    return;
  }

  const cleanLines = state.entryDraft.lines
    .filter((line) => String(line.upc).trim() || line.expectedQty !== "")
    .map((line) => ({
      id: safeRandomId("confirm"),
      upc: String(line.upc).trim(),
      expectedQty: Number(line.expectedQty || 0),
      confirmedUpc: "",
      confirmedQty: "",
      notes: "",
      status: "Pendiente"
    }));

  if (cleanLines.length === 0) {
    alert("Agrega al menos un UPC y cantidad esperada.");
    return;
  }

  const invalidLine = cleanLines.find((line) => !line.upc || line.expectedQty <= 0);
  if (invalidLine) {
    alert("Todas las líneas deben tener UPC y cantidad esperada mayor a cero.");
    return;
  }

  const order = {
    id: state.entryDraft.internalId,
    mexicoOrderNumber,
    origin,
    destination,
    status: "Pendiente",
    createdAt: new Date().toISOString(),
    lines: cleanLines
  };

  state.orders.unshift(order);
  state.nextOrderSequence += 1;

  resetEntryDraft();
  renderConfirmations();
  updateMetrics();
  setActiveSection("confirmaciones");
}

function resetEntryDraft() {
  document.getElementById("entryOrderNumber").value = "";
  document.getElementById("entryOrigin").value = "México";
  document.getElementById("entryDestination").value = "Colombia";

  state.entryDraft.internalId = generateInternalFolio();
  state.entryDraft.lines = [createDraftLine(), createDraftLine()];

  document.getElementById("entryInternalId").value = state.entryDraft.internalId;
  renderEntryLines();
}

function renderConfirmations() {
  const container = document.getElementById("confirmationsContainer");
  container.innerHTML = "";

  if (state.orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No hay órdenes por confirmar.</strong>
        <span>Las órdenes capturadas en Entradas aparecerán aquí.</span>
      </div>
    `;
    return;
  }

  state.orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";

    card.innerHTML = `
      <div class="order-card__header">
        <div class="order-meta">
          <span>Orden México</span>
          <strong>${escapeHtml(order.mexicoOrderNumber)}</strong>
        </div>
        <div class="order-meta">
          <span>Origen</span>
          <strong>${escapeHtml(order.origin)}</strong>
        </div>
        <div class="order-meta">
          <span>Destino</span>
          <strong>${escapeHtml(order.destination)}</strong>
        </div>
        <div class="order-meta">
          <span>Estado</span>
          <strong><span class="badge ${getStatusClass(order.status)}" data-order-status="${order.id}">${escapeHtml(order.status)}</span></strong>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Captura UPC</th>
              <th>UPC recibido</th>
              <th>Cantidad esperada</th>
              <th>Cantidad confirmada</th>
              <th>Notas</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${order.lines.map((line) => renderConfirmationLine(line)).join("")}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll("[data-confirm-field]").forEach((input) => {
    input.addEventListener("input", onConfirmationLineChange);
  });

  container.querySelectorAll("[data-confirm-line]").forEach((button) => {
    button.addEventListener("click", () => confirmLine(button.dataset.confirmLine));
  });

  container.querySelectorAll("[data-authorize-line]").forEach((button) => {
    button.addEventListener("click", () => requestAuthorization(button.dataset.authorizeLine));
  });

  refreshAuthorizationButtons();
}

function renderConfirmationLine(line) {
  const receivedUpcValue = line.confirmedUpc || line.upc;

  return `
    <tr data-confirmation-line="${line.id}">
      <td class="scan-cell">
        <div class="upc-scan-slot" data-scanner-slot="${line.id}">
          ${renderScannerButton(line.id)}
        </div>
      </td>
      <td>
        <input
          value="${escapeHtml(receivedUpcValue)}"
          inputmode="numeric"
          placeholder="UPC recibido"
          data-confirm-field="confirmedUpc"
          data-line-id="${line.id}"
          data-upc-input="${line.id}"
        />
      </td>
      <td>
        <input value="${line.expectedQty}" readonly />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value="${escapeHtml(line.confirmedQty)}"
          placeholder="Cantidad confirmada"
          data-confirm-field="confirmedQty"
          data-line-id="${line.id}"
          data-confirmed-input="${line.id}"
        />
      </td>
      <td>
        <textarea
          placeholder="Notas"
          data-confirm-field="notes"
          data-line-id="${line.id}"
        >${escapeHtml(line.notes)}</textarea>
      </td>
      <td>
        <div class="actions">
          <button type="button" class="primary-btn" data-confirm-line="${line.id}">Confirmar</button>
          <button type="button" class="warning-btn" data-authorize-line="${line.id}" hidden>Solicitar autorización</button>
        </div>
      </td>
    </tr>
  `;
}

function onConfirmationLineChange(event) {
  const { lineId, confirmField } = event.target.dataset;
  const line = findConfirmationLine(lineId);
  if (!line) return;

  line[confirmField] = confirmField === "confirmedQty"
    ? event.target.value === "" ? "" : Number(event.target.value)
    : event.target.value;

  refreshLineStatus(lineId);
  refreshAuthorizationButtons();
  updateParentOrderStatuses();
  updateMetrics();
}

function confirmLine(lineId) {
  const line = findConfirmationLine(lineId);
  if (!line) return;

  if (line.confirmedQty === "") {
    alert("Captura la cantidad confirmada.");
    return;
  }

  if (Number(line.confirmedQty) !== Number(line.expectedQty)) {
    alert("Existe diferencia contra la cantidad esperada. Solicita autorización.");
    line.status = "Diferencia";
  } else {
    line.status = "Confirmado";
  }

  updateParentOrderStatuses();
  renderConfirmations();
  updateMetrics();
}

function requestAuthorization(lineId) {
  const line = findConfirmationLine(lineId);
  if (!line) return;

  line.status = "Diferencia";
  updateParentOrderStatuses();
  renderConfirmations();
  updateMetrics();
  alert("Solicitud de autorización registrada.");
}

function refreshLineStatus(lineId) {
  const line = findConfirmationLine(lineId);
  if (!line) return;

  if (line.confirmedQty === "") {
    line.status = "Pendiente";
  } else if (Number(line.confirmedQty) === Number(line.expectedQty)) {
    line.status = "Pendiente";
  } else {
    line.status = "Diferencia";
  }
}

function refreshAuthorizationButtons() {
  state.orders.forEach((order) => {
    order.lines.forEach((line) => {
      const button = document.querySelector(`[data-authorize-line="${line.id}"]`);
      if (!button) return;

      const hasConfirmedQty = line.confirmedQty !== "";
      const hasDifference = hasConfirmedQty && Number(line.confirmedQty) !== Number(line.expectedQty);
      button.hidden = !hasDifference;
    });
  });
}

function updateParentOrderStatuses() {
  state.orders.forEach((order) => {
    const hasDifference = order.lines.some((line) => line.status === "Diferencia");
    const allConfirmed = order.lines.every((line) => line.status === "Confirmado");

    if (hasDifference) order.status = "Diferencia";
    else if (allConfirmed) order.status = "Confirmado";
    else order.status = "Pendiente";
  });
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
  const draftLine = state.entryDraft.lines.find((line) => line.id === lineId);
  if (draftLine) {
    draftLine.upc = upcValue;
  }

  const confirmationLine = findConfirmationLine(lineId);
  if (confirmationLine) {
    confirmationLine.confirmedUpc = upcValue;
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

function findConfirmationLine(lineId) {
  for (const order of state.orders) {
    const line = order.lines.find((item) => item.id === lineId);
    if (line) return line;
  }

  return null;
}

function updateMetrics() {
  const totalLines = state.orders.reduce((sum, order) => sum + order.lines.length, 0);
  const totalDiffs = state.orders.reduce(
    (sum, order) => sum + order.lines.filter((line) => line.status === "Diferencia").length,
    0
  );

  document.getElementById("metricOrders").textContent = state.orders.length;
  document.getElementById("metricUpcs").textContent = totalLines;
  document.getElementById("metricDiffs").textContent = totalDiffs;
}

function getStatusClass(status) {
  if (status === "Confirmado") return "done";
  if (status === "Diferencia") return "diff";
  return "pending";
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
