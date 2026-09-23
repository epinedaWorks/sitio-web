"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Modalidad = "CHARLA" | "TALLER" | "PROYECTO";

const ETIQUETAS: Record<Modalidad, string> = {
  CHARLA: "Charla / Conferencia",
  TALLER: "Taller",
  PROYECTO: "Exposición de proyecto",
};

// Cambio manual de modalidad: para cuando alguien se confundió al llenar el
// formulario. Mismo patrón de respuesta inmediata que EstadoPonenteBotones.
export default function ModalidadSelector({
  id,
  modalidad,
  actualizar,
}: {
  id: string;
  modalidad: Modalidad;
  actualizar: (id: string, modalidad: Modalidad) => Promise<void>;
}) {
  const router = useRouter();
  const [actual, setActual] = useState<Modalidad>(modalidad);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => setActual(modalidad), [modalidad]);

  function cambiar(nueva: Modalidad) {
    if (nueva === actual || guardando) return;
    const previa = actual;
    setActual(nueva);
    setError("");
    startTransition(async () => {
      try {
        await actualizar(id, nueva);
        router.refresh();
      } catch {
        setActual(previa);
        setError("No se pudo guardar.");
      }
    });
  }

  return (
    <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
      Modalidad:
      <select
        value={actual}
        disabled={guardando}
        onChange={(e) => cambiar(e.target.value as Modalidad)}
        style={{ fontSize: 13, padding: "3px 6px" }}
      >
        {(Object.keys(ETIQUETAS) as Modalidad[]).map((m) => (
          <option key={m} value={m}>
            {ETIQUETAS[m]}
          </option>
        ))}
      </select>
      {guardando && <span style={{ opacity: 0.7 }}>Guardando…</span>}
      {error && <span style={{ color: "#c0392b" }}>{error}</span>}
    </label>
  );
}
