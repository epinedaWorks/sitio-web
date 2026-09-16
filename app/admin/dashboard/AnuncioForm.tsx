"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { ES_CORREO_ANUNCIO as ES_CORREO, dedupePorCorreo as dedupe } from "@/lib/anuncios";

type Persona = { correo: string; nombre: string };
type EstadoPonente = "TODOS" | "ACEPTADA" | "PENDIENTE" | "RECHAZADA";

type EventoDatos = {
  id: string;
  title: string;
  slug: string;
  asistentes: Persona[];
  ponentes: Record<EstadoPonente, Persona[]>;
};

// Vive DENTRO del <form> para que useFormStatus refleje el envío real
// (incluida la redirección al terminar) en vez de un estado propio que
// nunca se resetea si el componente no se vuelve a montar.
function BotonEnviar({ prueba, total }: { prueba: boolean; total: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || total === 0} style={{ fontWeight: 700, padding: "8px 16px" }}>
      {pending ? "Enviando…" : `Enviar${prueba ? " PRUEBA" : ""} a ${total} persona${total === 1 ? "" : "s"}`}
    </button>
  );
}

export default function AnuncioForm({
  eventos,
  action,
  correoAdmin = "",
  nombreAdmin = "",
}: {
  eventos: EventoDatos[];
  action: (formData: FormData) => void | Promise<void>;
  correoAdmin?: string;
  nombreAdmin?: string;
}) {
  const [eventId, setEventId] = useState(eventos[0]?.id || "");
  const [asistentesOn, setAsistentesOn] = useState(true);
  const [ponentesOn, setPonentesOn] = useState(true);
  const [estadoPonentes, setEstadoPonentes] = useState<EstadoPonente>("TODOS");
  const [prueba, setPrueba] = useState(false);
  const [lista, setLista] = useState<Persona[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");

  const evento = eventos.find((e) => e.id === eventId);

  // Recalcula la lista de destinatarios cada vez que cambia el evento o los
  // filtros de audiencia (esto SOBRESCRIBE ediciones manuales — es la forma
  // más simple de que "a quién le llega" arriba y la lista de abajo no se
  // desincronicen).
  useEffect(() => {
    if (!evento) {
      setLista([]);
      return;
    }
    let base: Persona[] = [];
    if (asistentesOn) base = base.concat(evento.asistentes);
    if (ponentesOn) base = base.concat(evento.ponentes[estadoPonentes]);
    setLista(dedupe(base));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, asistentesOn, ponentesOn, estadoPonentes]);

  const quitar = (correo: string) => setLista((l) => l.filter((p) => p.correo !== correo));

  const agregar = () => {
    const correo = nuevoCorreo.trim().toLowerCase();
    if (!ES_CORREO(correo)) return;
    setLista((l) => dedupe([...l, { correo, nombre: nuevoNombre.trim() || correo.split("@")[0] }]));
    setNuevoCorreo("");
    setNuevoNombre("");
  };

  // Atajo: vacía la lista, deja solo al admin, y marca la casilla de prueba.
  // Así se prueba con UNA sola lista (la de abajo) en vez de un campo aparte.
  const probarSoloConmigo = () => {
    if (!correoAdmin) return;
    setLista([{ correo: correoAdmin, nombre: nombreAdmin || correoAdmin.split("@")[0] }]);
    setPrueba(true);
  };

  if (eventos.length === 0) {
    return <p style={{ opacity: 0.7 }}>Aún no hay eventos. Crea uno en Eventos primero.</p>;
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm(
          prueba
            ? `Vas a enviar una PRUEBA (con [PRUEBA] en el asunto) a ${lista.length} persona${
                lista.length === 1 ? "" : "s"
              }. ¿Continuar?`
            : `Vas a enviar este correo a ${lista.length} persona${
                lista.length === 1 ? "" : "s"
              }. No se puede deshacer. ¿Continuar?`
        );
        if (!ok) e.preventDefault();
      }}
      style={{ display: "grid", gap: 14, marginTop: 20 }}
    >
      {/* La lista de abajo (ya editada a mano si hizo falta) es la ÚNICA
          fuente de a quién le llega — tanto en un envío real como en una
          prueba. Viaja como JSON; el servidor la usa tal cual. */}
      <input type="hidden" name="destinatariosJson" value={JSON.stringify(lista)} />

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
            checked={asistentesOn}
            onChange={(e) => setAsistentesOn(e.target.checked)}
          />
          Asistentes inscritos ({evento?.asistentes.length ?? 0})
        </label>

        <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={ponentesOn}
            onChange={(e) => setPonentesOn(e.target.checked)}
          />
          Conferencistas, talleristas y expositores ({evento?.ponentes[estadoPonentes].length ?? 0})
        </label>

        {ponentesOn && (
          <label style={{ fontSize: 13, marginLeft: 26, opacity: 0.85 }}>
            Estado:{" "}
            <select
              value={estadoPonentes}
              onChange={(e) => setEstadoPonentes(e.target.value as EstadoPonente)}
              style={{ padding: 3 }}
            >
              <option value="TODOS">Todos ({evento?.ponentes.TODOS.length ?? 0})</option>
              <option value="ACEPTADA">Solo aceptados ({evento?.ponentes.ACEPTADA.length ?? 0})</option>
              <option value="PENDIENTE">Solo pendientes ({evento?.ponentes.PENDIENTE.length ?? 0})</option>
              <option value="RECHAZADA">Solo rechazados ({evento?.ponentes.RECHAZADA.length ?? 0})</option>
            </select>
          </label>
        )}
      </div>

      {/* Lista editable de destinatarios — la única que existe */}
      <div style={{ border: "1px solid #e2e2e2", borderRadius: 10, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <strong style={{ fontSize: 13 }}>Destinatarios ({lista.length})</strong>
          {correoAdmin && (
            <button type="button" onClick={probarSoloConmigo} style={{ fontSize: 12, padding: "4px 10px" }}>
              Vaciar y probar solo conmigo
            </button>
          )}
        </div>
        <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 4, marginTop: 8 }}>
          {lista.length === 0 && <p style={{ fontSize: 13, opacity: 0.6 }}>Nadie en la lista todavía.</p>}
          {lista.map((p) => (
            <div
              key={p.correo}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                padding: "3px 8px",
                borderRadius: 6,
                background: "#f7f7f7",
              }}
            >
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.nombre} · <span style={{ opacity: 0.65 }}>{p.correo}</span>
              </span>
              <button
                type="button"
                onClick={() => quitar(p.correo)}
                title="Quitar de la lista"
                style={{ border: 0, background: "none", cursor: "pointer", color: "#c0392b", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <input
            placeholder="correo@ejemplo.com"
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregar())}
            style={{ flex: 1, minWidth: 160, padding: 5 }}
          />
          <input
            placeholder="Nombre (opcional)"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregar())}
            style={{ width: 140, padding: 5 }}
          />
          <button type="button" onClick={agregar} style={{ padding: "5px 10px" }}>
            + Agregar
          </button>
        </div>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8, marginBottom: 0 }}>
          Esta es la lista real: a quien esté aquí le llega, sea prueba o envío real.
        </p>
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
          Usa <code>{"{{nombre}}"}</code> para que salga el nombre de cada quien (el que se ve en la lista
          de arriba). Deja una línea en blanco entre párrafos.
        </span>
      </label>

      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" name="prueba" checked={prueba} onChange={(e) => setPrueba(e.target.checked)} />
        Marcar como prueba (agrega &quot;[PRUEBA]&quot; al asunto y no le avisa al equipo — pero{" "}
        <b>igual le llega a quien esté en la lista de arriba</b>)
      </label>

      <div>
        <BotonEnviar prueba={prueba} total={lista.length} />
      </div>
    </form>
  );
}
