import pdfjs from "@/lib/pdf";

const FALLBACK_FAMILY = "Helvetica, Arial, sans-serif";
const FALLBACK_FONT_SIZE = 16;

let measureContext = null;
const offsetCache = new Map();

function getMeasureContext() {
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  return measureContext;
}

function normalizeFontFamily(fontFamily) {
  return fontFamily
    .split(",")
    .map((family) => {
      const trimmed = family.trim();
      const hasSpace = trimmed.indexOf(" ") >= 0;
      const hasQuotes = trimmed.indexOf('"') >= 0 || trimmed.indexOf("'") >= 0;
      return hasSpace && !hasQuotes ? `"${trimmed}"` : trimmed;
    })
    .join(", ");
}

function toFontStyle(fontObj) {
  const parts = [];
  if (fontObj.italic) parts.push("italic");
  if (fontObj.black) parts.push("900");
  else if (fontObj.bold) parts.push("bold");
  return parts.length ? parts.join(" ") : "normal";
}

export function baselineOffset(fontStyle, fontFamily, fontSize) {
  const font = `${fontStyle} normal ${fontSize}px ${normalizeFontFamily(
    fontFamily
  )}`;
  const cached = offsetCache.get(font);
  if (cached !== undefined) return cached;

  const context = getMeasureContext();
  context.font = font;
  const metrics = context.measureText("M");
  const ascent =
    metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent ?? 0;
  const descent =
    metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent ?? 0;
  const offset = (ascent - descent) / 2 + fontSize / 2;

  offsetCache.set(font, offset);
  return offset;
}

export const STANDARD_FONTS = [
  { id: "helvetica", label: "Helvetica", fontFamily: "Helvetica, Arial, sans-serif" },
  { id: "times", label: "Times", fontFamily: '"Times New Roman", Times, serif' },
  { id: "courier", label: "Courier", fontFamily: '"Courier New", Courier, monospace' },
  { id: "georgia", label: "Georgia", fontFamily: "Georgia, serif" },
  { id: "verdana", label: "Verdana", fontFamily: "Verdana, Geneva, sans-serif" },
];

export const AUTO_FONT = {
  id: "auto",
  label: "Match document",
  fontFamily: null,
};

function prettyFontName(fontObj) {
  const raw = fontObj.name || fontObj.loadedName || "";
  const cleaned = raw
    .replace(/^[A-Z]{6}\+/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return cleaned || fontObj.loadedName || "Unnamed font";
}

export function collectDocumentFonts(page, textContent) {
  if (!page || !textContent?.items?.length) return [];

  const byLabel = new Map();
  for (const item of textContent.items) {
    const fontName = item.fontName;
    if (!fontName || !item.str?.trim()) continue;
    if (!page.commonObjs?.has(fontName)) continue;

    const fontObj = page.commonObjs.get(fontName);
    if (!fontObj?.loadedName) continue;

    const label = prettyFontName(fontObj);
    if (byLabel.has(label)) continue;

    byLabel.set(label, {
      id: fontName,
      label,
      fontFamily: `${fontObj.loadedName}, ${fontObj.fallbackName || "sans-serif"}`,
      italic: !!fontObj.italic,
    });
  }

  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function matchTextStyleAt(page, textContent, scale, pointerX, pointerY) {
  const x = pointerX / scale;
  const y = pointerY / scale;
  const fallback = {
    fontFamily: FALLBACK_FAMILY,
    fontSize: FALLBACK_FONT_SIZE,
    italic: false,
    x,
    baselineY: y,
  };

  if (!page || !textContent?.items?.length) return fallback;

  const viewport = page.getViewport({ scale: 1 });
  let best = null;
  let bestDistance = Infinity;

  for (const item of textContent.items) {
    if (!item.transform || !item.str?.trim()) continue;

    const tx = pdfjs.Util.transform(viewport.transform, item.transform);
    const height = Math.hypot(tx[2], tx[3]);
    if (!height) continue;

    const left = tx[4];
    const right = left + (item.width || 0);
    const baselineY = tx[5];
    const dx = x < left ? left - x : x > right ? x - right : 0;
    const dy = y - baselineY;
    const distance = Math.hypot(dx, dy * 3);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = { item, height, baselineY, dx, dy };
    }
  }

  if (!best) return fallback;

  const fontName = best.item.fontName;
  const fontObj =
    fontName && page.commonObjs?.has(fontName)
      ? page.commonObjs.get(fontName)
      : null;
  const styleFamily = textContent.styles?.[fontName]?.fontFamily;

  const fontFamily = fontObj?.loadedName
    ? `${fontObj.loadedName}, ${fontObj.fallbackName || styleFamily || "sans-serif"}`
    : styleFamily || FALLBACK_FAMILY;

  const snapped =
    Math.abs(best.dy) <= best.height && best.dx <= best.height * 6;

  return {
    fontFamily,
    fontSize: best.height,
    italic: fontObj ? toFontStyle(fontObj).includes("italic") : false,
    x,
    baselineY: snapped ? best.baselineY : y,
  };
}
