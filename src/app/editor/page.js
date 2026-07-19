"use client";

import { useState } from "react";
import UploadArea from "@/components/editor/UploadArea";
import PdfViewer from "@/components/pdf/PdfViewer";
import { usePdfStore } from "@/store/pdfStore";

export default function EditorPage() {
  const pdfFile = usePdfStore((state) => state.pdfFile);
  const [showUpload, setShowUpload] = useState(false);

  if (pdfFile) {
    return <PdfViewer />;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      {showUpload ? (
        <UploadArea />
      ) : (
        <button
          onClick={() => setShowUpload(true)}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white"
        >
          Upload PDF
        </button>
      )}
    </div>
  );
}
