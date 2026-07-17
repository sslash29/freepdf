"use client";

import { useErrorStore } from "@/store/errorStore";

export default function ErrorOverlay() {
  const { isError, errorHeader, errorDescription, clearError } = useErrorStore();

  if (!isError) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>❌ {errorHeader}</h2>
        <p style={{ color: "#374151", marginBottom: "1.5rem" }}>{errorDescription}</p>
        <button
          onClick={clearError}
          style={{
            backgroundColor: "#dc2626",
            color: "white",
            padding: "0.5rem 1.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
