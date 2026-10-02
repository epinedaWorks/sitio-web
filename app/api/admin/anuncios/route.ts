import { NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { enviarAnuncioLote, enviarResumenAnuncio, type Adjunto } from "@/lib/email";
import { ES_CORREO_ANUNCIO, dedupePorCorreo, type PersonaAnuncio } from "@/lib/anuncios";

// Solo aceptamos como adjunto una URL que de verdad venga de nuestro propio
// endpoint de subida — nunca una URL arbitraria que mande el cliente.
function adjuntoValido(body: any): Adjunto | undefined {
  const a = body?.adjunto;
  if (!a || typeof a.url !== "string" || typeof a.filename !== "string") return undefined;
  if (!/^\/api\/admin\/anuncios\/adjunto\/[\w.-]+$/.test(new URL(a.url).pathname)) return undefined;
  return { url: a.url, filename: a.filename.slice(0, 150) };
}

// Envía los anuncios masivos en tandas chicas, controladas desde el propio
// formulario del panel — así un envío de cientos de personas no tiene que
// caber en una sola función serverless (Netlify las corta a los pocos
// segundos). El navegador llama este endpoint una vez por tanda, y al final
// una vez más para mandar el resumen al equipo.
//   POST { tipo: "lote",    eventId, asunto, mensaje, destinatarios }
//   POST { tipo: "resumen", eventId, asunto, mensaje, enviados, fallidos, destinatarios }
export async function POST(req: Request) {
  const session = await requireAdminRole();

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const asunto = String(body.asunto || "").trim();
  const mensaje = String(body.mensaje || "").trim();
  const eventId = String(body.eventId || "");
  if (!asunto || !mensaje || !eventId) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const evento = await prisma.event.findUnique({ where: { id: eventId } });
  if (!evento) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  const destinatarios: PersonaAnuncio[] = dedupePorCorreo(
    (Array.isArray(body.destinatarios) ? body.destinatarios : [])
      .filter(
        (d: unknown): d is { correo: string; nombre?: string } =>
          !!d &&
          typeof (d as any).correo === "string" &&
          ES_CORREO_ANUNCIO((d as any).correo.trim())
      )
      .map((d: { correo: string; nombre?: string }) => ({
        correo: d.correo.trim(),
        nombre: (d.nombre || "").trim() || d.correo.trim(),
      }))
  );

  if (body.tipo === "resumen") {
    const fallidos = Array.isArray(body.fallidos)
      ? body.fallidos
          .filter((f: unknown): f is { correo: string; motivo: string } => !!f && typeof (f as any).correo === "string")
          .map((f: { correo: string; motivo?: string }) => ({ correo: f.correo, motivo: f.motivo || "desconocido" }))
      : [];
    const enviados = Number(body.enviados) || 0;

    await enviarResumenAnuncio({
      destinatarios,
      fallidos,
      enviados,
      asunto,
      mensaje,
      eventoTitulo: evento.title,
      remitenteEmail: session.user?.email || "el panel",
      adjunto: adjuntoValido(body),
    });
    return NextResponse.json({ ok: true });
  }

  // tipo "lote" (o sin especificar): manda de verdad esta tanda.
  if (destinatarios.length === 0) {
    return NextResponse.json({ enviados: 0, fallidos: [] });
  }
  const resultado = await enviarAnuncioLote({ destinatarios, asunto, mensaje, adjunto: adjuntoValido(body) });
  return NextResponse.json(resultado);
}
