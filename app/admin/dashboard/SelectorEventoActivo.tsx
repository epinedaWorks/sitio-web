"use client";

import { useRef } from "react";

// Dropdown que cambia el evento activo apenas se elige una opción (sin botón
// aparte) — envía el formulario a la acción del servidor que ya se encarga
// de que TODO lo que depende del evento activo (portada, formularios
// públicos, check-in, estadísticas del panel) quede coherente de una vez.
export default function SelectorEventoActivo({
  eventos,
  activoId,
  action,
}: {
  eventos: { id: string; title: string }[];
  activoId?: string;
  action: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} style={{ display: "inline-block" }}>
      <label style={{ fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>
        <strong>Evento activo:</strong>
        <select
          name="eventId"
          defaultValue={activoId ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
        >
          {!activoId && (
            <option value="" disabled>
              Elige un evento…
            </option>
          )}
          {eventos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
