/**
 * PDF → Seitenbilder im Browser (nur im Cockpit geladen). Jede Seite wird einzeln gezeichnet und danach freigegeben –
 * sonst stößt Safari bei 30+ Seiten an seine Canvas-Grenze.
 */
export interface RenderedPage {
  n: number;
  total: number;
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

/** WebP, wo der Browser es erzeugen kann (Chrome, Firefox, Android) – Safari liefert sonst PNG, dort JPEG. */
export function pickFormat(): "webp" | "jpg" {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  return c.toDataURL("image/webp").startsWith("data:image/webp") ? "webp" : "jpg";
}

async function loadPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}

export async function pdfPageCount(file: File) {
  const doc = await loadPdf(file);
  const n = doc.numPages;
  await doc.loadingTask.destroy();
  return n;
}

function toBlob(canvas: HTMLCanvasElement, format: "webp" | "jpg", quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Bild konnte nicht erzeugt werden"))), format === "webp" ? "image/webp" : "image/jpeg", quality),
  );
}

function scaled(source: HTMLCanvasElement, width: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = Math.round((source.height / source.width) * width);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

export async function* renderPdfPages(file: File, opts: { format: "webp" | "jpg"; fullWidth: number; thumbWidth: number; from?: number }): AsyncGenerator<RenderedPage> {
  const doc = await loadPdf(file);
  try {
    for (let n = opts.from ?? 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const viewport = page.getViewport({ scale: opts.fullWidth / page.getViewport({ scale: 1 }).width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport }).promise;
      const thumbCanvas = scaled(canvas, opts.thumbWidth);
      const [full, thumb] = await Promise.all([toBlob(canvas, opts.format, 0.82), toBlob(thumbCanvas, opts.format, 0.8)]);
      yield { n, total: doc.numPages, full, thumb, width: canvas.width, height: canvas.height };
      page.cleanup();
      canvas.width = canvas.height = thumbCanvas.width = thumbCanvas.height = 0;
    }
  } finally {
    await doc.loadingTask.destroy();
  }
}
