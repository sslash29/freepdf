"use client";

import { useRef, useState } from "react";

export default function UploadArea() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF.");
      return;
    }

    setPdfFile(file);
  }

  function handleUpload(e) {
    const file = e.target.files[0];

    handleFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(e) {
    e.preventDefault();

    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();

    setIsDragging(false);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`
        w-[50%]
        h-screen
        flex
        flex-col
        items-center
        justify-center
        border-4
        border-dashed
        transition-all
        duration-300
        ${isDragging ? "border-blue-500 bg-blue-50 text-black" : "border-gray-300"}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleUpload}
        className="hidden"
      />

      <h2 className="text-2xl font-bold mb-4">
        {isDragging ? "Drop your PDF" : "Drag & Drop your PDF"}
      </h2>

      <p className="mb-6 text-gray-500">or</p>

      <button
        onClick={() => inputRef.current.click()}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Upload PDF
      </button>

      {pdfFile && (
        <p className="mt-6 text-green-600">
          Uploaded: {pdfFile.name}
        </p>
      )}
    </div>
  );
}
