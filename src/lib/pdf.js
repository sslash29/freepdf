import * as pdfjsLib from "pdfjs-dist";

// Tell PDF.js where the worker is.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default pdfjsLib;
