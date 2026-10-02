"use client";

import { useEffect, useRef, useState } from "react";
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

// Cuántas personas van por petición al servidor. Chico a propósito: un envío
// de cientos de personas no tiene que caber en una sola función serverless
// (Netlify las corta a los pocos segundos) — el navegador va mandando tandas,
// una tras otra, hasta terminar la lista completa.
const TAMANO_TANDA = 25;

type Fallido = { correo: string; motivo: string };

// Filtra los ponentes de un evento por estado y modalidad a la vez (por
// ejemplo "solo talleristas aceptados") — cada modalidad suele recibir
// información distinta, así que conviene poder separarlas al enviar.
function filtrarPonentes(ponentes: PonenteDatos[], estado: EstadoPonente, modalidad: ModalidadPonente): Persona[] {
  return ponentes
    .filter((p) => (estado === "TODOS" || p.status === estado) && (modalidad === "TODAS" || p.modalidad === modalidad))
    .map(({ correo, nombre }) => ({ correo, nombre }));
}

export default function AnuncioForm({ eventos }: { eventos: EventoDatos[] }) {
  const [eventId, setEventId] = useState(eventos[0]?.id || "");
  const [asistentesOn, setAsistentesOn] = useState(true);
  const [ponentesOn, setPonentesOn] = useState(true);
  const [estadoPonentes, setEstadoPonentes] = useState<EstadoPonente>("TODOS");
  const [modalidadPonentes, setModalidadPonentes] = useState<ModalidadPonente>("TODAS");
  const [lista, setLista] = useState<Persona[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [textoLista, setTextoLista] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState({ hechos: 0, total: 0 });
  const [resultado, setResultado] = useState<{ enviados: number; fallidos: number; restantes: Persona[] } | null>(null);
  const [error, setError] = useState("");

  const [adjunto, setAdjunto] = useState<{ url: string; filename: string } | null>(null);
  const [subiendoAdjunto, setSubiendoAdjunto] = useState(false);
  const [errorAdjunto, setErrorAdjunto] = useState("");

  async function elegirAdjunto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // deja elegir el mismo archivo otra vez si hace falta
    if (!archivo) return;
    setErrorAdjunto("");
    setSubiendoAdjunto(true);
    try {
      const form = new FormData();
      form.append("archivo", archivo);
      const res = await fetch("/api/admin/anuncios/adjunto", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir el archivo.");
      setAdjunto({ url: data.url, filename: data.filename });
    } catch (err) {
      setErrorAdjunto(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setSubiendoAdjunto(false);
    }
  }

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

  // Encuentra cualquier correo dentro del texto, sin importar el formato: uno
  // por línea, separados por coma, pegados de una hoja de cálculo, mezclados
  // con nombres u otro texto — toma lo que "parezca correo" y descarta lo demás.
  const correosDetectados = (texto: string): string[] => {
    const encontrados = texto.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
    return [...new Set(encontrados.map((c) => c.trim().toLowerCase()).filter(ES_CORREO))];
  };
  const detectadosEnTexto = correosDetectados(textoLista);

  const agregarVarios = () => {
    if (detectadosEnTexto.length === 0) return;
    setLista((l) => dedupe([...l, ...detectadosEnTexto.map((correo) => ({ correo, nombre: correo.split("@")[0] }))]));
    setTextoLista("");
  };

  // Subir un .txt/.csv solo rellena el cuadro de texto con su contenido —
  // así se puede revisar (o seguir pegando más) antes de agregarlos de verdad.
  const cargarArchivoLista = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      const contenido = String(lector.result || "");
      setTextoLista((prev) => (prev.trim() ? prev + "\n" + contenido : contenido));
    };
    lector.readAsText(archivo);
  };

  const vaciarLista = () => setLista([]);
  const limpiarMensaje = () => {
    setAsunto("");
    setMensaje("");
  };

  // Manda la lista completa en tandas chicas, una tras otra, actualizando el
  // progreso en pantalla. Si una tanda falla (ej. se cae la conexión), para
  // ahí mismo y deja lista la gente que faltó para reintentar solo con ellos.
  async function enviarTodo() {
    setEnviando(true);
    setError("");
    setResultado(null);
    setProgreso({ hechos: 0, total: lista.length });

    let totalEnviados = 0;
    const todosFallidos: Fallido[] = [];
    let i = 0;
    try {
      for (; i < lista.length; i += TAMANO_TANDA) {
        const tanda = lista.slice(i, i + TAMANO_TANDA);
        const res = await fetch("/api/admin/anuncios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "lote", eventId, asunto, mensaje, destinatarios: tanda, adjunto }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "El servidor no pudo procesar esta tanda.");
        }
        const data: { enviados: number; fallidos: Fallido[] } = await res.json();
        totalEnviados += data.enviados || 0;
        todosFallidos.push(...(data.fallidos || []));
        setProgreso({ hechos: Math.min(i + tanda.length, lista.length), total: lista.length });
      }

      // Resumen al equipo — una sola vez, al terminar. Si esto falla no debe
      // tapar el resultado real del envío (que ya pasó).
      fetch("/api/admin/anuncios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "resumen",
          eventId,
          asunto,
          mensaje,
          enviados: totalEnviados,
          fallidos: todosFallidos,
          destinatarios: lista,
          adjunto,
        }),
      }).catch(() => {});

      setResultado({ enviados: totalEnviados, fallidos: todosFallidos.length, restantes: [] });
    } catch (e) {
      const restantes = lista.slice(i);
      setError(
        `Se cortó el envío (${e instanceof Error ? e.message : "error de conexión"}). Van ${totalEnviados} enviados; quedaron ${restantes.length} sin intentar.`
      );
      setResultado({ enviados: totalEnviados, fallidos: todosFallidos.length, restantes });
    } finally {
      setEnviando(false);
    }
  }

  function reintentarConRestantes() {
    if (!resultado) return;
    setLista(resultado.restantes);
    setResultado(null);
    setError("");
  }

  function enviarOtro() {
    setResultado(null);
    setError("");
    setAsunto("");
    setMensaje("");
    setAdjunto(null);
    setErrorAdjunto("");
  }

  if (eventos.length === 0) {
    return <p style={{ opacity: 0.7 }}>Aún no hay eventos. Crea uno en Eventos primero.</p>;
  }

  // Pantalla de resultado, una vez terminado el envío (con o sin problemas).
  if (resultado) {
    return (
      <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
        <p
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 14,
            background: error ? "#fadbd8" : "#d5f5e3",
            color: error ? "#8e2a22" : "#1b5e20",
          }}
        >
          {error ||
            `Anuncio enviado a ${resultado.enviados} persona${resultado.enviados === 1 ? "" : "s"}.`}
          {resultado.fallidos > 0 && ` ${resultado.fallidos} fallaron — revisa el resumen que le llegó al equipo.`}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {resultado.restantes.length > 0 && (
            <button type="button" onClick={reintentarConRestantes} style={{ fontWeight: 700, padding: "8px 16px" }}>
              Reintentar con los {resultado.restantes.length} que faltaron
            </button>
          )}
          <button type="button" onClick={enviarOtro} style={{ padding: "8px 16px" }}>
            Mandar otro anuncio
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} style={{ display: "grid", gap: 14, marginTop: 20 }}>
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

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #ddd" }}>
          <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>
            O pega/sube una lista completa (un correo por línea, separados por coma, o lo que sea —
            se detecta automáticamente):
          </label>
          <textarea
            value={textoLista}
            onChange={(e) => setTextoLista(e.target.value)}
            rows={3}
            placeholder={"correo1@ejemplo.com\ncorreo2@ejemplo.com\ncorreo3@ejemplo.com"}
            style={{ width: "100%", fontSize: 13, padding: 6, fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              onChange={cargarArchivoLista}
              style={{ fontSize: 12 }}
            />
            <button
              type="button"
              onClick={agregarVarios}
              disabled={detectadosEnTexto.length === 0}
              style={{ padding: "5px 10px", fontSize: 13 }}
            >
              + Agregar {detectadosEnTexto.length > 0 ? `${detectadosEnTexto.length} correo${detectadosEnTexto.length === 1 ? "" : "s"}` : "lista"}
            </button>
          </div>
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

      <div style={{ fontSize: 13, fontWeight: 600 }}>
        Adjunto (opcional)
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {adjunto ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 400,
                background: "#eef7f1",
                border: "1px solid #cde6d9",
                borderRadius: 999,
                padding: "5px 6px 5px 12px",
              }}
            >
              📎 {adjunto.filename}
              <button
                type="button"
                onClick={() => setAdjunto(null)}
                title="Quitar adjunto"
                style={{ border: 0, background: "none", cursor: "pointer", color: "#c0392b", fontWeight: 700 }}
              >
                ✕
              </button>
            </span>
          ) : (
            <label style={{ fontWeight: 400, fontSize: 13 }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={elegirAdjunto}
                disabled={subiendoAdjunto}
                style={{ fontSize: 13 }}
              />
            </label>
          )}
          {subiendoAdjunto && <span style={{ fontSize: 12, opacity: 0.7 }}>Subiendo…</span>}
        </div>
        <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.6, display: "block", marginTop: 4 }}>
          Imagen o PDF, máximo 8 MB. Le llega a todos los destinatarios del mensaje.
        </span>
        {errorAdjunto && <p style={{ color: "crimson", fontSize: 13, margin: "4px 0 0" }}>{errorAdjunto}</p>}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={enviando || subiendoAdjunto || lista.length === 0 || !asunto.trim() || !mensaje.trim()}
          onClick={() => setConfirmando(true)}
          style={{ fontWeight: 700, padding: "8px 16px" }}
        >
          {enviando
            ? `Enviando… ${progreso.hechos} de ${progreso.total}`
            : `Enviar a ${lista.length} persona${lista.length === 1 ? "" : "s"}`}
        </button>
        {!enviando && (asunto || mensaje) && (
          <button type="button" onClick={limpiarMensaje} style={{ fontSize: 13, padding: "6px 12px" }}>
            Limpiar asunto y mensaje
          </button>
        )}
        {enviando && lista.length > TAMANO_TANDA && (
          <span style={{ fontSize: 12, opacity: 0.65 }}>
            Se manda en tandas de {TAMANO_TANDA} — no cierres esta pestaña.
          </span>
        )}
      </div>

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
              Se va a enviar, tal cual lo escribiste, a <b>{lista.length} persona{lista.length === 1 ? "" : "s"}</b>
              {adjunto ? (
                <>
                  {" "}
                  con el adjunto <b>{adjunto.filename}</b>
                </>
              ) : null}
              . No se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmando(false);
                  enviarTodo();
                }}
                style={{ background: "#0a1310", color: "#fff", borderColor: "#0a1310" }}
              >
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
