import { requireScanSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { tokenDeQR } from "@/lib/urls";
import { TIPOS_ESCANEO, CAMPOS_ESCANEO, tiposPermitidos, type TipoEscaneo } from "@/lib/scan";

// Registra la asistencia de una persona a partir del QR (o de un correo), en
// uno de los puestos del día: entrada, exposición de proyectos, coffee break,
// almuerzo o jornada de la tarde — todos con el mismo QR de la persona.
// Respuestas: { status: "ok" | "repetido" | "noexiste" | "sin_permiso" | "falta_requisito", ... }
export async function POST(req: Request) {
  const session = await requireScanSession(); // marcar asistencia es escribir datos: solo ADMIN, EDITOR y ESCANEO
  const quien = (session.user as { email?: string } | undefined)?.email ?? null;

  const body = await req.json().catch(() => ({}));
  const tipoRaw = String(body.tipo || "entrada");
  const tipo: TipoEscaneo = (TIPOS_ESCANEO as readonly string[]).includes(tipoRaw)
    ? (tipoRaw as TipoEscaneo)
    : "entrada";

  if (!tiposPermitidos(session).includes(tipo)) {
    return Response.json({ status: "sin_permiso", tipo });
  }

  const codigo = tokenDeQR(String(body.codigo || body.token || ""));
  const correo = String(body.correo || "").trim().toLowerCase();

  const reg = codigo
    ? await prisma.attendeeRegistration.findUnique({
        where: { checkinToken: codigo },
        include: { event: true },
      })
    : correo
      ? await prisma.attendeeRegistration.findFirst({
          where: { correo: { equals: correo, mode: "insensitive" } },
          include: { event: true },
          orderBy: { createdAt: "desc" },
        })
      : null;

  if (!reg) return Response.json({ status: "noexiste", tipo });

  const base = {
    id: reg.id,
    nombre: reg.nombre,
    correo: reg.correo,
    rol: reg.rol,
    asistira: reg.asistira,
    evento: reg.event.title,
    tipo,
  };

  // Cada puesto lleva su propia marca de tiempo y quién la registró.
  const campo = CAMPOS_ESCANEO[tipo];
  const regAny = reg as unknown as Record<string, Date | string | null>;
  const yaTenia = regAny[campo.at] as Date | null;
  const porQuien = regAny[campo.by] as string | null;

  if (yaTenia) {
    return Response.json({
      ...base,
      status: "repetido",
      checkedInAt: yaTenia.toISOString(),
      checkedInBy: porQuien,
    });
  }

  // Para dar almuerzo, ya debe tener registrada la entrada y haber pasado a
  // ver la exposición de proyectos.
  if (tipo === "almuerzo") {
    const falta: string[] = [];
    if (!reg.checkedInAt) falta.push("no ha registrado su entrada");
    if (!reg.proyectosAt) falta.push("no ha pasado a ver la exposición de proyectos");
    if (falta.length) {
      return Response.json({ ...base, status: "falta_requisito", motivo: falta.join(" y ") });
    }
  }

  const data = { [campo.at]: new Date(), [campo.by]: quien } as Record<string, unknown>;
  const actualizado = await prisma.attendeeRegistration.update({
    where: { id: reg.id },
    data,
  });

  const nuevaMarca = (actualizado as unknown as Record<string, Date | null>)[campo.at];

  return Response.json({
    ...base,
    status: "ok",
    checkedInAt: nuevaMarca?.toISOString() ?? null,
  });
}
