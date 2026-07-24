"use client";

import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import pdfjs from "@/lib/pdf";
import PdfPage from "./PdfPage";
import Toolbar from "./Toolbar.js";
import { usePdfStore } from "@/store/pdfStore";
import { useToolbarStore } from "@/store/toolbarStore";

export default function PdfViewer() {
  const pdfFile = usePdfStore((state) => state.pdfFile);
  const { tool, setTool } = useToolbarStore((state) => state);

  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [texts, setTexts] = useState([]);

  const handleCanvasClick = (e) => {
    if (!tool) return;

    const pos = e.target.getStage().getPointerPosition();

    setTexts((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: pos.x - 5,
        y: pos.y - 5,
        text: "New text",
      },
    ]);
  };

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

  useEffect(() => {
    const handleEscClick = (e) => {
      if (e.key !== "Escape") return;
      setTool(null);
    };

    window.addEventListener("keydown", handleEscClick);
    return () => window.removeEventListener("keydown", handleEscClick);
  }, [setTool]);

  if (!pdf || !page) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading PDF...
      </div>
    );
  }

  const viewport = page.getViewport({ scale });
  return (
    <div
      className="h-screen bg-gray-200"
      style={{ cursor: tool === "Add Text" ? "copy" : "default" }}
    >
      <Toolbar
        setPageNumber={setPageNumber}
        setScale={setScale}
        pageNumber={pageNumber}
        pdf={pdf}
      />

      <div className="flex justify-center mt-6">
        <div
          className="relative"
          style={{ width: viewport.width, height: viewport.height }}
        >
          <PdfPage page={page} scale={scale} />
          <Stage
            width={viewport.width}
            height={viewport.height}
            className="absolute top-0 left-0 "
            onClick={(e) => handleCanvasClick(e)}
          >
            <Layer>
              {texts.map((item) => (
                <Text
                  key={item.id}
                  x={item.x}
                  y={item.y}
                  text={item.text}
                  fontSize={24}
                  fill="red"
                  draggable
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
