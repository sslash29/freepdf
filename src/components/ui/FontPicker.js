"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import { AUTO_FONT, STANDARD_FONTS } from "@/lib/pdfFont";

const FontPicker = ({ fontValue, setFontValue, documentFonts = [] }) => {
  const [open, setOpen] = useState(false);

  const handleFontChange = (e) => {
    const id = e.target.value;
    if (id === AUTO_FONT.id) {
      setFontValue(AUTO_FONT);
      return;
    }
    const font =
      documentFonts.find((f) => f.id === id) ||
      STANDARD_FONTS.find((f) => f.id === id);
    if (font) setFontValue(font);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
        title={fontValue.label}
      >
        <Type size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
          <label className="mb-2 block text-xs font-semibold text-slate-500">
            Font
          </label>

          <select
            value={fontValue.id}
            onChange={handleFontChange}
            className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value={AUTO_FONT.id}>{AUTO_FONT.label}</option>

            {documentFonts.length > 0 && (
              <optgroup label="In this document">
                {documentFonts.map((font) => (
                  <option
                    key={font.id}
                    value={font.id}
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.label}
                  </option>
                ))}
              </optgroup>
            )}

            <optgroup label="Standard">
              {STANDARD_FONTS.map((font) => (
                <option
                  key={font.id}
                  value={font.id}
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.label}
                </option>
              ))}
            </optgroup>
          </select>

          <p
            className="mt-4 truncate text-lg"
            style={{ fontFamily: fontValue.fontFamily || undefined }}
          >
            {fontValue.fontFamily
              ? fontValue.label
              : "Aa — matches what you click"}
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

export default FontPicker;
