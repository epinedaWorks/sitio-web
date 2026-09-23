"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ES_CORREO_ANUNCIO as ES_CORREO, dedupePorCorreo as dedupe } from "@/lib/anuncios";

type Persona = { correo: string; nombre: string };
type EstadoPonente = "TODOS" | "ACEPTADA" | "PENDIENTE" | "RECHAZADA";
type ModalidadPonente = "TODAS" | "CHARLA" | "TALLER" | "PROYECTO";

type PonenteDatos = Persona & {
  status: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
  modalidad: "CHARLA" | "TALLER" | "PROYECTO";
};

type EventoDatos = {
  id: string;
  title: string;
  slug: string;
  asistentes: Persona[];
  ponentes: PonenteDatos[];
};

const ETIQUETA_MODALIDAD: Record<Exclude<ModalidadPonente, "TODAS">, string> = {
  CHARLA: "Charlas",
  TALLER: "Talleres",
  PROYECTO: "Proyectos",
};

// Filtra los ponentes de un evento por estado y modalidad a la vez (por
// ejemplo "solo talleristas aceptados") — cada modalidad suele recibir
// información distinta, así que conviene poder separarlas al enviar.
function filtrarPonentes(ponentes: PonenteDatos[], estado: EstadoPonente, modalidad: ModalidadPonente): Persona[] {
  return ponentes
    .filter((p) => (estado === "TODOS" || p.status === estado) && (modalidad === "TODAS" || p.modalidad === modalidad))
    .map(({ correo, nombre }) => ({ correo, nombre }));
}

