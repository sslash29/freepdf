"use client";

import { useState } from "react";
import { Square, Circle, Triangle } from "lucide-react";

const SHAPE_TYPES = [
  { type: "rect", label: "Rectangle", icon: Square },
  { type: "ellipse", label: "Ellipse", icon: Circle },
  { type: "triangle", label: "Triangle", icon: Triangle },
];

const ShapePicker = ({ shapeType, setShapeType, shapeFilled, setShapeFilled }) => {
  const [open, setOpen] = useState(false);
  const ActiveIcon =
    SHAPE_TYPES.find((s) => s.type === shapeType)?.icon ?? Square;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
        title="Shape options"
      >
        <ActiveIcon size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
          <label className="mb-2 block text-xs font-semibold text-slate-500">
            Shape
          </label>
          <div className="mb-4 flex gap-2">
            {SHAPE_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setShapeType(type)}
                title={label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  shapeType === type
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          <label className="mb-2 block text-xs font-semibold text-slate-500">
            Style
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShapeFilled(true)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition ${
                shapeFilled
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Fill
            </button>
            <button
              type="button"
              onClick={() => setShapeFilled(false)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition ${
                !shapeFilled
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Outline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapePicker;
