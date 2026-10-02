import QRCode from "qrcode";
import { REDES_SIGUENOS } from "@/app/site-data";

export const dynamic = "force-dynamic";

// QR de una red social de la comunidad (lista fija en site-data.ts — no es un
// generador abierto de QR para cualquier URL, solo para estas).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const red = REDES_SIGUENOS.find((r) => r.id === params.id);
  if (!red) return new Response("No encontrado", { status: 404 });

  try {
    const png = await QRCode.toBuffer(red.url, {
      width: 640,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0a1310", light: "#ffffff" },
    });
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return new Response("No se pudo generar el QR", { status: 500 });
  }
}
