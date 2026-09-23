import { requireEditorSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { tokenDeQR } from "@/lib/urls";

// Registra la asistencia de una persona a partir del QR (o de un correo).
// Respuestas: { status: "ok" | "repetido" | "noexiste", nombre?, rol?, evento?, checkedInAt? }
export async function POST(req: Request) {
  const session = await requireEditorSession(); // marcar asistencia es escribir datos: VIEWER no puede
  const quien = (session.user as { email?: string } | undefined)?.email ?? null;

  const body = await req.json().catch(() => ({}));
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

  if (!reg) return Response.json({ status: "noexiste" });

  const base = {
    id: reg.id,
    nombre: reg.nombre,
    correo: reg.correo,
    rol: reg.rol,
    asistira: reg.asistira,
    evento: reg.event.title,
  };

  if (reg.checkedInAt) {
    return Response.json({
      ...base,
      status: "repetido",
      checkedInAt: reg.checkedInAt.toISOString(),
      checkedInBy: reg.checkedInBy,
    });
  }

  const actualizado = await prisma.attendeeRegistration.update({
    where: { id: reg.id },
    data: { checkedInAt: new Date(), checkedInBy: quien },
  });

  return Response.json({
    ...base,
    status: "ok",
    checkedInAt: actualizado.checkedInAt?.toISOString() ?? null,
  });
}
