"use client";

import { usePdfStore } from "@/store/pdfStore";

export default function UploadArea() {
  const setPdfFile = usePdfStore((state) => state.setPdfFile);

  function handleChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF.");
      return;
    }

    setPdfFile(file);
  }

  return (
    <label className="cursor-pointer border-2 border-dashed p-20 rounded-xl">
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      Click to upload a PDF
    </label>
  );
}
