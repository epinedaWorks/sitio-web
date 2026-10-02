import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";
import { requireAdminRole } from "@/lib/require-admin";

// Sube el archivo que se adjunta a un anuncio (imagen o PDF). Solo ADMIN,
// igual que mandar el anuncio. Se sube UNA vez y Resend lo descarga él mismo
// por URL al mandar cada correo — así no viaja repetido en cada tanda.
const TIPOS_OK: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

// Límite generoso pero prudente: adjuntar algo pesado a cientos de personas
// de golpe puede afectar la entregabilidad del correo (spam) además de
// tardar más en subir.
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  await requireAdminRole();

  const form = await req.formData();
  const file = form.get("archivo");

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Falta el archivo" }, { status: 400 });
  }
  const ext = TIPOS_OK[file.type];
  if (!ext) {
    return Response.json({ error: "Formato no permitido. Usa JPG, PNG, WebP, GIF o PDF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "El archivo supera 8 MB." }, { status: 413 });
  }

  try {
    const key = randomUUID() + "." + ext;
    const store = getStore({ name: "anuncio-adjuntos", consistency: "strong" });
    await store.set(key, await file.arrayBuffer(), {
      metadata: { type: file.type, name: file.name },
    });
    return Response.json({
      ok: true,
      url: `${new URL(req.url).origin}/api/admin/anuncios/adjunto/${key}`,
      filename: file.name,
    });
  } catch (e) {
    console.error("[anuncio-adjunto]", e);
    return Response.json({ error: "No se pudo guardar el archivo (almacenamiento no disponible)" }, { status: 500 });
  }
}
