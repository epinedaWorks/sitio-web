"use client";

import { useMemo, useState } from "react";

type EstadoPonente = "TODOS" | "ACEPTADA" | "PENDIENTE" | "RECHAZADA";

type EventoConteo = {
  id: string;
  title: string;
  slug: string;
  asistentes: number;
  ponentesTotal: number;
  PENDIENTE: number;
  ACEPTADA: number;
  RECHAZADA: number;
};

export default function AnuncioForm({
  eventos,
  action,
}: {
  eventos: EventoConteo[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [eventId, setEventId] = useState(eventos[0]?.id || "");
  const [asistentes, setAsistentes] = useState(true);
  const [ponentes, setPonentes] = useState(true);
  const [estadoPonentes, setEstadoPonentes] = useState<EstadoPonente>("TODOS");
  const [prueba, setPrueba] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const evento = eventos.find((e) => e.id === eventId);

  const conteoPonentes = (e?: EventoConteo) => {
    if (!e) return 0;
    return estadoPonentes === "TODOS" ? e.ponentesTotal : e[estadoPonentes];
  };

  // Estimado: no descuenta a quien está inscrito Y postuló a la vez (el envío
  // real sí lo hace, así que el número real puede ser un poco menor).
  const totalAprox = useMemo(() => {
    if (!evento) return 0;
    let n = 0;
    if (asistentes) n += evento.asistentes;
    if (ponentes) n += conteoPonentes(evento);
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento, asistentes, ponentes, estadoPonentes]);

  if (eventos.length === 0) {
    return <p style={{ opacity: 0.7 }}>Aún no hay eventos. Crea uno en Eventos primero.</p>;
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (prueba) {
          setEnviando(true);
          return;
        }
        const ok = window.confirm(
          `Vas a enviar este correo a aproximadamente ${totalAprox} persona${
            totalAprox === 1 ? "" : "s"
          }. No se puede deshacer. ¿Continuar?`
        );
        if (!ok) {
          e.preventDefault();
          return;
        }
        setEnviando(true);
      }}
      style={{ display: "grid", gap: 14, marginTop: 20 }}
    >
      <label style={{ fontSize: 13, fontWeight: 600 }}>
        Evento
        <select
          name="eventId"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
        >
          {eventos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: "grid", gap: 10, border: "1px solid #e2e2e2", borderRadius: 10, padding: 14 }}>
        <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            name="asistentes"
            checked={asistentes}
            onChange={(e) => setAsistentes(e.target.checked)}
          />
          Asistentes inscritos ({evento?.asistentes ?? 0})
        </label>

        <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            name="ponentes"
            checked={ponentes}
            onChange={(e) => setPonentes(e.target.checked)}
          />
          Conferencistas, talleristas y expositores ({conteoPonentes(evento)})
        </label>

        {ponentes && (
          <label style={{ fontSize: 13, marginLeft: 26, opacity: 0.85 }}>
            Estado:{" "}
            <select
              name="estadoPonentes"
              value={estadoPonentes}
              onChange={(e) => setEstadoPonentes(e.target.value as EstadoPonente)}
              style={{ padding: 3 }}
            >
              <option value="TODOS">Todos ({evento?.ponentesTotal ?? 0})</option>
              <option value="ACEPTADA">Solo aceptados ({evento?.ACEPTADA ?? 0})</option>
              <option value="PENDIENTE">Solo pendientes ({evento?.PENDIENTE ?? 0})</option>
              <option value="RECHAZADA">Solo rechazados ({evento?.RECHAZADA ?? 0})</option>
            </select>
          </label>
        )}
      </div>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        Asunto
        <input
          name="asunto"
          required
          maxLength={200}
          placeholder="Ej. Últimos detalles del Python eXposition Day 2026"
          style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
        />
      </label>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        Mensaje
        <textarea
          name="mensaje"
          required
          rows={9}
          maxLength={8000}
          placeholder={"Hola {{nombre}},\n\nEscribe aquí tu mensaje..."}
          style={{ display: "block", width: "100%", marginTop: 4, padding: 8, fontFamily: "inherit", fontSize: 14 }}
        />
        <span style={{ fontSize: 12, opacity: 0.65 }}>
          Usa <code>{"{{nombre}}"}</code> para que salga el nombre de cada quien. Deja una línea en blanco
          entre párrafos.
        </span>
      </label>

      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" name="prueba" checked={prueba} onChange={(e) => setPrueba(e.target.checked)} />
        Enviar solo una prueba a mi correo (no le llega a nadie más)
      </label>

      <div>
        <button type="submit" disabled={enviando} style={{ fontWeight: 700, padding: "8px 16px" }}>
          {enviando
            ? "Enviando…"
            : prueba
              ? "Enviar prueba a mi correo"
              : `Enviar a ${totalAprox} persona${totalAprox === 1 ? "" : "s"}`}
        </button>
      </div>
    </form>
  );
}
