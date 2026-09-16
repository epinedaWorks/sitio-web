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
  faltan: {
    ok: false,
    texto: () => "Faltan campos: elige un evento, al menos un destinatario, asunto y mensaje.",
  },
  vacio: { ok: false, texto: () => "No quedó ningún destinatario válido — no se envió nada." },
  error: { ok: false, texto: () => "Ocurrió un error. Intenta de nuevo." },
};

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams?: { msg?: string; n?: string; f?: string };
}) {
  const session = await requireAdminRole();

  const eventos = await prisma.event.findMany({
    orderBy: { date: "desc" },
    select: { id: true, title: true, slug: true },
  });
  const [asistentes, ponentes] = await Promise.all([
    prisma.attendeeRegistration.findMany({ select: { eventId: true, correo: true, nombre: true } }),
    prisma.speakerSubmission.findMany({ select: { eventId: true, correo: true, nombre: true, status: true } }),
  ]);

  const datos = eventos.map((e) => {
    const asis = asistentes.filter((a) => a.eventId === e.id).map(({ correo, nombre }) => ({ correo, nombre }));
    const ponE = ponentes.filter((p) => p.eventId === e.id);
    const porEstado = (st?: "PENDIENTE" | "ACEPTADA" | "RECHAZADA") =>
      ponE.filter((p) => !st || p.status === st).map(({ correo, nombre }) => ({ correo, nombre }));
    return {
      id: e.id,
      title: e.title,
      slug: e.slug,
      asistentes: asis,
      ponentes: {
        TODOS: porEstado(),
        PENDIENTE: porEstado("PENDIENTE"),
        ACEPTADA: porEstado("ACEPTADA"),
        RECHAZADA: porEstado("RECHAZADA"),
      },
    };
  });

  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Anuncios</h1>
      <p style={{ opacity: 0.75, fontSize: 14 }}>
        Manda un correo a los asistentes inscritos y/o a los conferencistas, talleristas y expositores de
        un evento. Puedes revisar la lista de correos y quitar o agregar alguno antes de enviar. El asunto
        y el mensaje se mandan exactamente como los escribas, sin nada agregado. Cada quien recibe su propio
        correo — nadie ve la lista de los demás.
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

      <AnuncioForm
        eventos={datos}
        action={enviarAnuncio}
        correoAdmin={session.user?.email || ""}
        nombreAdmin={session.user?.name || ""}
      />
    </main>
  );
}
