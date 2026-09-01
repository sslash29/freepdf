"use client";

import { useToolbarStore } from "@/store/toolbarStore";
import ColorPicker from "@/components/ui/ColorPicker/ColorPicker";
import FontWeightPicker from "@/components/ui/FontWeightPicker";
import FontPicker from "@/components/ui/FontPicker";
import ShapePicker from "@/components/ui/ShapePicker";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Pencil,
  Plus,
  Square,
  TextCursorInput,
  Trash2,
} from "lucide-react";

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

const readout =
  "select-none text-sm font-medium tabular-nums text-slate-600 text-center";

const tools = [
  { label: "Edit Text", icon: Pencil },
  { label: "Add Text", icon: TextCursorInput },
  { label: "Add Shape", icon: Square },
  { label: "Remove Text", icon: Trash2 },
];

const Toolbar = ({
  setPageNumber,
  setScale,
  pageNumber,
  scale,
  pdf,
  textColor,
  setTextColor,
  weightValue,
  setWeightValue,
  fontValue,
  setFontValue,
  documentFonts,
  shapeType,
  setShapeType,
  shapeFilled,
  setShapeFilled,
}) => {
  const { tool, setTool } = useToolbarStore((state) => state);

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 text-black shadow-sm">
      <div className="flex items-center gap-2">
        <button
          className={iconButton}
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <span className={`${readout} w-16`}>
          {pageNumber} / {pdf.numPages}
        </span>

        <button
          className={iconButton}
          onClick={() => setPageNumber((p) => Math.min(pdf.numPages, p + 1))}
          disabled={pageNumber >= pdf.numPages}
          title="Next page"
        >
          <ChevronRight size={18} />
        </button>

        <div className="mx-2 h-6 w-px bg-slate-200" />

        <button
          className={iconButton}
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - 0.2))}
          disabled={scale <= MIN_SCALE}
          title="Zoom out"
        >
          <Minus size={18} />
        </button>

        <span className={`${readout} w-14`}>{Math.round(scale * 100)}%</span>

        <button
          className={iconButton}
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.2))}
          disabled={scale >= MAX_SCALE}
          title="Zoom in"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <ColorPicker textColor={textColor} setTextColor={setTextColor} />
        <FontPicker
          fontValue={fontValue}
          setFontValue={setFontValue}
          documentFonts={documentFonts}
        />
        <FontWeightPicker
          weightValue={weightValue}
          setWeightValue={setWeightValue}
        />
        <ShapePicker
          shapeType={shapeType}
          setShapeType={setShapeType}
          shapeFilled={shapeFilled}
          setShapeFilled={setShapeFilled}
        />

        <div className="mx-1 h-6 w-px bg-slate-200" />

        {tools.map(({ label, icon: Icon }) => {
          const active = tool === label;
          return (
            <button
              key={label}
              onClick={() => setTool(active ? null : label)}
              aria-pressed={active}
              className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition ${
                active
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;
