import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventoActivo } from "@/lib/settings";
import AdminShell from "./AdminShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const rol = (session?.user as { role?: string } | undefined)?.role;

  const [eventoActivo, pendientes, sinAtender] = await Promise.all([
    getEventoActivo(),
    prisma.speakerSubmission.count({ where: { status: "PENDIENTE" } }).catch(() => 0),
    prisma.contactMessage.count({ where: { atendido: false } }).catch(() => 0),
  ]);

  return (
    <AdminShell
      rol={rol}
      eventoActivoTitulo={eventoActivo?.title ?? null}
      pendientes={pendientes}
      sinAtender={sinAtender}
    >
      {children}
    </AdminShell>
  );
}
