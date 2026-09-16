import { getListaCorreos, SETTING_TEAM_EMAIL, SETTING_EMAIL_BCC } from "./settings";
import { entradaUrl, qrUrl } from "./urls";

// El remitente y la API key siguen por variable de entorno (dependen de Resend).
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Comunidad Python Guatemala <no-reply@pythonguatemala.dev>";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3000/admin/dashboard";

// Netlify inyecta el hash del commit desplegado; sirve para comprobar, mirando
// un correo ya recibido, con qué versión del código se generó de verdad.
const BUILD_REF = (process.env.COMMIT_REF || "sin-commit-ref").slice(0, 7);

// Los correos del equipo y la copia oculta se editan desde el panel
// (/admin/dashboard/ajustes); la variable de entorno es el respaldo.
export const getCorreosEquipo = () => getListaCorreos(SETTING_TEAM_EMAIL, process.env.TEAM_EMAIL);
const getBccGlobal = () => getListaCorreos(SETTING_EMAIL_BCC, process.env.EMAIL_BCC);

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
  bcc?: string[]; // copia oculta extra para este envío (además de EMAIL_BCC)
}) {
  if (!API_KEY) {
    sinConfig();
    return;
  }
  // Junta la BCC global (ajuste del panel) con la de este envío, sin duplicar
  // ni meter en CCO a alguien que ya está en el "Para".
  const destinatarios = new Set(
    (Array.isArray(opts.to) ? opts.to : [opts.to]).map((s) => s.toLowerCase())
  );
  const bcc = [...new Set([...(await getBccGlobal()), ...(opts.bcc || [])])].filter(
    (b) => !destinatarios.has(b.toLowerCase())
  );
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
        ...(bcc.length ? { bcc } : {}),
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
  checkinToken?: string | null;
};

export async function sendRegistrationEmails(d: DatosInscripcion) {
  const TEAM_LIST = await getCorreosEquipo();
  // Al participante
  await enviar({
    to: d.correo,
    subject: `Inscripción recibida · ${d.eventoTitulo}`,
    html: layout(
      `¡Gracias por inscribirte, ${esc(d.nombre.split(" ")[0])}!`,
      `<p style="font-size:14px;line-height:1.6">Recibimos tu inscripción al <strong>${esc(
        d.eventoTitulo
      )}</strong>. Te esperamos. Si tienes dudas, responde a este correo.</p>
       ${
         d.checkinToken
           ? `<p style="font-size:14px;line-height:1.6;margin-top:16px"><strong>Tu entrada</strong> — muestra este código QR en la entrada del evento:</p>
              <p style="text-align:center;margin:12px 0"><img src="${qrUrl(
                d.checkinToken
              )}" alt="Código QR de tu entrada" width="220" height="220" style="border:6px solid #fff;border-radius:10px" /></p>
              <p style="text-align:center;font-size:13px"><a href="${entradaUrl(
                d.checkinToken
              )}" style="color:#159d68">Abrir mi entrada</a> (guárdala o toma una captura)</p>`
           : ""
       }
       <p style="font-size:13px;color:#666;margin-top:16px">Resumen de lo que enviaste:</p>
       ${filas([
         ["¿Asistirá?", d.asistira],
         ["Rol", d.rol],
         ["Universidad", d.universidad],
         ["Semestre", d.semestre],
         ["Experiencia con Python", d.experiencia],
       ])}`
    ),
    replyTo: TEAM_LIST[0],
    bcc: TEAM_LIST, // el equipo recibe copia oculta de lo que se le manda a la persona
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
  const TEAM_LIST = await getCorreosEquipo();
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
    bcc: TEAM_LIST, // el equipo recibe copia oculta de lo que se le manda a la persona
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

// ---------- Formulario de contacto ----------
export type DatosContacto = {
  nombre: string;
  correo: string;
  organizacion?: string | null;
  asunto: string;
  mensaje: string;
};

export async function sendContactEmail(d: DatosContacto) {
  const TEAM_LIST = await getCorreosEquipo();
  // Aviso al equipo
  if (TEAM_LIST.length) {
    await enviar({
      to: TEAM_LIST,
      subject: `Contacto (${d.asunto}): ${d.nombre}`,
      html: layout(
        `Nuevo mensaje de contacto · ${esc(d.asunto)}`,
        `${filas([
          ["Nombre", d.nombre],
          ["Correo", d.correo],
          ["Organización", d.organizacion],
          ["Asunto", d.asunto],
        ])}
        <p style="font-size:13px;color:#666;margin-top:12px">Mensaje:</p>
        <p style="font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(d.mensaje)}</p>
        <p style="margin-top:16px"><a href="${ADMIN_URL}/contacto" style="color:#159d68">Ver en el panel →</a></p>`
      ),
      replyTo: d.correo,
    });
  }

  // Acuse al remitente
  await enviar({
    to: d.correo,
    subject: "Recibimos tu mensaje · Python Guatemala",
    html: layout(
      `¡Gracias por escribirnos, ${esc(d.nombre.split(" ")[0])}!`,
      `<p style="font-size:14px;line-height:1.6">Recibimos tu mensaje sobre <strong>${esc(
        d.asunto
      )}</strong>. Te responderemos a este correo lo antes posible.</p>`
    ),
    replyTo: TEAM_LIST[0],
    bcc: TEAM_LIST, // el equipo recibe copia oculta de lo que se le manda a la persona
  });
}

// ---------- Anuncios masivos (panel: enviar un mensaje a mucha gente) ----------
export type DestinatarioAnuncio = { correo: string; nombre: string };

// Sustituye {{nombre}} por el primer nombre de la persona (o lo deja igual si
// no aparece en el mensaje).
function personaliza(mensaje: string, nombre: string): string {
  const primerNombre = (nombre || "").trim().split(/\s+/)[0] || nombre;
  return mensaje.replaceAll("{{nombre}}", primerNombre);
}

function parrafos(texto: string): string {
  return texto
    .split(/\n{2,}/)
    .map((p) => `<p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0 0 12px">${esc(p)}</p>`)
    .join("");
}

