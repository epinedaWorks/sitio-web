"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

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
  const url = String(formData.get("url") || "");
  const caption = String(formData.get("caption") || "");

  if (!albumId || !url) return;

  await prisma.galleryImage.create({ data: { albumId, url, caption } });

  revalidatePath("/admin/dashboard/galeria");
  revalidatePath("/eventos");
}

export async function eliminarFoto(imageId: string) {
  await requireAdminSession();
  await prisma.galleryImage.delete({ where: { id: imageId } });
  revalidatePath("/admin/dashboard/galeria");
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
