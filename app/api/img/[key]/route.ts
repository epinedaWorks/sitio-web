import { getStore } from "@netlify/blobs";

export const dynamic = "force-dynamic";

// Solo servimos tipos de imagen "seguros" (nada de SVG, que puede llevar script).
const TIPOS_OK = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

// Sirve las fotos subidas al panel (guardadas en Netlify Blobs).
export async function GET(_req: Request, { params }: { params: { key: string } }) {
  try {
    const store = getStore({ name: "gallery", consistency: "strong" });
    const res = await store.getWithMetadata(params.key, { type: "arrayBuffer" });
    if (!res) return new Response("Foto no encontrada", { status: 404 });

    const tipo = String(res.metadata?.type || "");
    const contentType = TIPOS_OK.has(tipo) ? tipo : "application/octet-stream";
    const inline = TIPOS_OK.has(tipo);

    return new Response(res.data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": inline ? "inline" : "attachment",
        "X-Content-Type-Options": "nosniff",
        // Aunque algo raro se colara, que no pueda ejecutar nada.
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Almacenamiento de imágenes no disponible", { status: 500 });
  }
}
