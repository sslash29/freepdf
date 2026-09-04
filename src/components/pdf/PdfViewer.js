"use client";
import { useEffect, useMemo, useState, useRef } from "react";

import {
  Stage,
  Layer,
  Rect,
  Ellipse,
  Line,
  Text,
  Transformer,
} from "react-konva";
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
import combinePdfTransforms from "@/lib/combinedPdfTransforms";
const EMPTY_TEXT = {
  isText: false,
  type: "userText",
  text: "",
  textWeight: "400",
  textColor: "#000000",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: 16,
  italic: false,
  x: 0,
  baselineY: 0,
};
const DEFAULT_SHAPE_WIDTH = 150;
const DEFAULT_SHAPE_HEIGHT = 80;
const SHAPE_STROKE_WIDTH = 3;

export default function PdfViewer() {
  const pdfFile = usePdfStore((state) => state.pdfFile);
  const { tool, setTool } = useToolbarStore((state) => state);

  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfPage, setPdfPage] = useState(null);
  const [pageTextContent, setPageTextContent] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [userTexts, setUserTexts] = useState([]);
  const [userShapes, setUserShapes] = useState([]);
  const [textMaskRects, setTextMaskRects] = useState([]);
  const [shapeType, setShapeType] = useState("rect");
  const [shapeFilled, setShapeFilled] = useState(true);
  const [rawSelectedShapeId, setSelectedShapeId] = useState(null);
  const [fontWeightOption, setFontWeightOption] = useState({
    label: "Regular",
    value: "400",
  });
  const [activeTextInput, setActiveTextInput] = useState(EMPTY_TEXT);
  const [textColor, setTextColor] = useState("#000000");
  const [fontOption, setFontOption] = useState(AUTO_FONT);
  const inputRef = useRef(null);
  const shapeNodeRefs = useRef({});
  const transformerRef = useRef(null);
  
  const activeTextContent =
    pageTextContent?.page === pdfPage ? pageTextContent.content : null;
  
  useEffect(() => {
    console.log(activeTextContent)
  }, [activeTextContent])

  const documentFonts = useMemo(
    () => collectDocumentFonts(pdfPage, activeTextContent),
    [pdfPage, activeTextContent],
  );
  const pageUserTexts = useMemo(
    () => userTexts.filter((item) => item.page === pageNumber),
    [userTexts, pageNumber],
  );
  const pageUserShapes = useMemo(
    () => userShapes.filter((shape) => shape.page === pageNumber),
    [userShapes, pageNumber],
  );
  const pageTextMaskRects = useMemo(
    () => textMaskRects.filter((mask) => mask.page === pageNumber),
    [textMaskRects, pageNumber],
  );
  const selectedShapeId = pageUserShapes.some(
    (shape) => shape.id === rawSelectedShapeId,
  )
    ? rawSelectedShapeId
    : null;

  useEffect(() => {
    if (activeTextInput.isText && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTextInput.isText]);

  useEffect(() => {
    if (!pdfPage) return;
    let cancelled = false;
    pdfPage
      .getTextContent()
      .then((pageContent) => {
        if (!cancelled)
          setPageTextContent({ page: pdfPage, content: pageContent });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pdfPage]);

  useEffect(() => {
    const node = selectedShapeId
      ? shapeNodeRefs.current[selectedShapeId]
      : null;
    if (!transformerRef.current) return;
    transformerRef.current.nodes(node ? [node] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedShapeId, pageUserShapes]);

  useEffect(() => {
    const handleDeleteKeyDown = (e) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedShapeId) return;
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      setUserShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
      setSelectedShapeId(null);
    };

    window.addEventListener("keydown", handleDeleteKeyDown);
    return () => window.removeEventListener("keydown", handleDeleteKeyDown);
  }, [selectedShapeId]);

  const handleCanvasClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedShapeId(null);
    }
    if (!tool) return;
    const pos = e.target.getStage().getPointerPosition();

    if (tool === "Add Text") {
      const matchedStyle = matchTextStyleAt(
        pdfPage,
        activeTextContent,
        scale,
        pos.x,
        pos.y,
      );
      setActiveTextInput({
        ...EMPTY_TEXT,
        isText: true,
        textColor: textColor,
        textWeight: fontWeightOption.value,
        fontFamily: fontOption.fontFamily || matchedStyle.fontFamily,
        fontSize: matchedStyle.fontSize,
        italic: fontOption.fontFamily
          ? !!fontOption.italic
          : matchedStyle.italic,
        x: matchedStyle.x,
        baselineY: matchedStyle.baselineY,
      });
    } else if (tool === "Add Shape") {
      const id = Date.now();
      setUserShapes((prev) => [
        ...prev,
        {
          id,
          page: pageNumber,
          type: shapeType,
          x: pos.x / scale,
          y: pos.y / scale,
          width: DEFAULT_SHAPE_WIDTH,
          height: DEFAULT_SHAPE_HEIGHT,
          rotation: 0,
          filled: shapeFilled,
          color: textColor,
        },
      ]);
      setSelectedShapeId(id);
    }
  };

  const handleRemoveUserText = (e) => {
    if (tool !== "Remove Text") return;
    const id = e.target.attrs.id;
    setUserTexts((prev) => prev.filter((text) => text.id != id));
  };

  const handleShapeClick = (shapeId) => (e) => {
    e.cancelBubble = true;
    if (tool === "Remove Text") {
      setUserShapes((prev) => prev.filter((s) => s.id !== shapeId));
      setSelectedShapeId((current) => (current === shapeId ? null : current));
      return;
    }
    setSelectedShapeId(shapeId);
  };

  const handleShapeDragEnd = (shapeId) => (e) => {
    const node = e.target;
    setUserShapes((prev) =>
      prev.map((shape) =>
        shape.id === shapeId
          ? { ...shape, x: node.x() / scale, y: node.y() / scale }
          : shape,
      ),
    );
  };

  const handleShapeTransformEnd = (shapeId) => (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    setUserShapes((prev) =>
      prev.map((shape) =>
        shape.id === shapeId
          ? {
              ...shape,
              x: node.x() / scale,
              y: node.y() / scale,
              width: Math.max(5, shape.width * scaleX),
              height: Math.max(5, shape.height * scaleY),
              rotation: node.rotation(),
            }
          : shape,
      ),
    );
  };

  useEffect(() => {
    if (!pdfFile) return;
    const load = async () => {
      const bytes = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: bytes,
      });
      const loadedDocument = await loadingTask.promise;
      setPdfDocument(loadedDocument);
    };
    load();
  }, [pdfFile]);

  useEffect(() => {
    if (!pdfDocument) return;
    const loadPage = async () => {
      const loadedPage = await pdfDocument.getPage(pageNumber);
      setPdfPage(loadedPage);
    };
    loadPage();
  }, [pdfDocument, pageNumber]);

  useEffect(() => {
    const handleEscKeyDown = (e) => {
      if (e.key !== "Escape") return;
      setTool(null);
      setSelectedShapeId(null);
    };

    window.addEventListener("keydown", handleEscKeyDown);
    return () => window.removeEventListener("keydown", handleEscKeyDown);
  }, [setTool]);

  if (!pdfDocument || !pdfPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading PDF...
      </div>
    );
  }

  const viewport = pdfPage.getViewport({ scale });
  return (
    <div
      className="min-h-screen bg-gray-200 pb-10"
      style={{
        cursor:
          tool === "Add Text"
            ? "copy"
            : tool === "Add Shape"
              ? "crosshair"
              : tool === "Edit Text"
                ? "text"
                : tool === "Move Text"
                  ? "grab"
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
        pdf={pdfDocument}
        textColor={textColor}
        setTextColor={setTextColor}
        weightValue={fontWeightOption}
        setWeightValue={setFontWeightOption}
        fontValue={fontOption}
        setFontValue={setFontOption}
        documentFonts={documentFonts}
        shapeType={shapeType}
        setShapeType={setShapeType}
        shapeFilled={shapeFilled}
        setShapeFilled={setShapeFilled}
      />

      <div className="flex justify-center mt-6">
        <div
          className="relative"
          style={{ width: viewport.width, height: viewport.height }}
        >
          {activeTextInput.isText && (
            <input
              ref={inputRef}
              type="text"
              value={activeTextInput.text}
              onChange={(e) =>
                setActiveTextInput((state) => ({
                  ...state,
                  text: e.target.value,
                }))
              }
              onBlur={() => {
                if (activeTextInput.text.trim() !== "") {
                  setUserTexts((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      page: pageNumber,
                      x: activeTextInput.x,
                      baselineY: activeTextInput.baselineY,
                      text: activeTextInput.text,
                      textColor: activeTextInput.textColor,
                      textWeight: activeTextInput.textWeight,
                      fontFamily: activeTextInput.fontFamily,
                      fontSize: activeTextInput.fontSize,
                      italic: activeTextInput.italic,
                      type:"userText"
                    },
                  ]);
                }

                setActiveTextInput(EMPTY_TEXT);
              }}
              style={{
                position: "absolute",
                left: `${activeTextInput.x * scale}px`,
                top: `${
                  activeTextInput.baselineY * scale -
                  baselineOffset(
                    `${activeTextInput.italic ? "italic " : ""}${activeTextInput.textWeight}`,
                    activeTextInput.fontFamily,
                    activeTextInput.fontSize * scale,
                  )
                }px`,
                zIndex: 10,
                color: textColor,
                fontFamily: activeTextInput.fontFamily,
                fontSize: `${activeTextInput.fontSize * scale}px`,
                fontWeight: activeTextInput.textWeight,
                fontStyle: activeTextInput.italic ? "italic" : "normal",
                lineHeight: 1,
                padding: 0,
                border: "none",
                background: "transparent",
                outline: `1px dashed ${textColor}`,
                outlineOffset: "2px",
                fieldSizing: "content",
              }}
            />
          )}
          <PdfPage page={pdfPage} scale={scale} />
          <Stage
            width={viewport.width}
            height={viewport.height}
            className="absolute top-0 left-0 "
            onClick={(e) => handleCanvasClick(e)}
          >
            <Layer>
              {pageTextMaskRects.map((mask) => (
                <Rect
                  key={mask.id}
                  x={mask.x * scale}
                  y={mask.y * scale}
                  width={mask.width * scale}
                  height={mask.height * scale}
                  fill="#ffffff"
                  listening={false}
                />
              ))}
              {pageUserShapes.map((shape) => {
                const centerX = shape.x * scale;
                const centerY = shape.y * scale;
                const width = shape.width * scale;
                const height = shape.height * scale;
                const fill = shape.filled ? shape.color : "transparent";
                const stroke = shape.filled ? undefined : shape.color;
                const strokeWidth = shape.filled ? 0 : SHAPE_STROKE_WIDTH;
                const shapeRef = (node) => {
                  if (node) shapeNodeRefs.current[shape.id] = node;
                };
                const commonProps = {
                  ref: shapeRef,
                  rotation: shape.rotation || 0,
                  fill,
                  stroke,
                  strokeWidth,
                  draggable: true,
                  onClick: handleShapeClick(shape.id),
                  onTap: handleShapeClick(shape.id),
                  onDragEnd: handleShapeDragEnd(shape.id),
                  onTransformEnd: handleShapeTransformEnd(shape.id),
                };

                if (shape.type === "ellipse") {
                  return (
                    <Ellipse
                      key={shape.id}
                      {...commonProps}
                      x={centerX}
                      y={centerY}
                      radiusX={width / 2}
                      radiusY={height / 2}
                    />
                  );
                }

                if (shape.type === "triangle") {
                  return (
                    <Line
                      key={shape.id}
                      {...commonProps}
                      x={centerX}
                      y={centerY}
                      points={[
                        0,
                        -height / 2,
                        width / 2,
                        height / 2,
                        -width / 2,
                        height / 2,
                      ]}
                      closed
                    />
                  );
                }

                return (
                  <Rect
                    key={shape.id}
                    {...commonProps}
                    x={centerX}
                    y={centerY}
                    width={width}
                    height={height}
                    offsetX={width / 2}
                    offsetY={height / 2}
                  />
                );
              })}
              {selectedShapeId && (
                <Transformer ref={transformerRef} rotateEnabled />
              )}
              {pageUserTexts.map((item) => {
                const fontSize = item.fontSize * scale;
                const fontStyle = `${item.italic ? "italic " : ""}${
                  item.textWeight
                }`;
                const yOffset = baselineOffset(
                  fontStyle,
                  item.fontFamily,
                  fontSize,
                );
                return (
                  <Text
                    id={String(item.id)}
                    key={item.id}
                    x={item.x * scale}
                    y={item.baselineY * scale - yOffset}
                    text={item.text}
                    fontSize={fontSize}
                    fontFamily={item.fontFamily}
                    fontStyle={fontStyle}
                    fill={item.textColor}
                    draggable
                    onClick={handleRemoveUserText}
                    onDragEnd={(e) => {
                      const node = e.target;
                      setUserTexts((prev) =>
                        prev.map((t) =>
                          t.id === item.id
                            ? {
                                ...t,
                                x: node.x() / scale,
                                baselineY: (node.y() + yOffset) / scale,
                              }
                            : t,
                        ),
                      );
                    }}
                  />
                );
              })}
              {activeTextContent?.items.map((item, idx) => {
                if (!item.str?.trim()) return null; // skip whitespace-only items
                const combinedTransform = combinePdfTransforms(
                  viewport.transform,
                  item.transform,
                );
                const fontSize = Math.hypot(
                  combinedTransform[2],
                  combinedTransform[3],
                );

                const style = activeTextContent.styles?.[item.fontName];
                const fontAscent = style?.ascent
                  ? style.ascent * fontSize
                  : style?.descent
                    ? (1 + style.descent) * fontSize
                    : fontSize;

                return (
                  <Text
                    key={idx}
                    x={combinedTransform[4]}
                    y={combinedTransform[5] - fontAscent}
                    text={item.str}
                    fontSize={fontSize}
                    fontFamily="sans-serif" // only used to size the hit box, never rendered
                    fill="#000000" // required for the shape to register on Konva's hit graph
                    opacity={0} // invisible on screen, still hit-testable
                    listening={true}
                    onClick={(e) => {
                      if (tool !== "Edit Text" && tool !== "Move Text") return;
                      e.cancelBubble = true; // due to konva not having .stopPropagation()
                      const matchedStyle = matchTextStyleAt(
                        pdfPage,
                        activeTextContent,
                        scale,
                        combinedTransform[4], // x coordinate
                        combinedTransform[5] - fontAscent, // y coordinate
                      );
                      setTextMaskRects((prev) => [
                        ...prev,
                        {
                          id: `mask-${idx}-${Date.now()}`,
                          page: pageNumber,
                          x: combinedTransform[4] / scale,
                          y: (combinedTransform[5] - fontAscent) / scale,
                          width: item.width || 0,
                          height: fontSize / scale,
                        },
                      ]);

                      if (tool === "Edit Text") {
                        setActiveTextInput({
                          ...EMPTY_TEXT,
                          text: item.str,
                          isText: true,
                          textColor: textColor,
                          textWeight: fontWeightOption.value,
                          fontFamily:
                            fontOption.fontFamily || matchedStyle.fontFamily,
                          fontSize: matchedStyle.fontSize,
                          italic: fontOption.fontFamily
                            ? !!fontOption.italic
                            : matchedStyle.italic,
                          x: matchedStyle.x,
                          baselineY: matchedStyle.baselineY,
                        });
                      } else {
                        // Move Text: skip the editable input entirely — drop the
                        // original string straight into userTexts as a draggable node.
                        setUserTexts((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            page: pageNumber,
                            x: matchedStyle.x,
                            baselineY: matchedStyle.baselineY,
                            text: item.str,
                            textColor: textColor,
                            textWeight: fontWeightOption.value,
                            fontFamily:
                              fontOption.fontFamily || matchedStyle.fontFamily,
                            fontSize: matchedStyle.fontSize,
                            italic: fontOption.fontFamily
                              ? !!fontOption.italic
                              : matchedStyle.italic,
                            type: "userText",
                          },
                        ]);
                      }

                      setPageTextContent((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          items: prev.content.items.filter(
                            (_, id) => idx !== id,
                          ),
                        },
                      }));
                    }}
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