// "Nombre <correo>, Nombre2 <correo2>, … y N más" — para el resumen al equipo.
function listaLegible(lista: DestinatarioAnuncio[], tope = 150): string {
  const items = lista.slice(0, tope).map((d) => esc(`${d.nombre} <${d.correo}>`));
  const resto = lista.length - tope;
  return items.join(", ") + (resto > 0 ? ` … y ${resto} más` : "");
}

// Envía el mismo mensaje (personalizado con {{nombre}}) a una lista de
// personas. Cada quien recibe SU PROPIO correo, con una petición aparte a la
// API de Resend por persona (nunca se juntan varios destinatarios en un
// mismo "para", así nadie ve la lista de los demás) — la misma ruta que ya
// se usa para las confirmaciones de inscripción y postulación. Van en
// paralelo, en tandas pequeñas, para no tardar una eternidad ni saturar el
// límite de peticiones por segundo de Resend. Se verifica la respuesta de
// cada envío individualmente: nada se cuenta como entregado solo porque el
// lote completo "salió bien".
export async function enviarAnuncioMasivo(opts: {
  destinatarios: DestinatarioAnuncio[];
  asunto: string;
  mensaje: string; // texto plano; puede usar {{nombre}}; párrafos separados por línea en blanco
  eventoTitulo: string;
  remitenteEmail: string;
}): Promise<{ enviados: number; fallidos: number }> {
  if (!API_KEY) {
    sinConfig();
    return { enviados: 0, fallidos: opts.destinatarios.length };
  }
  if (opts.destinatarios.length === 0) return { enviados: 0, fallidos: 0 };

  const TEAM_LIST = await getCorreosEquipo();
  // Marca invisible al pie: para poder comprobar, en un correo ya recibido,
  // con qué versión del código y a qué hora se generó de verdad.
  const marca = `<p style="font-size:11px;color:#aaa;margin-top:22px;border-top:1px solid #eee;padding-top:8px">Generado ${new Date().toISOString()} · build ${BUILD_REF}</p>`;
  const html = (nombre: string) => layout(opts.asunto, parrafos(personaliza(opts.mensaje, nombre)) + marca);

  const enviarUno = async (d: DestinatarioAnuncio): Promise<boolean> => {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          from: FROM,
          to: [d.correo],
          subject: opts.asunto,
          html: html(d.nombre),
          ...(TEAM_LIST[0] ? { reply_to: TEAM_LIST[0] } : {}),
        }),
      });
      if (res.ok) return true;
      console.error("[anuncio] Resend respondió", d.correo, res.status, await res.text().catch(() => ""));
      return false;
    } catch (err) {
      console.error("[anuncio] no se pudo enviar a", d.correo, err);
      return false;
    }
  };

  let enviados = 0;
  const fallidosCorreos: string[] = [];
  const TANDA = 8; // concurrencia moderada, para no golpear el límite de Resend
  for (let i = 0; i < opts.destinatarios.length; i += TANDA) {
    const tanda = opts.destinatarios.slice(i, i + TANDA);
    const resultados = await Promise.all(tanda.map(enviarUno));
    resultados.forEach((ok, idx) => {
      if (ok) enviados++;
      else fallidosCorreos.push(tanda[idx].correo);
    });
  }

  // Una sola copia de resumen al equipo (no una por cada destinatario), con
  // el detalle de a quién se le envió — no solo el número.
  if (TEAM_LIST.length) {
    await enviar({
      to: TEAM_LIST,
      subject: `Anuncio enviado: ${opts.asunto}`,
      html: layout(
        "Se envió un anuncio",
        `${filas([
          ["Evento", opts.eventoTitulo],
          ["Enviado por", opts.remitenteEmail],
          ["Entregados", String(enviados)],
          ["Fallidos", fallidosCorreos.length ? String(fallidosCorreos.length) : null],
        ])}
        <p style="font-size:13px;color:#666;margin-top:12px">Enviado a:</p>
        <p style="font-size:13px;line-height:1.7">${listaLegible(opts.destinatarios)}</p>
        ${
          fallidosCorreos.length
            ? `<p style="font-size:13px;color:#c0392b;margin-top:10px">No se pudo entregar a: ${esc(
                fallidosCorreos.join(", ")
              )}</p>`
            : ""
        }
        <p style="font-size:13px;color:#666;margin-top:12px">Mensaje enviado:</p>
        ${parrafos(opts.mensaje)}
        ${marca}`
      ),
    });
  }

  return { enviados, fallidos: fallidosCorreos.length };
}
