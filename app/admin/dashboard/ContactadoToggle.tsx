"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Casilla "¿Ya se le contactó?" con la misma respuesta inmediata que el
// estado y la modalidad: se marca al instante, revierte si falla.
export default function ContactadoToggle({
  id,
  contactado,
  actualizar,
}: {
  id: string;
  contactado: boolean;
  actualizar: (id: string, contactado: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const [actual, setActual] = useState(contactado);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => setActual(contactado), [contactado]);

  function cambiar(nuevo: boolean) {
    if (guardando) return;
    const previo = actual;
    setActual(nuevo);
    setError("");
    startTransition(async () => {
      try {
        await actualizar(id, nuevo);
        router.refresh();
      } catch {
        setActual(previo);
        setError("No se pudo guardar.");
      }
    });
  }

  return (
    <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
      <input type="checkbox" checked={actual} disabled={guardando} onChange={(e) => cambiar(e.target.checked)} />
      Ya se le contactó
      {guardando && <span style={{ opacity: 0.7 }}>Guardando…</span>}
      {error && <span style={{ color: "#c0392b" }}>{error}</span>}
    </label>
  );
}
