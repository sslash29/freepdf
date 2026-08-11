"use client";
import { useEffect, useRef } from "react";

export default function PdfPage({ page, scale }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!page) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const viewport = page.getViewport({ scale });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const renderTask = page.render({
      canvasContext: context,
      viewport,
      transform: dpr === 1 ? null : [dpr, 0, 0, dpr, 0, 0],
    });
    renderTask.promise.catch((err) => {
      if (err?.name !== "RenderingCancelledException") console.error(err);
    });
    return () => renderTask.cancel();
  }, [page, scale]);

  return <canvas ref={canvasRef} className="shadow-lg bg-white cursor-text" />;
}
