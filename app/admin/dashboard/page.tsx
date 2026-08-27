import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export default async function DashboardHome() {
  const session = await requireAdminSession();

  const [eventos, ponentes, inscritos, albumes] = await Promise.all([
    prisma.event.count(),
    prisma.speakerSubmission.count({ where: { status: "PENDIENTE" } }),
    prisma.attendeeRegistration.count(),
    prisma.album.count(),
  ]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Panel de Python Guatemala</h1>
      <p>Sesión iniciada como {session.user?.email}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 24 }}>
        <Card href="/admin/dashboard/eventos" title="Eventos" value={eventos} desc="Crear y publicar eventos" />
        <Card href="/admin/dashboard/galeria" title="Álbumes de fotos" value={albumes} desc="Gestionar galerías por actividad" />
        <Card href="/admin/dashboard/ponentes" title="Postulaciones pendientes" value={ponentes} desc="Revisar y aprobar ponentes" />
        <Card href="/admin/dashboard/inscritos" title="Inscritos" value={inscritos} desc="Ver participantes registrados" />
      </div>
    </main>
  );
}

function Card({ href, title, value, desc }: { href: string; title: string; value: number; desc: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 20,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{desc}</div>
    </Link>
  );
}
