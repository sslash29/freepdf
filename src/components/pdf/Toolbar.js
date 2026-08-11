"use client";

import { useToolbarStore } from "@/store/toolbarStore";
import ColorPicker from "@/components/ui/ColorPicker/ColorPicker";
import FontWeightPicker from "@/components/ui/FontWeightPicker";

const Toolbar = ({
  setPageNumber,
  setScale,
  pageNumber,
  pdf,
  textColor,
  setTextColor,
  weightValue,
  setWeightValue,
}) => {
  const { tool, setTool } = useToolbarStore((state) => state);

  function handleToolClick(e) {
    e.preventDefault();
    setTool(e.currentTarget.textContent);
    console.log(e);
  }
  return (
    <div className="sticky top-0 z-20 flex justify-between gap-3 p-4 bg-white shadow text-black">
      <div className="flex gap-3 p-4 font-semibold">
        <button onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>
          Previous
        </button>

        <span>
          {pageNumber} / {pdf.numPages}
        </span>

        <button
          onClick={() => setPageNumber((p) => Math.min(pdf.numPages, p + 1))}
        >
          Next
        </button>

        <button onClick={() => setScale((s) => s + 0.2)}>+</button>

        <button onClick={() => setScale((s) => Math.max(0.4, s - 0.2))}>
          -
        </button>
      </div>

      <div className="flex gap-3 p-4 font-semibold">
        <ColorPicker textColor={textColor} setTextColor={setTextColor} />
        <FontWeightPicker
          weightValue={weightValue}
          setWeightValue={setWeightValue}
        />
        <button onClick={handleToolClick}>Edit Text</button>
        <button onClick={handleToolClick}>Add Text</button>
        <button onClick={handleToolClick}>Remove Text</button>
      </div>
    </div>
  );
};

export default Toolbar;
