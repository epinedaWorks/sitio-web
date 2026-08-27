import { getStore } from "@netlify/blobs";

export const dynamic = "force-dynamic";

// Sirve las fotos subidas al panel (guardadas en Netlify Blobs).
export async function GET(_req: Request, { params }: { params: { key: string } }) {
  try {
    const store = getStore({ name: "gallery", consistency: "strong" });
    const res = await store.getWithMetadata(params.key, { type: "arrayBuffer" });
    if (!res) return new Response("Foto no encontrada", { status: 404 });
    return new Response(res.data, {
      headers: {
        "Content-Type": (res.metadata?.type as string) || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Almacenamiento de imágenes no disponible", { status: 500 });
  }
}
