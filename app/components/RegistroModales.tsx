"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EVENT_SLUG } from "../site-data";

type Modo = null | "inscripcion" | "ponente" | "contacto";
type Estado = "idle" | "enviando" | "ok";

// URLs cortas para compartir: cada una abre su formulario al cargar.
const RUTA_A_MODO: Record<string, Exclude<Modo, null>> = {
  "/inscripcion": "inscripcion",
  "/conferencistas": "ponente",
  "/ponentes": "ponente",
  "/contacto": "contacto",
};

export default function RegistroModales() {
  const pathname = usePathname();
  const router = useRouter();
  const [modo, setModo] = useState<Modo>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState("");
  const [rolAsistente, setRolAsistente] = useState("");
  const [modalidadPonente, setModalidadPonente] = useState("");
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abrir = useCallback((m: Exclude<Modo, null>) => {
    setEstado("idle");
    setError("");
    setRolAsistente("");
    setModalidadPonente("");
    setModo(m);
  }, []);

  const cerrar = useCallback(() => {
    setModo(null);
    // Si venías de una URL corta (/inscripcion, /conferencistas…), vuelve al inicio.
    if (pathname && RUTA_A_MODO[pathname]) router.replace("/");
  }, [pathname, router]);

  // Abre el formulario correspondiente si la URL es una de las cortas.
  useEffect(() => {
    if (pathname && RUTA_A_MODO[pathname]) abrir(RUTA_A_MODO[pathname]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const lanzarToast = useCallback((msg: string, err = false) => {
    setToast({ msg, err });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  // Conecta los botones .js-inscribir / .js-ponente / .js-contacto del HTML
  useEffect(() => {
    const grupos: [string, Exclude<Modo, null>][] = [
      [".js-inscribir", "inscripcion"],
      [".js-ponente", "ponente"],
      [".js-contacto", "contacto"],
    ];
    const limpiar: (() => void)[] = [];
    grupos.forEach(([sel, m]) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
      const fn = (e: Event) => {
        e.preventDefault();
        abrir(m);
      };
      els.forEach((el) => el.addEventListener("click", fn));
      limpiar.push(() => els.forEach((el) => el.removeEventListener("click", fn)));
    });
    return () => limpiar.forEach((f) => f());
  }, [abrir]);

  // Escape + bloqueo de scroll mientras el modal está abierto
  useEffect(() => {
    if (!modo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modo, cerrar]);

  async function enviarInscripcion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_web: f.get("nombre_web"),
          nombre: f.get("nombre"),
          correo: f.get("correo"),
          telefono: f.get("telefono"),
          asistira: f.get("asistira"),
          rol: f.get("rol"),
          universidad: f.get("universidad"),
          semestre: f.get("semestre"),
          experiencia: f.get("experiencia"),
          comoSeEntero: f.get("comoSeEntero"),
          comentarios: f.get("comentarios"),
          compartirDatos: f.get("compartirDatos") === "on",
          eventSlug: EVENT_SLUG,
        }),
      });
      if (res.ok) {
        setEstado("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo completar la inscripción.");
        setEstado("idle");
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
      setEstado("idle");
    }
  }

  async function enviarPonente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_web: f.get("nombre_web"),
          nombre: f.get("nombre"),
          correo: f.get("correo"),
          telefono: f.get("telefono"),
          modalidad: f.get("modalidad"),
          tema: f.get("tema"),
          descripcion: f.get("descripcion"),
          nivel: f.get("nivel"),
          bio: f.get("bio"),
          sigueComunidad: f.get("sigueComunidad") === "si",
          linkedin: f.get("linkedin"),
          instagram: f.get("instagram"),
          empresa: f.get("empresa"),
          cargo: f.get("cargo"),
          edad: f.get("edad"),
          fotoUrl: f.get("fotoUrl"),
          pais: f.get("pais"),
          comoSeEntero: f.get("comoSeEntero"),
          comentarios: f.get("comentarios"),
          integrantes: f.get("integrantes"),
          necesidades: f.get("necesidades"),
          compartirDatos: f.get("compartirDatos") === "on",
          eventSlug: EVENT_SLUG,
        }),
      });
      if (res.ok) {
        setEstado("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo enviar la postulación.");
        setEstado("idle");
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
      setEstado("idle");
    }
  }

  async function enviarContacto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_web: f.get("nombre_web"),
          nombre: f.get("nombre"),
          correo: f.get("correo"),
          organizacion: f.get("organizacion"),
          asunto: f.get("asunto"),
          mensaje: f.get("mensaje"),
        }),
      });
      if (res.ok) {
        setEstado("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo enviar el mensaje.");
        setEstado("idle");
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
      setEstado("idle");
    }
  }

  function cerrarConToast() {
    if (estado === "ok") {
      lanzarToast(
        modo === "inscripcion"
          ? "¡Inscripción confirmada! Te esperamos en el Python eXposition Day 2026."
          : modo === "ponente"
            ? "¡Propuesta recibida! El equipo core te escribirá pronto."
            : "¡Mensaje enviado! Te responderemos a tu correo."
      );
    }
    cerrar();
  }

  return (
    <>
      {modo && (
        <div className="modal-scrim" onClick={cerrarConToast} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {estado === "ok" ? (
              <div className="modal-done">
                <div className="big">🎉</div>
                <h3>
                  {modo === "inscripcion"
                    ? "¡Listo, quedaste inscrito!"
                    : modo === "ponente"
                      ? "¡Gracias por postularte!"
                      : "¡Mensaje enviado!"}
                </h3>
                <p>
                  {modo === "inscripcion"
                    ? "Te esperamos el sábado 3 de octubre de 2026 en la UVG."
                    : modo === "ponente"
                      ? "El equipo core revisará tu propuesta y te escribirá a tu correo."
                      : "Recibimos tu mensaje. Te responderemos a tu correo lo antes posible."}
                </p>
                <button className="btn btn-primary" onClick={cerrarConToast}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="modal-head">
                  <div>
                    <h3>
                      {modo === "inscripcion"
                        ? "Inscríbete al Python eXposition Day 2026"
                        : modo === "ponente"
                          ? "Sé parte del Python eXposition Day 2026"
                          : "Contáctanos"}
                    </h3>
                    <p>
                      {modo === "inscripcion"
                        ? "Entrada gratuita · cupo limitado · sábado 3 de octubre · UVG"
                        : modo === "ponente"
                          ? "Charla, taller o exposición de proyecto. Cuéntanos tu idea."
                          : "¿Quieres patrocinar, colaborar o pedir más información? Escríbenos."}
                    </p>
                  </div>
                  <button className="modal-close" aria-label="Cerrar" onClick={cerrarConToast}>
                    ✕
                  </button>
                </div>

                {modo === "inscripcion" ? (
                  <form className="form-grid" onSubmit={enviarInscripcion}>
                    <input
                      type="text"
                      name="nombre_web"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                    />
                    <div className="form-field">
                      <label htmlFor="i-asistira">¿Asistirás al evento? *</label>
                      <select id="i-asistira" name="asistira" required defaultValue="">
                        <option value="" disabled>
                          Elige una opción
                        </option>
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                        <option value="Tal vez">Tal vez</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="i-nombre">Nombre completo *</label>
                      <input id="i-nombre" name="nombre" required />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="i-correo">Correo *</label>
                        <input id="i-correo" name="correo" type="email" required />
                      </div>
                      <div className="form-field">
                        <label htmlFor="i-tel">Teléfono / WhatsApp</label>
                        <input id="i-tel" name="telefono" type="tel" placeholder="Opcional" />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="i-rol">Rol actual *</label>
                      <select
                        id="i-rol"
                        name="rol"
                        required
                        defaultValue=""
                        onChange={(e) => setRolAsistente(e.target.value)}
                      >
                        <option value="" disabled>
                          Elige tu rol
                        </option>
                        <option value="Estudiante">Estudiante</option>
                        <option value="Desarrollador(a)">Desarrollador(a)</option>
                        <option value="Analista de Datos">Analista de Datos</option>
                        <option value="Científico(a) de Datos">Científico(a) de Datos</option>
                        <option value="Profesor(a)">Profesor(a)</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    {rolAsistente === "Estudiante" && (
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="i-uni">¿De qué universidad?</label>
                          <select id="i-uni" name="universidad" defaultValue="">
                            <option value="">Elige una…</option>
                            <option value="Universidad del Valle de Guatemala (UVG)">Universidad del Valle (UVG)</option>
                            <option value="Universidad de San Carlos (USAC)">Universidad de San Carlos (USAC)</option>
                            <option value="Universidad Galileo">Universidad Galileo</option>
                            <option value="Universidad Mariano Gálvez (UMG)">Universidad Mariano Gálvez (UMG)</option>
                            <option value="Universidad Francisco Marroquín (UFM)">Universidad Francisco Marroquín (UFM)</option>
                            <option value="Universidad Panamericana (UPANA)">Universidad Panamericana (UPANA)</option>
                            <option value="Otra">Otra</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label htmlFor="i-sem">¿Qué semestre?</label>
                          <select id="i-sem" name="semestre" defaultValue="">
                            <option value="">Elige…</option>
                            <option value="1 - 3 semestre">1 – 3 semestre</option>
                            <option value="3 - 6 semestre">3 – 6 semestre</option>
                            <option value="6 - 8 semestre">6 – 8 semestre</option>
                            <option value="8 - 10 semestre">8 – 10 semestre</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="form-field">
                      <label htmlFor="i-exp">Nivel de experiencia con Python</label>
                      <select id="i-exp" name="experiencia" defaultValue="">
                        <option value="">Prefiero no decir</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="i-fuente">¿Cómo te enteraste del evento?</label>
                      <select id="i-fuente" name="comoSeEntero" defaultValue="">
                        <option value="">Prefiero no decir</option>
                        <option value="Redes Sociales">Redes sociales</option>
                        <option value="Recomendación de un amigo">Recomendación de un amigo</option>
                        <option value="Boletín informativo">Boletín informativo</option>
                        <option value="Anuncio">Anuncio</option>
                        <option value="Universidad / Trabajo">Universidad / Trabajo</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="i-coment">Comentarios o preguntas</label>
                      <textarea id="i-coment" name="comentarios" rows={2} placeholder="Opcional" />
                    </div>

                    <label className="form-check">
                      <input type="checkbox" name="compartirDatos" />
                      <span>
                        Marca esta casilla si gustas compartir tus datos de contacto con empresas
                        aliadas de la comunidad que buscan talento (oportunidades de trabajo,
                        pasantías, etc.). Es <b>opcional</b> y no influye en tu inscripción.
                      </span>
                    </label>

                    {error && <p className="form-error">{error}</p>}
                    <div className="form-actions">
                      <button className="btn js-inscribir" type="submit" disabled={estado === "enviando"}>
                        {estado === "enviando" ? "Enviando…" : "Confirmar inscripción"}
                      </button>
                    </div>
                  </form>
                ) : modo === "ponente" ? (
                  <form className="form-grid" onSubmit={enviarPonente}>
                    <input
                      type="text"
                      name="nombre_web"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                    />
                    <div className="form-section">Tus datos</div>
                    <div className="form-field">
                      <label htmlFor="p-nombre">Nombre completo *</label>
                      <input id="p-nombre" name="nombre" required autoFocus />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="p-correo">Correo *</label>
                        <input id="p-correo" name="correo" type="email" required />
                      </div>
                      <div className="form-field">
                        <label htmlFor="p-tel">Teléfono / WhatsApp</label>
                        <input id="p-tel" name="telefono" type="tel" placeholder="+502 XXXX XXXX" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="p-empresa">Empresa donde trabajas</label>
                        <input id="p-empresa" name="empresa" placeholder="Opcional" />
                      </div>
                      <div className="form-field">
                        <label htmlFor="p-cargo">Cargo</label>
                        <input id="p-cargo" name="cargo" placeholder="Opcional" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="p-edad">Tu edad</label>
                        <input id="p-edad" name="edad" type="number" min={1} max={120} placeholder="Opcional" />
                      </div>
                      <div className="form-field">
                        <label htmlFor="p-pais">¿Nos visitas de otro país?</label>
                        <input id="p-pais" name="pais" placeholder="No / nombre del país" />
                      </div>
                    </div>

                    <div className="form-section">Tu propuesta</div>
                    <div className="form-field">
                      <label htmlFor="p-mod">¿Cómo quieres participar? *</label>
                      <select
                        id="p-mod"
                        name="modalidad"
                        required
                        defaultValue=""
                        onChange={(e) => setModalidadPonente(e.target.value)}
                      >
                        <option value="" disabled>
                          Elige una modalidad
                        </option>
                        <option value="CHARLA">Charla / Conferencia</option>
                        <option value="TALLER">Taller</option>
                        <option value="PROYECTO">Exposición de proyecto</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-tema">Nombre de tu propuesta *</label>
                      <input id="p-tema" name="tema" required placeholder="Un título atractivo para tu charla, taller o proyecto" />
                      <span className="form-hint">
                        Categorías sugeridas: Lenguaje y buenas prácticas · Data Science / ML · Cloud &amp; DevOps ·
                        Web y APIs · Ciberseguridad · IoT y hardware · Visualización · Dashboards · Automatización ·
                        Proyectos empresariales · Ciencia de datos · Aplicaciones sociales · Videojuegos · Comunidad y Open Source
                      </span>
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-desc">Descripción de tu propuesta *</label>
                      <textarea
                        id="p-desc"
                        name="descripcion"
                        rows={4}
                        required
                        maxLength={7000}
                        placeholder="Temas que vas a abordar, herramientas, requisitos de la audiencia, etc. Mientras más organizado, mejor. (máx. ~1000 palabras)"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-nivel">Nivel de dificultad *</label>
                      <select id="p-nivel" name="nivel" required defaultValue="">
                        <option value="" disabled>
                          Elige un nivel
                        </option>
                        <option value="BASICO">Básico</option>
                        <option value="INTERMEDIO">Intermedio</option>
                        <option value="AVANZADO">Avanzado</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-bio">Acerca de ti *</label>
                      <textarea
                        id="p-bio"
                        name="bio"
                        rows={3}
                        required
                        placeholder="Una bio corta: quién eres, lo que te apasiona y por qué quieres participar. Aparecerá al publicarte en redes."
                      />
                    </div>

                    {modalidadPonente === "PROYECTO" && (
                      <div className="form-field">
                        <label htmlFor="p-integrantes">¿El proyecto es en grupo? Integrantes</label>
                        <textarea
                          id="p-integrantes"
                          name="integrantes"
                          rows={3}
                          placeholder="Si lo exponen varias personas, escribe el nombre y carné de cada integrante (una por línea). Déjalo vacío si es individual."
                        />
                      </div>
                    )}

                    {(modalidadPonente === "TALLER" || modalidadPonente === "PROYECTO") && (
                      <div className="form-field">
                        <label htmlFor="p-necesidades">
                          ¿Necesitan algo especial para el {modalidadPonente === "TALLER" ? "taller" : "montaje"}?
                        </label>
                        <textarea
                          id="p-necesidades"
                          name="necesidades"
                          rows={2}
                          placeholder="Regletas / tomas de corriente, mesas, más espacio, proyector, pizarra, internet, etc. (opcional)"
                        />
                      </div>
                    )}

                    <div className="form-section">Redes y contacto</div>
                    <div className="form-field">
                      <label htmlFor="p-sigue">¿Ya sigues a la comunidad Python Guatemala en alguna red? *</label>
                      <select id="p-sigue" name="sigueComunidad" required defaultValue="">
                        <option value="" disabled>
                          Elige una opción
                        </option>
                        <option value="si">Sí</option>
                        <option value="no">Todavía no</option>
                      </select>
                      <span className="form-hint">
                        Necesitas seguirnos (Meetup, Instagram, Facebook, YouTube, GitHub o LinkedIn — @PythonGuatemala)
                        para que tu propuesta sea considerada.
                      </span>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="p-linkedin">Tu LinkedIn *</label>
                        <input id="p-linkedin" name="linkedin" required placeholder="URL de tu perfil" />
                      </div>
                      <div className="form-field">
                        <label htmlFor="p-ig">Tu Instagram</label>
                        <input id="p-ig" name="instagram" placeholder="Opcional" />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-foto">Foto (URL)</label>
                      <input id="p-foto" name="fotoUrl" type="url" placeholder="Opcional — te la pediremos si eres seleccionado" />
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-fuente">¿Cómo te enteraste del evento?</label>
                      <select id="p-fuente" name="comoSeEntero" defaultValue="">
                        <option value="">Prefiero no decir</option>
                        <option value="Redes Sociales">Redes sociales</option>
                        <option value="Recomendación de un amigo">Recomendación de un amigo</option>
                        <option value="Boletín informativo">Boletín informativo</option>
                        <option value="Anuncio">Anuncio</option>
                        <option value="Universidad / Trabajo">Universidad / Trabajo</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="p-coment">Comentarios</label>
                      <textarea
                        id="p-coment"
                        name="comentarios"
                        rows={2}
                        placeholder="Dudas, comentarios o si necesitas alguna asistencia física. (opcional)"
                      />
                    </div>

                    <label className="form-check">
                      <input type="checkbox" name="compartirDatos" />
                      <span>
                        Marca esta casilla si gustas compartir tus datos de contacto con empresas
                        aliadas de la comunidad que buscan talento (oportunidades de trabajo,
                        pasantías, etc.). Es <b>opcional</b> y no influye en la evaluación de tu
                        propuesta.
                      </span>
                    </label>

                    {error && <p className="form-error">{error}</p>}
                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit" disabled={estado === "enviando"}>
                        {estado === "enviando" ? "Enviando…" : "Enviar postulación"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="form-grid" onSubmit={enviarContacto}>
                    <input
                      type="text"
                      name="nombre_web"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                    />
                    <div className="form-field">
                      <label htmlFor="c-nombre">Nombre *</label>
                      <input id="c-nombre" name="nombre" required autoFocus />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="c-correo">Correo *</label>
                        <input id="c-correo" name="correo" type="email" required />
                      </div>
                      <div className="form-field">
                        <label htmlFor="c-org">Organización / empresa</label>
                        <input id="c-org" name="organizacion" placeholder="Opcional" />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="c-asunto">¿Sobre qué nos escribes? *</label>
                      <select id="c-asunto" name="asunto" required defaultValue="">
                        <option value="" disabled>
                          Elige un tema
                        </option>
                        <option value="Patrocinio">Patrocinio</option>
                        <option value="Más información">Más información</option>
                        <option value="Colaboración">Colaboración</option>
                        <option value="Prensa">Prensa</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="c-msg">Mensaje *</label>
                      <textarea
                        id="c-msg"
                        name="mensaje"
                        rows={4}
                        required
                        placeholder="Cuéntanos brevemente qué necesitas."
                      />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit" disabled={estado === "enviando"}>
                        {estado === "enviando" ? "Enviando…" : "Enviar mensaje"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-wrap">
          <div className={`toast${toast.err ? " err" : ""}`}>
            <span>{toast.err ? "⚠️" : "✅"}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </>
  );
}
