import { getStore } from "@netlify/blobs";

export const dynamic = "force-dynamic";

// Sirve el adjunto de un anuncio (imagen o PDF) para que Resend lo descargue
// al mandar cada correo. Es pública a propósito (sin sesión): el servidor de
// Resend, no el navegador de un admin, es quien la pide. El nombre del
// archivo es un UUID al azar, así que no se puede adivinar ni listar.
const TIPOS_OK = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export async function GET(_req: Request, { params }: { params: { key: string } }) {
  try {
    const store = getStore({ name: "anuncio-adjuntos", consistency: "strong" });
    const res = await store.getWithMetadata(params.key, { type: "arrayBuffer" });
    if (!res) return new Response("Adjunto no encontrado", { status: 404 });

    const tipo = String(res.metadata?.type || "");
    if (!TIPOS_OK.has(tipo)) return new Response("Adjunto no encontrado", { status: 404 });
    const nombre = String(res.metadata?.name || params.key);

    return new Response(res.data, {
      headers: {
        "Content-Type": tipo,
        "Content-Disposition": `attachment; filename="${nombre.replace(/"/g, "")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Almacenamiento no disponible", { status: 500 });
  }
}
