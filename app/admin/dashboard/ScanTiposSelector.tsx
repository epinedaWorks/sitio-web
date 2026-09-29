"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TIPOS_ESCANEO, ETIQUETA_TIPO } from "@/lib/scan";

// Qué puestos de escaneo (entrada, proyectos, coffee, almuerzo) puede
// trabajar este usuario. Ninguna casilla marcada = sin restricción (puede
// escanear todo); marcar una o más lo limita a esas.
export default function ScanTiposSelector({
  id,
  tipos,
  actualizar,
}: {
  id: string;
  tipos: string[];
  actualizar: (id: string, tipos: string[]) => Promise<void>;
}) {
  const router = useRouter();
  const [actual, setActual] = useState<string[]>(tipos);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => setActual(tipos), [tipos]);

  function toggle(t: string) {
    if (guardando) return;
    const previo = actual;
    const nuevo = actual.includes(t) ? actual.filter((x) => x !== t) : [...actual, t];
    setActual(nuevo);
    setError("");
    startTransition(async () => {
      try {
        await actualizar(id, nuevo);
        router.refresh();
      } catch {
        setActual(previo);
        setError("No se pudo cambiar.");
      }
    });
  }

  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      {TIPOS_ESCANEO.map((t) => (
        <label key={t} style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, opacity: guardando ? 0.6 : 1 }}>
          <input type="checkbox" checked={actual.includes(t)} disabled={guardando} onChange={() => toggle(t)} />
          {ETIQUETA_TIPO[t]}
        </label>
      ))}
      {actual.length === 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>(sin marcar = puede escanear todo)</span>}
      {guardando && <span style={{ fontSize: 12, opacity: 0.7 }}>Guardando…</span>}
      {error && <span style={{ fontSize: 12, color: "#c0392b" }}>{error}</span>}
    </span>
  );
}
