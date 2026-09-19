"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Estado = "PENDIENTE" | "ACEPTADA" | "RECHAZADA";

const OPCIONES: { valor: Estado; texto: string; bg: string; fg: string }[] = [
  { valor: "ACEPTADA", texto: "Aceptar", bg: "#159d68", fg: "#fff" },
  { valor: "RECHAZADA", texto: "Rechazar", bg: "#c0392b", fg: "#fff" },
  { valor: "PENDIENTE", texto: "Volver a pendiente", bg: "#e8a33d", fg: "#241700" },
];

// Botones de estado con respuesta inmediata: el botón del estado actual se
// resalta al instante (sin esperar al servidor), muestra "Guardando…" mientras
// se guarda y luego refresca la página para que también se actualice la
// etiqueta de arriba. Si falla, vuelve al estado anterior y avisa.
export default function EstadoPonenteBotones({
  id,
  estado,
  actualizar,
}: {
  id: string;
  estado: Estado;
  actualizar: (id: string, estado: Estado) => Promise<void>;
}) {
  const router = useRouter();
  const [actual, setActual] = useState<Estado>(estado);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);

  // Si el servidor trae un estado distinto (tras refrescar), lo respetamos.
  useEffect(() => setActual(estado), [estado]);

  function cambiar(nuevo: Estado) {
    if (nuevo === actual || guardando) return;
    const previo = actual;
    setActual(nuevo);
    setError("");
    setGuardado(false);
    startTransition(async () => {
      try {
        await actualizar(id, nuevo);
        setGuardado(true);
        router.refresh();
      } catch {
        setActual(previo);
        setError("No se pudo guardar. Intenta de nuevo.");
      }
    });
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {OPCIONES.map((o) => {
        const esActual = actual === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            disabled={guardando || esActual}
            onClick={() => cambiar(o.valor)}
            style={
              esActual
                ? { background: o.bg, color: o.fg, borderColor: o.bg, opacity: 1, cursor: "default" }
                : undefined
            }
          >
            {esActual ? `✓ ${o.valor === "ACEPTADA" ? "Aceptada" : o.valor === "RECHAZADA" ? "Rechazada" : "Pendiente"}` : o.texto}
          </button>
        );
      })}
      {guardando && <span style={{ fontSize: 13, opacity: 0.7 }}>Guardando…</span>}
      {!guardando && guardado && !error && <span style={{ fontSize: 13, color: "#1b5e20" }}>✓ Guardado</span>}
      {error && <span style={{ fontSize: 13, color: "#c0392b" }}>{error}</span>}
    </div>
  );
}
