"use client";
import { useEffect, useMemo, useState, useRef } from "react";

import { Stage, Layer, Text } from "react-konva";
import pdfjs from "@/lib/pdf";
import PdfPage from "./PdfPage";
import Toolbar from "./Toolbar.js";
import { usePdfStore } from "@/store/pdfStore";
import { useToolbarStore } from "@/store/toolbarStore";
import {
  AUTO_FONT,
  baselineOffset,
  collectDocumentFonts,
  matchTextStyleAt,
} from "@/lib/pdfFont";

const EMPTY_TEXT = {
  isText: false,
  text: "",
  textWeight: "400",
  textColor: "#000000",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: 16,
  italic: false,
  x: 0,
  baselineY: 0,
};

export default function PdfViewer() {
  const pdfFile = usePdfStore((state) => state.pdfFile);
  const { tool, setTool } = useToolbarStore((state) => state);

  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [texts, setTexts] = useState([]);
  const [weightValue, setWeightValue] = useState({
    label: "Regular",
    value: "400",
  });
  const [textValue, setTextValue] = useState(EMPTY_TEXT);
  const [textColor, setTextColor] = useState("#000000");
  const [fontValue, setFontValue] = useState(AUTO_FONT);
  const inputRef = useRef(null);

  const activeTextContent = textContent?.page === page ? textContent.content : null;
  const documentFonts = useMemo(
    () => collectDocumentFonts(page, activeTextContent),
    [page, activeTextContent]
  );

  useEffect(() => {
    if (textValue.isText && inputRef.current) {
      inputRef.current.focus();
    }
  }, [textValue.isText]);

  useEffect(() => {
    if (!page) return;
    let cancelled = false;
    page
      .getTextContent()
      .then((content) => {
        if (!cancelled) setTextContent({ page, content });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleCanvasClick = (e) => {
    if (!tool) return;

    if (tool === "Add Text") {
      const pos = e.target.getStage().getPointerPosition();
      const matched = matchTextStyleAt(
        page,
        activeTextContent,
        scale,
        pos.x,
        pos.y
      );
      setTextValue({
        ...EMPTY_TEXT,
        isText: true,
        textColor: textColor,
        textWeight: weightValue.value,
        fontFamily: fontValue.fontFamily || matched.fontFamily,
        fontSize: matched.fontSize,
        italic: fontValue.fontFamily ? !!fontValue.italic : matched.italic,
        x: matched.x,
        baselineY: matched.baselineY,
      });
    }
  };

  const handleRemoveUserText = (e) => {
    const id = e.target.attrs.id;
    setTexts((prev) => prev.filter((text) => text.id != id));
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
      className="min-h-screen bg-gray-200 pb-10"
      style={{
        cursor:
          tool === "Add Text"
            ? "copy"
            : tool === "Remove Text"
              ? "not-allowed"
              : "default",
      }}
    >
      <Toolbar
        setPageNumber={setPageNumber}
        setScale={setScale}
        pageNumber={pageNumber}
        scale={scale}
        pdf={pdf}
        textColor={textColor}
        setTextColor={setTextColor}
        weightValue={weightValue}
        setWeightValue={setWeightValue}
        fontValue={fontValue}
        setFontValue={setFontValue}
        documentFonts={documentFonts}
      />

      <div className="flex justify-center mt-6">
        <div
          className="relative"
          style={{ width: viewport.width, height: viewport.height }}
        >
          {textValue.isText && (
            <input
              ref={inputRef}
              type="text"
              value={textValue.text}
              onChange={(e) =>
                setTextValue((state) => ({
                  ...state,
                  text: e.target.value,
                }))
              }
              onBlur={() => {
                if (textValue.text.trim() !== "") {
                  setTexts((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      x: textValue.x,
                      baselineY: textValue.baselineY,
                      text: textValue.text,
                      textColor: textValue.textColor,
                      textWeight: textValue.textWeight,
                      fontFamily: textValue.fontFamily,
                      fontSize: textValue.fontSize,
                      italic: textValue.italic,
                    },
                  ]);
                }

                setTextValue(EMPTY_TEXT);
              }}
              style={{
                position: "absolute",
                left: `${textValue.x * scale}px`,
                top: `${
                  textValue.baselineY * scale -
                  baselineOffset(
                    `${textValue.italic ? "italic " : ""}${textValue.textWeight}`,
                    textValue.fontFamily,
                    textValue.fontSize * scale
                  )
                }px`,
                zIndex: 10,
                color: textColor,
                fontFamily: textValue.fontFamily,
                fontSize: `${textValue.fontSize * scale}px`,
                fontWeight: textValue.textWeight,
                fontStyle: textValue.italic ? "italic" : "normal",
                lineHeight: 1,
                padding: 0,
                border: "none",
                background: "transparent",
                outline: `1px dashed ${textColor}`,
                outlineOffset: "2px",
              }}
            />
          )}
          <PdfPage page={page} scale={scale} />
          <Stage
            width={viewport.width}
            height={viewport.height}
            className="absolute top-0 left-0 "
            onClick={(e) => handleCanvasClick(e)}
          >
            <Layer>
              {texts.map((item) => {
                const fontSize = item.fontSize * scale;
                const fontStyle = `${item.italic ? "italic " : ""}${
                  item.textWeight
                }`;
                return (
                  <Text
                    id={String(item.id)}
                    key={item.id}
                    x={item.x * scale}
                    y={
                      item.baselineY * scale -
                      baselineOffset(fontStyle, item.fontFamily, fontSize)
                    }
                    text={item.text}
                    fontSize={fontSize}
                    fontFamily={item.fontFamily}
                    fontStyle={fontStyle}
                    fill={item.textColor}
                    draggable
                    onClick={handleRemoveUserText}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
