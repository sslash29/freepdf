import { create } from "zustand";


export const usePdfStore = create((set) => ({
  pdfFile: null,
  setPdfFile: (file) => set({ pdfFile: file }),
  clearPdf: () => set({ pdfFile: null }),
}));

