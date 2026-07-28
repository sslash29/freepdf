"use client";

import { useState, useEffect } from "react";
import { Check, Pipette } from "lucide-react";

const PRESETS = [
  "#F8FAFC", // slate-50
  "#0F172A", // slate-900
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#F59E0B", // amber-500
  "#22C55E", // green-500
  "#14B8A6", // teal-500
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#A855F7", // purple-500
  "#EC4899", // pink-500
  "#78716C", // stone-500
];

const isValidHex = (value) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

const ColorPicker = ({ textColor, setTextColor }) => {
  const [draft, setDraft] = useState(textColor ?? "#0F172A");
  const [open, setOpen] = useState(false);

  const commit = (value) => {
    setDraft(value);
    if (isValidHex(value)) setTextColor(value);
  };
  useEffect(() => {
    console.log(textColor);
  }, [textColor]);
  return (
    <div className="relative inline-block font-sans">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:shadow"
      >
        <span
          className="h-5 w-5 rounded-full border border-black/10"
          style={{ backgroundColor: isValidHex(draft) ? draft : "#000" }}
        />
        <span className="font-mono text-sm text-slate-600">
          {draft.toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200">
              <input
                type="color"
                value={isValidHex(draft) ? draft : "#000000"}
                onChange={(e) => commit(e.target.value)}
                className="absolute -left-1 -top-1 h-12 w-12 cursor-pointer border-0 p-0"
                aria-label="Pick a color"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Hex
              </label>
              <input
                type="text"
                value={draft}
                onChange={(e) => commit(e.target.value)}
                placeholder="#000000"
                className={`w-full rounded-md border px-2 py-1 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${
                  isValidHex(draft) ? "border-slate-200" : "border-red-300"
                }`}
              />
            </div>
          </div>

          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <Pipette className="h-3 w-3" />
            Presets
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => commit(color)}
                title={color}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 transition hover:scale-110"
                style={{ backgroundColor: color }}
              >
                {draft.toLowerCase() === color.toLowerCase() && (
                  <Check
                    className="h-3.5 w-3.5"
                    style={{
                      color: ["#F8FAFC", "#F59E0B", "#22C55E"].includes(color)
                        ? "#0F172A"
                        : "#F8FAFC",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-md bg-slate-900 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
