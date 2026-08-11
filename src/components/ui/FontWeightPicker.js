"use client";

import { useState } from "react";
import { Bold } from "lucide-react";

const fontWeights = [
  { label: "Thin", value: "100" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
  { label: "Black", value: "900" },
];

const FontWeightPicker = ({ weightValue, setWeightValue }) => {
  const [open, setOpen] = useState(false);

  const handleWeightChange = (e) => {
    const weight = fontWeights.find((w) => w.value === e.target.value);
    setWeightValue(weight);
  };

  return (
    <div className="relative">
      {/* Toolbar Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
      >
        <Bold size={18} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
          <label className="mb-2 block text-xs font-semibold text-slate-500">
            Font Weight
          </label>

          <select
            value={weightValue.value}
            onChange={handleWeightChange}
            className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
          >
            {fontWeights.map((weight) => (
              <option
                key={weight.value}
                value={weight.value}
                style={{ fontWeight: weight.value }}
              >
                {weight.label}
              </option>
            ))}
          </select>

          <p className="mt-4 text-lg" style={{ fontWeight: weightValue.value }}>
            {weightValue.label}
          </p>

          <button
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-md bg-slate-900 py-2 text-white hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default FontWeightPicker;
