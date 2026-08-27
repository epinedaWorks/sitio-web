// Configuración por variables de entorno (.env)
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Comunidad Python Guatemala <no-reply@pythonguatemala.dev>";
const TEAM_LIST = (process.env.TEAM_EMAIL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean); // correo(s) del equipo
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3000/admin/dashboard";

let avisado = false;
function sinConfig() {
  if (!avisado) {
    console.warn("[email] RESEND_API_KEY no configurada — no se envían correos.");
    avisado = true;
  }
}

// Nunca lanza: si el correo falla, la inscripción/postulación igual queda guardada.
// Llamada directa a la API de Resend con charset UTF-8 explícito para que los
// acentos y emojis no lleguen como "�" en algunos clientes de correo.
async function enviar(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string | string[];
}) {
  if (!API_KEY) {
    sinConfig();
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo && opts.replyTo.length ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend respondió", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[email] no se pudo enviar:", err);
  }
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function layout(titulo: string, cuerpo: string) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head>
<body style="margin:0;background:#f4f4f4;padding:16px">
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <div style="background:#0a1310;color:#f4eee1;padding:20px 24px;border-radius:12px 12px 0 0">
      <strong style="font-size:16px">&#128013; Comunidad Python Guatemala</strong>
    </div>
    <div style="background:#fff;border:1px solid #e5e5e5;border-top:none;padding:24px;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 12px;font-size:18px">${esc(titulo)}</h2>
      ${cuerpo}
    </div>
  </div>
</body></html>`;
}

function filas(pares: [string, string | null | undefined][]) {
  return `<table style="border-collapse:collapse;font-size:14px;width:100%">${pares
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(
          k
        )}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`
    )
    .join("")}</table>`;
}

// ---------- Inscripción de asistente ----------
export type DatosInscripcion = {
  nombre: string;
  correo: string;
  telefono?: string | null;
  asistira?: string | null;
  rol?: string | null;
  universidad?: string | null;
  semestre?: string | null;
  experiencia?: string | null;
  comoSeEntero?: string | null;
  comentarios?: string | null;
  compartirDatos?: boolean;
  eventoTitulo: string;
};

export async function sendRegistrationEmails(d: DatosInscripcion) {
  // Al participante
  await enviar({
    to: d.correo,
    subject: `Inscripción recibida · ${d.eventoTitulo}`,
    html: layout(
      `¡Gracias por inscribirte, ${esc(d.nombre.split(" ")[0])}!`,
      `<p style="font-size:14px;line-height:1.6">Recibimos tu inscripción al <strong>${esc(
        d.eventoTitulo
      )}</strong>. Te esperamos. Si tienes dudas, responde a este correo.</p>
       <p style="font-size:13px;color:#666">Resumen de lo que enviaste:</p>
       ${filas([
         ["¿Asistirá?", d.asistira],
         ["Rol", d.rol],
         ["Universidad", d.universidad],
         ["Semestre", d.semestre],
         ["Experiencia con Python", d.experiencia],
       ])}`
    ),
    replyTo: TEAM_LIST[0],
  });

  // Al equipo
  if (TEAM_LIST.length) {
    await enviar({
      to: TEAM_LIST,
      subject: `Nueva inscripción: ${d.nombre} · ${d.eventoTitulo}`,
      html: layout(
        "Nueva inscripción de asistente",
        `${filas([
          ["Nombre", d.nombre],
          ["Correo", d.correo],
          ["Teléfono", d.telefono],
          ["¿Asistirá?", d.asistira],
          ["Rol", d.rol],
          ["Universidad", d.universidad],
          ["Semestre", d.semestre],
          ["Experiencia", d.experiencia],
          ["¿Cómo se enteró?", d.comoSeEntero],
          ["Comentarios", d.comentarios],
          ["Autoriza compartir datos", d.compartirDatos ? "Sí" : "No"],
          ["Evento", d.eventoTitulo],
        ])}
        <p style="margin-top:16px"><a href="${ADMIN_URL}/inscritos" style="color:#159d68">Ver en el panel →</a></p>`
      ),
      replyTo: d.correo,
    });
  }
}

// ---------- Postulación de ponente ----------
export type DatosPonente = {
  nombre: string;
  correo: string;
  telefono?: string | null;
  modalidad: string;
  tema: string;
  descripcion: string;
  nivel?: string | null;
  bio?: string | null;
  sigueComunidad?: boolean;
  linkedin?: string | null;
  instagram?: string | null;
  empresa?: string | null;
  cargo?: string | null;
  edad?: number | null;
  fotoUrl?: string | null;
  pais?: string | null;
  comoSeEntero?: string | null;
  comentarios?: string | null;
  compartirDatos?: boolean;
  eventoTitulo: string;
};

export async function sendSpeakerEmails(d: DatosPonente) {
  await enviar({
    to: d.correo,
    subject: `Propuesta recibida · ${d.eventoTitulo}`,
    html: layout(
      `¡Gracias por postularte, ${esc(d.nombre.split(" ")[0])}!`,
      `<p style="font-size:14px;line-height:1.6">Recibimos tu propuesta <strong>"${esc(
        d.tema
      )}"</strong> (${esc(d.modalidad)}) para el <strong>${esc(
        d.eventoTitulo
      )}</strong>. El equipo core la revisará y te escribirá a este correo.</p>`
    ),
    replyTo: TEAM_LIST[0],
  });

  if (TEAM_LIST.length) {
    await enviar({
      to: TEAM_LIST,
      subject: `Nueva propuesta de ponente: ${d.tema} · ${d.nombre}`,
      html: layout(
        "Nueva propuesta de ponente",
        `${filas([
          ["Nombre", d.nombre],
          ["Correo", d.correo],
          ["Teléfono", d.telefono],
          ["Modalidad", d.modalidad],
          ["Tema", d.tema],
          ["Nivel", d.nivel],
          ["LinkedIn", d.linkedin],
          ["Instagram", d.instagram],
          ["Empresa", d.empresa],
          ["Cargo", d.cargo],
          ["Edad", d.edad ? String(d.edad) : null],
          ["¿Sigue a la comunidad?", d.sigueComunidad ? "Sí" : "No"],
          ["¿De otro país?", d.pais],
          ["¿Cómo se enteró?", d.comoSeEntero],
          ["Autoriza compartir datos", d.compartirDatos ? "Sí" : "No"],
          ["Foto", d.fotoUrl],
        ])}
        <p style="font-size:13px;color:#666;margin-top:12px">Descripción:</p>
        <p style="font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(d.descripcion)}</p>
        ${d.bio ? `<p style="font-size:13px;color:#666;margin-top:12px">Bio:</p><p style="font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(d.bio)}</p>` : ""}
        ${d.comentarios ? `<p style="font-size:13px;color:#666;margin-top:12px">Comentarios:</p><p style="font-size:14px;white-space:pre-wrap">${esc(d.comentarios)}</p>` : ""}
        <p style="margin-top:16px"><a href="${ADMIN_URL}/ponentes" style="color:#159d68">Ver en el panel →</a></p>`
      ),
      replyTo: d.correo,
    });
  }
}
