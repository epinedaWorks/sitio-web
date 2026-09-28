import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVolunteerEmails } from "@/lib/email";

const DISPONIBILIDAD = ["Mañana", "Todo el día", "Tarde"] as const;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const ES_CORREO = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

// Postulación pública para ser voluntario(a) en un evento.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: campo oculto que solo rellenan los bots. Fingimos éxito.
    if (str(body.nombre_web)) return NextResponse.json({ ok: true });

    const nombre = str(body.nombre);
    const correo = str(body.correo);
    const disponibilidad = str(body.disponibilidad);
    const eventSlug = str(body.eventSlug);
    const areas = Array.isArray(body.areas) ? body.areas.filter((a: unknown) => typeof a === "string" && a.trim()) : [];

    if (
      !nombre ||
      !correo ||
      !DISPONIBILIDAD.includes(disponibilidad as (typeof DISPONIBILIDAD)[number]) ||
      !areas.length ||
      !eventSlug
    ) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (!ES_CORREO(correo)) {
      return NextResponse.json({ error: "El correo no es válido" }, { status: 400 });
    }
    if (nombre.length > 200) {
      return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Universidad se pide sin importar el rol; si no aplica, se guarda así
    // para que el campo nunca quede vacío en el Excel exportado.
    const universidad = str(body.universidad) || "No aplica";
    const esUVG = universidad === "Universidad del Valle de Guatemala (UVG)";

    const volunteer = await prisma.volunteerApplication.create({
      data: {
        nombre,
        correo,
        telefono: str(body.telefono) || null,
        disponibilidad,
        universidad,
        carnet: esUVG ? str(body.carnet) || null : null,
        semestre: esUVG ? str(body.semestre) || null : null,
        edad: str(body.edad) || null,
        areas,
        comentarios: str(body.comentarios) || null,
        eventId: event.id,
      },
    });

    // Correos de confirmación (a la persona y al equipo). No bloquea si falla.
    await sendVolunteerEmails({
      nombre: volunteer.nombre,
      correo: volunteer.correo,
      telefono: volunteer.telefono,
      disponibilidad: volunteer.disponibilidad,
      universidad: volunteer.universidad,
      carnet: volunteer.carnet,
      semestre: volunteer.semestre,
      edad: volunteer.edad,
      areas: volunteer.areas,
      comentarios: volunteer.comentarios,
      eventoTitulo: event.title,
    });

    return NextResponse.json({ ok: true, id: volunteer.id });
  } catch (err: any) {
    // P2002 = violación de la restricción @@unique([eventId, correo])
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Este correo ya está postulado como voluntario en este evento" },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// No hay GET: el panel admin lee las postulaciones directo con Prisma.
// Un GET público aquí filtraría datos personales de todos los postulantes.
