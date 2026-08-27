import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
const ES_CORREO = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

const ASUNTOS = ["Patrocinio", "Más información", "Colaboración", "Prensa", "Otro"];

// Formulario de contacto público (patrocinio, prensa, más información…).
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot
    if (str(body.nombre_web)) return NextResponse.json({ ok: true });

    const nombre = str(body.nombre);
    const correo = str(body.correo);
    const organizacion = str(body.organizacion);
    const asunto = str(body.asunto);
    const mensaje = str(body.mensaje);

    if (!nombre || !ES_CORREO(correo) || !ASUNTOS.includes(asunto) || !mensaje) {
      return NextResponse.json({ error: "Revisa los campos del formulario" }, { status: 400 });
    }
    if (nombre.length > 200 || organizacion.length > 200 || mensaje.length > 5000) {
      return NextResponse.json({ error: "Algún campo es demasiado largo" }, { status: 400 });
    }

    const msg = await prisma.contactMessage.create({
      data: { nombre, correo, organizacion: organizacion || null, asunto, mensaje },
    });

    await sendContactEmail({ nombre, correo, organizacion: organizacion || null, asunto, mensaje });

    return NextResponse.json({ ok: true, id: msg.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
