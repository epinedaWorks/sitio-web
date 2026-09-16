"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getStore } from "@netlify/blobs";
import { prisma } from "@/lib/prisma";
import { fechaDesdeInput } from "@/lib/fecha";
import { enviarAnuncioMasivo, type DestinatarioAnuncio } from "@/lib/email";
import { requireAdminSession, requireAdminRole } from "@/lib/require-admin";
import {
  invalidarSettingsCache,
  SETTING_TEAM_EMAIL,
  SETTING_EMAIL_BCC,
} from "@/lib/settings";

const GALLERY_STORE = "gallery";

// ---- Usuarios del panel (solo ADMIN) ----
export async function crearUsuario(formData: FormData) {
  await requireAdminRole();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "EDITOR") === "ADMIN" ? "ADMIN" : "EDITOR";

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    redirect("/admin/dashboard/usuarios?msg=datos");
  }
  const existe = await prisma.adminUser.findUnique({ where: { email } });
  if (existe) redirect("/admin/dashboard/usuarios?msg=repetido");

  await prisma.adminUser.create({
    data: { name, email, role, passwordHash: await bcrypt.hash(password, 10) },
  });
  redirect("/admin/dashboard/usuarios?msg=creado");
}

export async function eliminarUsuario(id: string) {
  const session = await requireAdminRole();
  const yo = (session.user as { email?: string } | undefined)?.email;
  const objetivo = await prisma.adminUser.findUnique({ where: { id } });
  if (!objetivo) return;
  if (objetivo.email === yo) redirect("/admin/dashboard/usuarios?msg=propio");

  const total = await prisma.adminUser.count();
  if (total <= 1) redirect("/admin/dashboard/usuarios?msg=ultimo");

  await prisma.adminUser.delete({ where: { id } });
  redirect("/admin/dashboard/usuarios?msg=eliminado");
}

// Guarda los correos del equipo y la copia oculta (solo ADMIN).
export async function guardarAjustes(formData: FormData) {
  await requireAdminRole();
  const normaliza = (s: string) =>
    s
      .split(/[,\n;]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .join(", ");
  const team = normaliza(String(formData.get("teamEmail") || ""));
  const bcc = normaliza(String(formData.get("emailBcc") || ""));
  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: SETTING_TEAM_EMAIL },
      create: { key: SETTING_TEAM_EMAIL, value: team },
      update: { value: team },
    }),
    prisma.setting.upsert({
      where: { key: SETTING_EMAIL_BCC },
      create: { key: SETTING_EMAIL_BCC, value: bcc },
      update: { value: bcc },
    }),
  ]);
  invalidarSettingsCache();
  redirect("/admin/dashboard/ajustes?msg=ok");
}

