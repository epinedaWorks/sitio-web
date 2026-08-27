"use client";

import { useState } from "react";

type Modo = "cerrado" | "inscripcion" | "ponente";

export default function EventoModales({ eventSlug }: { eventSlug: string }) {
  const [modo, setModo] = useState<Modo>("cerrado");

  return (
    <>
      <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
        <button onClick={() => setModo("inscripcion")}>Inscribirme al evento</button>
        <button onClick={() => setModo("ponente")}>Ser conferencista, tallerista o expositor</button>
      </div>

      {modo === "inscripcion" && (
        <ModalBase onClose={() => setModo("cerrado")} titulo="Inscripción al evento">
          <FormularioInscripcion eventSlug={eventSlug} onDone={() => setModo("cerrado")} />
        </ModalBase>
      )}

      {modo === "ponente" && (
        <ModalBase onClose={() => setModo("cerrado")} titulo="Postulación como ponente">
          <FormularioPonente eventSlug={eventSlug} onDone={() => setModo("cerrado")} />
        </ModalBase>
      )}
    </>
  );
}

function ModalBase({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 16px",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 480, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{titulo}</h3>
          <button onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormularioInscripcion({ eventSlug, onDone }: { eventSlug: string; onDone: () => void }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [mensajeError, setMensajeError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        correo: form.get("correo"),
        telefono: form.get("telefono"),
        eventSlug,
      }),
    });

    if (res.ok) {
      setEstado("ok");
    } else {
      const data = await res.json().catch(() => ({}));
      setMensajeError(data.error || "No se pudo completar la inscripción.");
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div style={{ marginTop: 16 }}>
        <p>¡Listo! Ya estás inscrito. Te esperamos en el evento.</p>
        <button onClick={onDone}>Cerrar</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
      <input name="nombre" placeholder="Nombre completo" required />
      <input name="correo" type="email" placeholder="Correo electrónico" required />
      <input name="telefono" type="tel" placeholder="Teléfono / WhatsApp (opcional)" />
      {estado === "error" && <p style={{ color: "crimson", fontSize: 14 }}>{mensajeError}</p>}
      <button type="submit" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando..." : "Confirmar inscripción"}
      </button>
    </form>
  );
}

function FormularioPonente({ eventSlug, onDone }: { eventSlug: string; onDone: () => void }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/speakers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        correo: form.get("correo"),
        telefono: form.get("telefono"),
        modalidad: form.get("modalidad"),
        tema: form.get("tema"),
        descripcion: form.get("descripcion"),
        experiencia: form.get("experiencia"),
        eventSlug,
      }),
    });

    setEstado(res.ok ? "ok" : "error");
  }

  if (estado === "ok") {
    return (
      <div style={{ marginTop: 16 }}>
        <p>¡Gracias! El equipo core revisará tu propuesta y te escribirá a tu correo.</p>
        <button onClick={onDone}>Cerrar</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
      <input name="nombre" placeholder="Nombre completo" required />
      <input name="correo" type="email" placeholder="Correo electrónico" required />
      <input name="telefono" type="tel" placeholder="Teléfono / WhatsApp (opcional)" />
      <select name="modalidad" required defaultValue="">
        <option value="" disabled>
          ¿Cómo quieres participar?
        </option>
        <option value="CHARLA">Charla</option>
        <option value="TALLER">Taller</option>
        <option value="PROYECTO">Exposición de proyecto</option>
      </select>
      <input name="tema" placeholder="Tema o título propuesto" required />
      <textarea name="descripcion" placeholder="Cuéntanos más" rows={3} required />
      <textarea name="experiencia" placeholder="Experiencia previa (opcional)" rows={2} />
      {estado === "error" && <p style={{ color: "crimson", fontSize: 14 }}>Hubo un problema, intenta de nuevo.</p>}
      <button type="submit" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando..." : "Enviar postulación"}
      </button>
    </form>
  );
}
