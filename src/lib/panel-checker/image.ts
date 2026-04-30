// Resize/compress an uploaded image in the browser before posting it to the
// Pages Function. Reasons:
// - Cuts upload time and Worker memory pressure (12 MB → ~300–600 KB typical).
// - Reduces OpenAI vision processing time and cost.
// - Strips most EXIF metadata (canvas re-encode does not preserve it).
//
// Falls back to the original file if anything goes wrong (e.g. unsupported
// codec like HEIC on a desktop browser, or a synthetic test environment).

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export async function compressImageForUpload(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const dataUrl = await readAsDataUrl(file);
    const img = await loadImage(dataUrl);
    const { width, height } = scaleDownDimensions(
      img.naturalWidth,
      img.naturalHeight,
      MAX_DIMENSION,
    );

    // If the image is already small, skip re-encoding to preserve quality.
    if (
      img.naturalWidth <= MAX_DIMENSION &&
      img.naturalHeight <= MAX_DIMENSION &&
      file.size <= 1.5 * 1024 * 1024
    ) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "panel";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}

function scaleDownDimensions(
  w: number,
  h: number,
  max: number,
): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w >= h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mime, quality);
  });
}
