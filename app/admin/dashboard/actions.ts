"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getStore } from "@netlify/blobs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

const GALLERY_STORE = "gallery";

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

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const date = String(formData.get("date") || "");
  const location = String(formData.get("location") || "");
  const description = String(formData.get("description") || "");

  if (!title || !slug || !date) return;

  await prisma.event.create({
    data: {
      title,
      slug,
      date: new Date(date),
      location,
      description,
      published: formData.get("published") === "on",
    },
  });

  revalidatePath("/admin/dashboard/eventos");
  revalidatePath("/eventos");
}

export async function togglePublicado(eventId: string, published: boolean) {
  await requireAdminSession();
  await prisma.event.update({ where: { id: eventId }, data: { published } });
  revalidatePath("/admin/dashboard/eventos");
  revalidatePath("/eventos");
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

export async function eliminarInscrito(id: string) {
  await requireAdminSession();
  await prisma.attendeeRegistration.delete({ where: { id } });
  revalidatePath("/admin/dashboard/inscritos");
}

export async function eliminarPonente(id: string) {
  await requireAdminSession();
  await prisma.speakerSubmission.delete({ where: { id } });
  revalidatePath("/admin/dashboard/ponentes");
}
