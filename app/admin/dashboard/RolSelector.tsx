"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Rol = "ADMIN" | "EDITOR" | "VIEWER";

const ETIQUETAS: Record<Rol, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Solo lectura",
};

// Cambiar el rol de un usuario ya creado, con la misma respuesta inmediata
// que el estado/modalidad de ponentes. El servidor igual valida que no sea
// el propio usuario ni el último Admin (por si esto se llega a usar en un
// contexto donde esas reglas no se revisaron antes de mostrar el selector).
export default function RolSelector({
  id,
  rol,
  actualizar,
}: {
  id: string;
  rol: Rol;
  actualizar: (id: string, rol: Rol) => Promise<void>;
}) {
  const router = useRouter();
  const [actual, setActual] = useState<Rol>(rol);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => setActual(rol), [rol]);

  function cambiar(nuevo: Rol) {
    if (nuevo === actual || guardando) return;
    const previo = actual;
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <select
        value={actual}
        disabled={guardando}
        onChange={(e) => cambiar(e.target.value as Rol)}
        style={{ fontSize: 12, padding: "2px 6px", borderRadius: 999 }}
      >
        {(Object.keys(ETIQUETAS) as Rol[]).map((r) => (
          <option key={r} value={r}>
            {ETIQUETAS[r]}
          </option>
        ))}
      </select>
      {guardando && <span style={{ fontSize: 12, opacity: 0.7 }}>Guardando…</span>}
      {error && <span style={{ fontSize: 12, color: "#c0392b" }}>{error}</span>}
    </span>
  );
}
