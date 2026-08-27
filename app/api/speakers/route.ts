import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSpeakerEmails } from "@/lib/email";

const MODALIDADES = ["CHARLA", "TALLER", "PROYECTO"] as const;
const NIVELES = ["BASICO", "INTERMEDIO", "AVANZADO"] as const;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// Recibe la postulación del formulario público y la guarda en la base de datos.
// El equipo core la revisa luego desde /admin/dashboard/ponentes.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nombre = str(body.nombre);
    const correo = str(body.correo);
    const modalidad = str(body.modalidad);
    const tema = str(body.tema);
    const descripcion = str(body.descripcion);
    const nivel = str(body.nivel);
    const bio = str(body.bio);
    const linkedin = str(body.linkedin);
    const sigueComunidad = body.sigueComunidad;
    const eventSlug = str(body.eventSlug);

    // Campos obligatorios (los mismos que marca el formulario de Google)
    if (
      !nombre ||
      !correo ||
      !MODALIDADES.includes(modalidad as (typeof MODALIDADES)[number]) ||
      !tema ||
      !descripcion ||
      !NIVELES.includes(nivel as (typeof NIVELES)[number]) ||
      !bio ||
      !linkedin ||
      typeof sigueComunidad !== "boolean" ||
      !eventSlug
    ) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Debe seguir a la comunidad para que la propuesta sea considerada
    if (sigueComunidad !== true) {
      return NextResponse.json(
        { error: "Para postularte necesitás seguir a la comunidad Python Guatemala en alguna de sus redes." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const edadNum = Number.parseInt(str(body.edad), 10);

    const submission = await prisma.speakerSubmission.create({
      data: {
        nombre,
        correo,
        telefono: str(body.telefono) || null,
        modalidad: modalidad as (typeof MODALIDADES)[number],
        tema,
        descripcion,
        nivel: nivel as (typeof NIVELES)[number],
        bio,
        sigueComunidad,
        linkedin,
        instagram: str(body.instagram) || null,
        empresa: str(body.empresa) || null,
        cargo: str(body.cargo) || null,
        edad: Number.isFinite(edadNum) ? edadNum : null,
        fotoUrl: str(body.fotoUrl) || null,
        pais: str(body.pais) || null,
        comoSeEntero: str(body.comoSeEntero) || null,
        comentarios: str(body.comentarios) || null,
        compartirDatos: body.compartirDatos === true,
        eventId: event.id,
      },
    });

    // Correos: confirmación al ponente y aviso al equipo. No bloquea si falla.
    await sendSpeakerEmails({
      nombre: submission.nombre,
      correo: submission.correo,
      telefono: submission.telefono,
      modalidad: submission.modalidad,
      tema: submission.tema,
      descripcion: submission.descripcion,
      nivel: submission.nivel,
      bio: submission.bio,
      sigueComunidad: submission.sigueComunidad ?? undefined,
      linkedin: submission.linkedin,
      instagram: submission.instagram,
      empresa: submission.empresa,
      cargo: submission.cargo,
      edad: submission.edad,
      fotoUrl: submission.fotoUrl,
      pais: submission.pais,
      comoSeEntero: submission.comoSeEntero,
      comentarios: submission.comentarios,
      compartirDatos: submission.compartirDatos,
      eventoTitulo: event.title,
    });

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Lista las postulaciones (usado por el panel admin)
export async function GET() {
  const submissions = await prisma.speakerSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });
  return NextResponse.json(submissions);
}
