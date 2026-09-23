"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Botón compacto para aceptar una postulación sin tener que abrir la
// tarjeta — vive junto al botón de borrar, fuera del <details>. No se
// muestra si ya está aceptada (no hace falta).
export default function AceptarRapido({
  id,
  estado,
  actualizar,
}: {
  id: string;
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
  actualizar: (id: string, estado: "ACEPTADA") => Promise<void>;
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (estado === "ACEPTADA") return null;

  return (
    <div style={{ display: "grid", gap: 2, justifyItems: "end" }}>
      <button
        type="button"
        disabled={guardando}
        onClick={() => {
          setError("");
          startTransition(async () => {
            try {
              await actualizar(id, "ACEPTADA");
              router.refresh();
            } catch {
              setError("No se pudo.");
            }
          });
        }}
        title="Aceptar esta postulación"
        style={{
          background: "#159d68",
          color: "#fff",
          border: 0,
          borderRadius: 6,
          padding: "3px 9px",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        {guardando ? "…" : "✓ Aceptar"}
      </button>
      {error && <span style={{ fontSize: 11, color: "#c0392b" }}>{error}</span>}
    </div>
  );
}
