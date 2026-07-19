"use client";

import { useEffect, useRef } from "react";

export default function PdfPage({ page, scale }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!page) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderTask = page.render({
      canvasContext: context,
      viewport,
    });

    renderTask.promise.catch((err) => {
      if (err?.name !== "RenderingCancelledException") {
        console.error(err);
      }
    });

    return () => {
      renderTask.cancel();
    };
  }, [page, scale]);

  return <canvas ref={canvasRef} className="shadow-lg bg-white" />;
}