// Botón + modal de confirmación PROPIOS (no window.confirm — ese lo dibuja el
// navegador donde quiere y no se puede centrar ni estilar). Vive DENTRO del
// <form> para que useFormStatus refleje el envío real (incluida la
// redirección al terminar) en vez de un estado propio que nunca se resetea
// si el componente no se vuelve a montar.
function BotonEnviar({ total, formRef }: { total: number; formRef: React.RefObject<HTMLFormElement> }) {
  const { pending } = useFormStatus();
  const [confirmando, setConfirmando] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={pending || total === 0}
        onClick={() => setConfirmando(true)}
        style={{ fontWeight: 700, padding: "8px 16px" }}
      >
        {pending ? "Enviando…" : `Enviar a ${total} persona${total === 1 ? "" : "s"}`}
      </button>

      {confirmando && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmando(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 19, 16, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 17 }}>¿Enviar este correo?</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>
              Se va a enviar, tal cual lo escribiste, a <b>{total} persona{total === 1 ? "" : "s"}</b>.
              No se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmando(false);
                  formRef.current?.requestSubmit();
                }}
                style={{ background: "#0a1310", color: "#fff", borderColor: "#0a1310" }}
              >
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AnuncioForm({
  eventos,
  action,
}: {
  eventos: EventoDatos[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [eventId, setEventId] = useState(eventos[0]?.id || "");
  const [asistentesOn, setAsistentesOn] = useState(true);
  const [ponentesOn, setPonentesOn] = useState(true);
  const [estadoPonentes, setEstadoPonentes] = useState<EstadoPonente>("TODOS");
  const [modalidadPonentes, setModalidadPonentes] = useState<ModalidadPonente>("TODAS");
  const [lista, setLista] = useState<Persona[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

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
    if (ponentesOn) base = base.concat(filtrarPonentes(evento.ponentes, estadoPonentes, modalidadPonentes));
    setLista(dedupe(base));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, asistentesOn, ponentesOn, estadoPonentes, modalidadPonentes]);

  const quitar = (correo: string) => setLista((l) => l.filter((p) => p.correo !== correo));

  const agregar = () => {
    const correo = nuevoCorreo.trim().toLowerCase();
    if (!ES_CORREO(correo)) return;
    setLista((l) => dedupe([...l, { correo, nombre: nuevoNombre.trim() || correo.split("@")[0] }]));
    setNuevoCorreo("");
    setNuevoNombre("");
  };

  const vaciarLista = () => setLista([]);
  const limpiarMensaje = () => {
    setAsunto("");
    setMensaje("");
  };

  if (eventos.length === 0) {
    return <p style={{ opacity: 0.7 }}>Aún no hay eventos. Crea uno en Eventos primero.</p>;
  }

  return (
    <form ref={formRef} action={action} style={{ display: "grid", gap: 14, marginTop: 20 }}>
      {/* La lista de abajo (ya editada a mano si hizo falta) es la ÚNICA
          fuente de a quién le llega. Viaja como JSON; el servidor la usa
          tal cual, y el asunto/mensaje se envían exactamente como se
          escribieron, sin ninguna marca ni modificación automática. */}
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
          Conferencistas, talleristas y expositores (
          {evento ? filtrarPonentes(evento.ponentes, estadoPonentes, modalidadPonentes).length : 0})
        </label>

        {ponentesOn && (
          <div style={{ marginLeft: 26, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, opacity: 0.85 }}>
              Modalidad:{" "}
              <select
                value={modalidadPonentes}
                onChange={(e) => setModalidadPonentes(e.target.value as ModalidadPonente)}
                style={{ padding: 3 }}
              >
                <option value="TODAS">
                  Todas ({evento ? filtrarPonentes(evento.ponentes, estadoPonentes, "TODAS").length : 0})
                </option>
                {(Object.keys(ETIQUETA_MODALIDAD) as (keyof typeof ETIQUETA_MODALIDAD)[]).map((m) => (
                  <option key={m} value={m}>
                    {ETIQUETA_MODALIDAD[m]} ({evento ? filtrarPonentes(evento.ponentes, estadoPonentes, m).length : 0})
                  </option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: 13, opacity: 0.85 }}>
              Estado:{" "}
              <select
                value={estadoPonentes}
                onChange={(e) => setEstadoPonentes(e.target.value as EstadoPonente)}
                style={{ padding: 3 }}
              >
                <option value="TODOS">
                  Todos ({evento ? filtrarPonentes(evento.ponentes, "TODOS", modalidadPonentes).length : 0})
                </option>
                <option value="ACEPTADA">
                  Solo aceptados ({evento ? filtrarPonentes(evento.ponentes, "ACEPTADA", modalidadPonentes).length : 0})
                </option>
                <option value="PENDIENTE">
                  Solo pendientes ({evento ? filtrarPonentes(evento.ponentes, "PENDIENTE", modalidadPonentes).length : 0})
                </option>
                <option value="RECHAZADA">
                  Solo rechazados ({evento ? filtrarPonentes(evento.ponentes, "RECHAZADA", modalidadPonentes).length : 0})
                </option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Lista editable de destinatarios — la única que existe */}
      <div style={{ border: "1px solid #e2e2e2", borderRadius: 10, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <strong style={{ fontSize: 13 }}>Destinatarios ({lista.length})</strong>
          {lista.length > 0 && (
            <button type="button" onClick={vaciarLista} style={{ fontSize: 12, padding: "4px 10px" }}>
              Vaciar lista
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
          A quien esté aquí le llega el correo. Nada más.
        </p>
      </div>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        Asunto
        <input
          name="asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          required
          maxLength={200}
          autoComplete="off"
          placeholder="Ej. Últimos detalles del Python eXposition Day 2026"
          style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
        />
        <span style={{ fontSize: 12, opacity: 0.6 }}>Se envía exactamente como lo escribas, sin nada agregado.</span>
      </label>

      <label style={{ fontSize: 13, fontWeight: 600 }}>
        Mensaje
        <textarea
          name="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
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

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <BotonEnviar total={lista.length} formRef={formRef} />
        {(asunto || mensaje) && (
          <button type="button" onClick={limpiarMensaje} style={{ fontSize: 13, padding: "6px 12px" }}>
            Limpiar asunto y mensaje
          </button>
        )}
      </div>
    </form>
  );
}
