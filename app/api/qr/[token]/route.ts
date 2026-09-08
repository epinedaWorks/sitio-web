import QRCode from "qrcode";
import { entradaUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

// PNG del código QR de una entrada. El QR apunta a /entrada/<token>.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  try {
    const png = await QRCode.toBuffer(entradaUrl(params.token), {
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