// Cambia la contraseña del usuario admin que tiene la sesión activa.
export async function cambiarPassword(formData: FormData) {
  const session = await requireAdminSession();
  const email = session.user?.email;
  if (!email) redirect("/admin/login");

  const actual = String(formData.get("actual") || "");
  const nueva = String(formData.get("nueva") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (nueva.length < 8) redirect("/admin/dashboard/cuenta?msg=corta");
  if (nueva !== confirmar) redirect("/admin/dashboard/cuenta?msg=nocoincide");

  const user = await prisma.adminUser.findUnique({ where: { email: email! } });
  if (!user) redirect("/admin/dashboard/cuenta?msg=error");

  const ok = await bcrypt.compare(actual, user!.passwordHash);
  if (!ok) redirect("/admin/dashboard/cuenta?msg=malactual");

  await prisma.adminUser.update({
    where: { email: email! },
    data: { passwordHash: await bcrypt.hash(nueva, 10) },
  });
  redirect("/admin/dashboard/cuenta?msg=ok");
}

export async function crearEvento(formData: FormData) {
  await requireAdminSession();

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const date = String(formData.get("date") || "");
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title || !slug || !date) redirect("/admin/dashboard/eventos?msg=faltan");

  try {
    await prisma.event.create({
      data: {
        title,
        slug,
        date: fechaDesdeInput(date),
        location,
        description,
        published: formData.get("published") === "on",
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") redirect("/admin/dashboard/eventos?msg=slug");
    throw e;
  }

  revalidatePath("/admin/dashboard/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  redirect("/admin/dashboard/eventos?msg=creado");
}

// Edita un evento existente (título, slug, fecha, lugar, descripción, estado).
export async function editarEvento(id: string, formData: FormData) {
  await requireAdminSession();

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const date = String(formData.get("date") || "");
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const published = formData.get("published") === "on";

  if (!title || !slug || !date) redirect("/admin/dashboard/eventos?msg=faltan");

  const antes = await prisma.event.findUnique({ where: { id }, select: { slug: true } });

  try {
    await prisma.event.update({
      where: { id },
      data: { title, slug, date: fechaDesdeInput(date), location, description, published },
    });
  } catch (e: any) {
    if (e?.code === "P2002") redirect("/admin/dashboard/eventos?msg=slug");
    throw e;
  }

  revalidatePath("/admin/dashboard/eventos");
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${slug}`);
  if (antes && antes.slug !== slug) revalidatePath(`/eventos/${antes.slug}`);
  revalidatePath("/");
  redirect("/admin/dashboard/eventos?msg=guardado");
}

export async function togglePublicado(eventId: string, published: boolean) {
  await requireAdminSession();
  const e = await prisma.event.update({ where: { id: eventId }, data: { published } });
  revalidatePath("/admin/dashboard/eventos");
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${e.slug}`);
  revalidatePath("/");
}

export async function crearAlbum(formData: FormData) {
  await requireAdminSession();

  const eventId = String(formData.get("eventId") || "");
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");

  if (!eventId || !title) return;

  await prisma.album.create({ data: { eventId, title, description } });

  revalidatePath("/admin/dashboard/galeria");
  revalidatePath("/eventos");
}

export async function agregarFoto(formData: FormData) {
  await requireAdminSession();

  const albumId = String(formData.get("albumId") || "");
  const url = String(formData.get("url") || "").trim();
  const caption = String(formData.get("caption") || "");

  // Solo http(s) o rutas del propio sitio: nada de javascript:/data: etc.
  if (!albumId || !/^(https?:\/\/|\/)/i.test(url)) return;

  await prisma.galleryImage.create({ data: { albumId, url, caption } });

  revalidatePath("/admin/dashboard/galeria");
  revalidatePath("/eventos");
}

export async function eliminarFoto(imageId: string) {
  await requireAdminSession();
  const img = await prisma.galleryImage.delete({ where: { id: imageId } });
  // Si la foto era un archivo subido, borra también el blob.
  const m = img.url.match(/^\/api\/img\/(.+)$/);
  if (m) {
    try {
      await getStore({ name: GALLERY_STORE, consistency: "strong" }).delete(m[1]);
    } catch {
      /* si el almacenamiento no está disponible, al menos la fila ya se borró */
    }
  }
  revalidatePath("/admin/dashboard/galeria");
  revalidatePath("/");
  revalidatePath("/eventos");
}

export async function actualizarEstadoPonente(
  submissionId: string,
  status: "PENDIENTE" | "ACEPTADA" | "RECHAZADA"
) {
  await requireAdminSession();
  await prisma.speakerSubmission.update({
    where: { id: submissionId },
    data: { status },
  });
  revalidatePath("/admin/dashboard/ponentes");
}

// Mueve una foto una posición arriba o abajo dentro de su álbum.
export async function moverFoto(id: string, dir: "arriba" | "abajo") {
  await requireAdminSession();
  const foto = await prisma.galleryImage.findUnique({ where: { id } });
  if (!foto) return;
  const vecino = await prisma.galleryImage.findFirst({
    where: {
      albumId: foto.albumId,
      order: dir === "arriba" ? { lt: foto.order } : { gt: foto.order },
    },
    orderBy: { order: dir === "arriba" ? "desc" : "asc" },
  });
  if (!vecino) return;
  await prisma.$transaction([
    prisma.galleryImage.update({ where: { id: foto.id }, data: { order: vecino.order } }),
    prisma.galleryImage.update({ where: { id: vecino.id }, data: { order: foto.order } }),
  ]);
  revalidatePath("/admin/dashboard/galeria");
  revalidatePath("/");
}

export async function eliminarInscrito(id: string) {
  await requireAdminSession();
  await prisma.attendeeRegistration.delete({ where: { id } });
  revalidatePath("/admin/dashboard/inscritos");
}

// Marca / desmarca la asistencia de una persona a mano.
export async function toggleCheckin(id: string) {
  const session = await requireAdminSession();
  const reg = await prisma.attendeeRegistration.findUnique({ where: { id } });
  if (!reg) return;
  await prisma.attendeeRegistration.update({
    where: { id },
    data: reg.checkedInAt
      ? { checkedInAt: null, checkedInBy: null }
      : {
          checkedInAt: new Date(),
          checkedInBy: (session.user as { email?: string } | undefined)?.email ?? null,
        },
  });
  revalidatePath("/admin/dashboard/inscritos");
  revalidatePath("/admin/dashboard/checkin");
}

export async function eliminarContacto(id: string) {
  await requireAdminSession();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/dashboard/contacto");
}

export async function marcarContacto(id: string, atendido: boolean) {
  await requireAdminSession();
  await prisma.contactMessage.update({ where: { id }, data: { atendido } });
  revalidatePath("/admin/dashboard/contacto");
}

export async function eliminarPonente(id: string) {
  await requireAdminSession();
  await prisma.speakerSubmission.delete({ where: { id } });
  revalidatePath("/admin/dashboard/ponentes");
}

const ES_CORREO_ANUNCIO = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

function dedupePorCorreo(lista: DestinatarioAnuncio[]): DestinatarioAnuncio[] {
  const vistos = new Set<string>();
  return lista.filter((d) => {
    const k = d.correo.toLowerCase();
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

// ---- Anuncios masivos (solo ADMIN): un mensaje a asistentes y/o ponentes ----
// de un evento, o una prueba a las direcciones que el admin escriba. Cada
// persona recibe su propio correo (nunca se juntan varios destinatarios en
// un mismo "para"). La lista de destinatarios la arma el panel en el
// navegador (a partir de los inscritos/ponentes del evento) y el admin
// puede quitar o agregar correos a mano antes de enviar; el servidor
// recibe esa lista ya definitiva.
export async function enviarAnuncio(formData: FormData) {
  const session = await requireAdminRole();

  const eventId = String(formData.get("eventId") || "");
  const soloPrueba = formData.get("prueba") === "on";
  const asunto = String(formData.get("asunto") || "").trim();
  const mensaje = String(formData.get("mensaje") || "").trim();

  if (!eventId || !asunto || !mensaje) {
    redirect("/admin/dashboard/anuncios?msg=faltan");
  }

  const evento = await prisma.event.findUnique({ where: { id: eventId } });
  if (!evento) redirect("/admin/dashboard/anuncios?msg=error");

  const correoAdmin = session.user?.email || "";
  let destinatarios: DestinatarioAnuncio[];

  if (soloPrueba) {
    // Direcciones que el admin escribió a mano en el campo de prueba
    // (separadas por coma, punto y coma, espacio o salto de línea). Si no
    // puso ninguna válida, cae al correo con el que inició sesión.
    const crudo = String(formData.get("correosPrueba") || "");
    const escritas = crudo
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => ES_CORREO_ANUNCIO(s))
      .map((correo) => ({ correo, nombre: correo.split("@")[0] }));
    destinatarios = dedupePorCorreo(
      escritas.length ? escritas : correoAdmin ? [{ correo: correoAdmin, nombre: session.user?.name || "Admin" }] : []
    );
  } else {
    let lista: unknown = [];
    try {
      lista = JSON.parse(String(formData.get("destinatariosJson") || "[]"));
    } catch {
      lista = [];
    }
    destinatarios = dedupePorCorreo(
      (Array.isArray(lista) ? lista : [])
        .filter(
          (d): d is { correo: string; nombre?: string } =>
            !!d && typeof d.correo === "string" && ES_CORREO_ANUNCIO(d.correo.trim())
        )
        .map((d) => ({ correo: d.correo.trim(), nombre: (d.nombre || "").trim() || d.correo.trim() }))
    );
  }

  if (destinatarios.length === 0) redirect("/admin/dashboard/anuncios?msg=vacio");

  const asuntoFinal = soloPrueba ? `[PRUEBA] ${asunto}` : asunto;
  const { enviados, fallidos } = await enviarAnuncioMasivo({
    destinatarios,
    asunto: asuntoFinal,
    mensaje,
    eventoTitulo: evento.title,
    remitenteEmail: correoAdmin || "el panel",
    omitirResumenEquipo: soloPrueba,
  });

  const msg = soloPrueba ? "prueba" : "enviado";
  redirect(`/admin/dashboard/anuncios?msg=${msg}&n=${enviados}${fallidos ? `&f=${fallidos}` : ""}`);
}
