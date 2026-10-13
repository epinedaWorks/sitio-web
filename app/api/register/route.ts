import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmails } from "@/lib/email";
import { getEventoActivoSlug } from "@/lib/settings";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const ES_CORREO = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

// Inscripción pública de un asistente a un evento.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: campo oculto que solo rellenan los bots. Fingimos éxito.
    if (str(body.campo_control)) return NextResponse.json({ ok: true });

    const nombre = str(body.nombre);
    const correo = str(body.correo);
    const rol = str(body.rol);

    if (!nombre || !correo || !rol) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (!ES_CORREO(correo)) {
      return NextResponse.json({ error: "El correo no es válido" }, { status: 400 });
    }
    if (nombre.length > 200) {
      return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
    }

    // El sitio ya no manda un slug fijo: usa el que esté marcado como evento
    // activo en /admin/dashboard/eventos (permite reutilizar el mismo
    // formulario para cada edición nueva sin tocar código).
    const eventSlug = str(body.eventSlug) || (await getEventoActivoSlug());
    if (!eventSlug) {
      return NextResponse.json({ error: "No hay un evento activo en este momento" }, { status: 404 });
    }
    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // El panel puede cerrar la inscripción de este evento (cupo lleno). El
    // modal ya lo avisa sin mostrar el formulario, pero se valida aquí
    // también por si alguien llama a la API directo.
    if (!event.inscripcionAbierta) {
      return NextResponse.json({ error: event.inscripcionMensaje }, { status: 403 });
    }

    // La universidad se pide sin importar el rol; si no aplica, se guarda así
    // para que el campo nunca quede vacío en el Excel exportado.
    const universidad = str(body.universidad) || "No aplica";

    const registration = await prisma.attendeeRegistration.create({
      data: {
        nombre,
        correo,
        telefono: str(body.telefono) || null,
        rol,
        edad: str(body.edad) || null,
        universidad,
        semestre: str(body.semestre) || null,
        experiencia: str(body.experiencia) || null,
        aniosExperiencia: str(body.aniosExperiencia) || null,
        comoSeEntero: str(body.comoSeEntero) || null,
        comentarios: str(body.comentarios) || null,
        compartirDatos: body.compartirDatos === true,
        checkinToken: randomBytes(9).toString("base64url"),
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
      edad: registration.edad,
      universidad: registration.universidad,
      semestre: registration.semestre,
      experiencia: registration.experiencia,
      aniosExperiencia: registration.aniosExperiencia,
      comoSeEntero: registration.comoSeEntero,
      comentarios: registration.comentarios,
      compartirDatos: registration.compartirDatos,
      eventoTitulo: event.title,
      checkinToken: registration.checkinToken,
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
