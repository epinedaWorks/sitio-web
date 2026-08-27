import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

// Sube UNA foto a un álbum. El cliente (SubirFotos.tsx) llama a este endpoint
// una vez por archivo, así cada petición es pequeña y no choca con límites.
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export async function POST(req: Request) {
  await requireAdminSession();

  const form = await req.formData();
  const albumId = String(form.get("albumId") || "");
  const file = form.get("foto");

  if (!albumId || !(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Falta el álbum o el archivo" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "El archivo no es una imagen" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "La imagen supera 10 MB" }, { status: 413 });
  }

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: { _count: { select: { images: true } } },
  });
  if (!album) return Response.json({ error: "El álbum no existe" }, { status: 404 });

  try {
    const key = randomUUID() + (EXT[file.type] || "");
    const store = getStore({ name: "gallery", consistency: "strong" });
    await store.set(key, await file.arrayBuffer(), {
      metadata: { type: file.type, name: file.name },
    });
    const img = await prisma.galleryImage.create({
      data: { albumId, url: `/api/img/${key}`, order: album._count.images },
    });
    return Response.json({ ok: true, id: img.id, url: img.url });
  } catch (e) {
    console.error("[upload]", e);
    return Response.json(
      { error: "No se pudo guardar la imagen (almacenamiento no disponible)" },
      { status: 500 }
    );
  }
}
