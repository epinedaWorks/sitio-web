import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import AnuncioForm from "../AnuncioForm";

export default async function AnunciosPage() {
  await requireAdminRole();

  const eventos = await prisma.event.findMany({
    orderBy: { date: "desc" },
    select: { id: true, title: true, slug: true },
  });
  const [asistentes, ponentes] = await Promise.all([
    prisma.attendeeRegistration.findMany({ select: { eventId: true, correo: true, nombre: true } }),
    prisma.speakerSubmission.findMany({
      select: { eventId: true, correo: true, nombre: true, status: true, modalidad: true },
    }),
  ]);

  // Cada ponente lleva su estado y su modalidad: el formulario filtra por las
  // dos a la vez (por ejemplo "solo talleristas aceptados"), porque cada
  // modalidad recibe información distinta.
  const datos = eventos.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    asistentes: asistentes
      .filter((a) => a.eventId === e.id)
      .map(({ correo, nombre }) => ({ correo, nombre })),
    ponentes: ponentes
      .filter((p) => p.eventId === e.id)
      .map(({ correo, nombre, status, modalidad }) => ({ correo, nombre, status, modalidad })),
  }));

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Anuncios</h1>
      <p style={{ opacity: 0.75, fontSize: 14 }}>
        Manda un correo a los asistentes inscritos y/o a los conferencistas, talleristas y expositores de
        un evento — a estos últimos puedes filtrarlos por modalidad (charla, taller o proyecto) y por
        estado, ya que cada modalidad suele recibir información distinta. Puedes revisar la lista de
        correos y quitar o agregar alguno antes de enviar. El asunto y el mensaje se mandan exactamente
        como los escribas, sin nada agregado. Cada quien recibe su propio correo — nadie ve la lista de
        los demás. Para listas grandes, el envío se hace en tandas desde esta misma pantalla: no la
        cierres hasta que termine.
      </p>

      <AnuncioForm eventos={datos} />
    </main>
  );
}
