import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmails } from "@/lib/email";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// Inscripción pública de un asistente a un evento.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: campo oculto que solo rellenan los bots. Fingimos éxito.
    if (str(body.nombre_web)) return NextResponse.json({ ok: true });

    const nombre = str(body.nombre);
    const correo = str(body.correo);
    const asistira = str(body.asistira);
    const rol = str(body.rol);
    const eventSlug = str(body.eventSlug);

    if (!nombre || !correo || !asistira || !rol || !eventSlug) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const registration = await prisma.attendeeRegistration.create({
      data: {
        nombre,
        correo,
        telefono: str(body.telefono) || null,
        asistira,
        rol,
        universidad: str(body.universidad) || null,
        semestre: str(body.semestre) || null,
        experiencia: str(body.experiencia) || null,
        comoSeEntero: str(body.comoSeEntero) || null,
        comentarios: str(body.comentarios) || null,
        compartirDatos: body.compartirDatos === true,
        eventId: event.id,
      },
    });

    // Correos de confirmación (al participante y al equipo). No bloquea si falla.
    await sendRegistrationEmails({
      nombre: registration.nombre,
      correo: registration.correo,
      telefono: registration.telefono,
      asistira: registration.asistira,
      rol: registration.rol,
      universidad: registration.universidad,
      semestre: registration.semestre,
      experiencia: registration.experiencia,
      comoSeEntero: registration.comoSeEntero,
      comentarios: registration.comentarios,
      compartirDatos: registration.compartirDatos,
      eventoTitulo: event.title,
    });

    return NextResponse.json({ ok: true, id: registration.id });
  } catch (err: any) {
    // P2002 = violación de la restricción @@unique([eventId, correo])
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Este correo ya está inscrito a este evento" },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// No hay GET: el panel admin lee las inscripciones directo con Prisma.
// Un GET público aquí filtraría datos personales de todos los inscritos.
