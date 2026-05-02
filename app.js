/*
Archivo: app.js
Mejora: Capturar UPC compacto en Entradas

Objetivo:
- El botón "Capturar UPC" se reemplaza por una mini ventana de cámara.
- La cámara aparece dentro de la misma línea.
- El botón "Cerrar" apaga la cámara y regresa el botón.
- Solo puede existir un escáner abierto a la vez.

Nota:
- Si tu app ya usa una librería de lectura de códigos como QuaggaJS, ZXing o BarcodeDetector,
  conecta la detección en la función handleInlineUPCDetected(lineId, upcValue).
*/

let activeInlineUPCScanner = {
  lineId: null,
  stream: null
};

async function openInlineUPCScanner(lineId) {
  await closeInlineUPCScanner();

  const slot = document.querySelector(`[data-scanner-slot="${lineId}"]`);
  if (!slot) {
    console.warn("No se encontró el contenedor del escáner para la línea:", lineId);
    return;
  }

  slot.innerHTML = `
    <div class="inline-upc-scanner">
      <video autoplay playsinline muted data-scanner-video="${lineId}"></video>
      <button
        type="button"
        class="inline-upc-scanner__close"
        onclick="closeInlineUPCScanner()"
      >
        Cerrar
      </button>
      <span class="inline-upc-scanner__label">Escaneando UPC</span>
    </div>
  `;

  const video = document.querySelector(`[data-scanner-video="${lineId}"]`);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });

    activeInlineUPCScanner = {
      lineId,
      stream
    };

    video.srcObject = stream;
    await video.play();

    startInlineUPCDetection(lineId, video);
  } catch (error) {
    console.error("No se pudo abrir la cámara:", error);
    restoreInlineUPCButton(lineId);
    alert("No se pudo abrir la cámara. Revisa permisos del navegador.");
  }
}

async function closeInlineUPCScanner() {
  if (activeInlineUPCScanner.stream) {
    activeInlineUPCScanner.stream.getTracks().forEach((track) => track.stop());
  }

  if (activeInlineUPCScanner.lineId) {
    restoreInlineUPCButton(activeInlineUPCScanner.lineId);
  }

  activeInlineUPCScanner = {
    lineId: null,
    stream: null
  };
}

function restoreInlineUPCButton(lineId) {
  const slot = document.querySelector(`[data-scanner-slot="${lineId}"]`);
  if (!slot) return;

  slot.innerHTML = `
    <button
      type="button"
      class="btn-upc-scan"
      onclick="openInlineUPCScanner('${lineId}')"
    >
      Capturar UPC
    </button>
  `;
}

function handleInlineUPCDetected(lineId, upcValue) {
  const upcInput = document.querySelector(`[data-upc-input="${lineId}"]`);

  if (upcInput) {
    upcInput.value = upcValue;
    upcInput.dispatchEvent(new Event("input", { bubbles: true }));
    upcInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  closeInlineUPCScanner();
}

/*
Conectar aquí la librería real de lectura UPC.

Opción moderna:
- BarcodeDetector funciona en algunos navegadores Chromium.
- Para mejor compatibilidad, se recomienda mantener la librería que ya usa tu app
  y mandar el resultado a handleInlineUPCDetected(lineId, codigoDetectado).
*/

function startInlineUPCDetection(lineId, video) {
  if (!("BarcodeDetector" in window)) {
    console.info("BarcodeDetector no está disponible. Conectar aquí QuaggaJS/ZXing si la app ya lo usa.");
    return;
  }

  const detector = new BarcodeDetector({
    formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"]
  });

  const scan = async () => {
    if (activeInlineUPCScanner.lineId !== lineId) return;

    try {
      const codes = await detector.detect(video);

      if (codes && codes.length > 0) {
        const value = codes[0].rawValue;
        if (value) {
          handleInlineUPCDetected(lineId, value);
          return;
        }
      }
    } catch (error) {
      console.warn("Error leyendo UPC:", error);
    }

    requestAnimationFrame(scan);
  };

  requestAnimationFrame(scan);
}
