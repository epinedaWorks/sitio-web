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

  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  // Tras un envío exitoso, remonta el formulario (vacío, con la lista
  // recalculada) para que quede claro que ya se mandó y no quede el mismo
  // texto ahí tentando a mandarlo dos veces. En cualquier otro caso (o si
  // faltó algo) el formulario se queda como estaba, con lo que ya se escribió.
  const formKey = searchParams?.msg === "enviado" ? `enviado-${Date.now()}` : "form";

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Anuncios</h1>
      <p style={{ opacity: 0.75, fontSize: 14 }}>
        Manda un correo a los asistentes inscritos y/o a los conferencistas, talleristas y expositores de
        un evento — a estos últimos puedes filtrarlos por modalidad (charla, taller o proyecto) y por
        estado, ya que cada modalidad suele recibir información distinta. Puedes revisar la lista de
        correos y quitar o agregar alguno antes de enviar. El asunto y el mensaje se mandan exactamente
        como los escribas, sin nada agregado. Cada quien recibe su propio correo — nadie ve la lista de
        los demás.
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

      <AnuncioForm key={formKey} eventos={datos} action={enviarAnuncio} />
    </main>
  );
}
