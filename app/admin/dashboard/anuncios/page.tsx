import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { enviarAnuncio } from "../actions";
import AnuncioForm from "../AnuncioForm";

const MENSAJES: Record<string, { ok: boolean; texto: (n?: string, f?: string) => string }> = {
  enviado: {
    ok: true,
    texto: (n, f) =>
      `Anuncio enviado a ${n} persona${n === "1" ? "" : "s"}.${f ? ` ${f} fallaron — revisa los logs.` : ""}`,
  },
  prueba: { ok: true, texto: () => "Prueba enviada a tu correo." },
  faltan: {
    ok: false,
    texto: () => "Faltan campos: elige un evento, a quién enviarlo (o marca prueba), asunto y mensaje.",
  },
  vacio: { ok: false, texto: () => "Nadie cumple esos filtros para ese evento — no se envió nada." },
  error: { ok: false, texto: () => "Ocurrió un error. Intenta de nuevo." },
};

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams?: { msg?: string; n?: string; f?: string };
}) {
  await requireAdminRole();

  const eventos = await prisma.event.findMany({
    orderBy: { date: "desc" },
    select: { id: true, title: true, slug: true },
  });
  const [asistentesPorEvento, ponentesPorEvento] = await Promise.all([
    prisma.attendeeRegistration.groupBy({ by: ["eventId"], _count: true }),
    prisma.speakerSubmission.groupBy({ by: ["eventId", "status"], _count: true }),
  ]);

  const datos = eventos.map((e) => {
    const asistentes = asistentesPorEvento.find((a) => a.eventId === e.id)?._count ?? 0;
    const porEstado = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0 };
    ponentesPorEvento
      .filter((p) => p.eventId === e.id)
      .forEach((p) => {
        porEstado[p.status] = p._count;
      });
    return {
      id: e.id,
      title: e.title,
      slug: e.slug,
      asistentes,
      ponentesTotal: porEstado.PENDIENTE + porEstado.ACEPTADA + porEstado.RECHAZADA,
      ...porEstado,
    };
  });

  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Anuncios</h1>
      <p style={{ opacity: 0.75, fontSize: 14 }}>
        Manda un correo a los asistentes inscritos y/o a los conferencistas, talleristas y expositores de
        un evento. Cada quien recibe su propio correo — nadie ve la lista de los demás.
      </p>

      {aviso && (
        <p
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 14,
            background: aviso.ok ? "#d5f5e3" : "#fadbd8",
            color: aviso.ok ? "#1b5e20" : "#8e2a22",
          }}
        >
          {aviso.texto(searchParams?.n, searchParams?.f)}
        </p>
      )}

      <AnuncioForm eventos={datos} action={enviarAnuncio} />
    </main>
  );
}
