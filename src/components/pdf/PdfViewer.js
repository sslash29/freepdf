"use client";
import { useEffect, useState } from "react";

import pdfjs from "@/lib/pdf";

import PdfPage from "./PdfPage";

import { usePdfStore } from "@/store/pdfStore";

export default function PdfViewer() {
  const { pdfFile } = usePdfStore();

  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!pdfFile) return;

    const load = async () => {
      const bytes = await pdfFile.arrayBuffer();

      const loadingTask = pdfjs.getDocument({
        data: bytes,
      });

      const document = await loadingTask.promise;

      setPdf(document);
    };

    load();

  }, [pdfFile]);

  useEffect(() => {
    if (!pdf) return;

    const loadPage = async () => {
      const p = await pdf.getPage(pageNumber);
      setPage(p);
    };

    loadPage();
  }, [pdf, pageNumber]);

  if (!pdf || !page) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-200">

      {/* Toolbar */}

      <div className="flex gap-3 p-4 bg-white shadow text-black">

        <button
          onClick={() =>
            setPageNumber((p) => Math.max(1, p - 1))
          }
        >
          Previous
        </button>

        <span>
          {pageNumber} / {pdf.numPages}
        </span>

        <button
          onClick={() =>
            setPageNumber((p) =>
              Math.min(pdf.numPages, p + 1)
            )
          }
        >
          Next
        </button>

        <button
          onClick={() =>
            setScale((s) => s + 0.2)
          }
        >
          +
        </button>

        <button
          onClick={() =>
            setScale((s) => Math.max(0.4, s - 0.2))
          }
        >
          -
        </button>

      </div>

      {/* PDF */}

      <div className="flex justify-center mt-6">
        <PdfPage
          page={page}
          scale={scale}
        />
      </div>

    </div>
  );
}
