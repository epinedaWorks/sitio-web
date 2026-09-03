import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export default async function DashboardHome() {
  const session = await requireAdminSession();
  const role = (session.user as { role?: string } | undefined)?.role;
  const esAdmin = role === "ADMIN";

  const [eventos, ponentes, inscritos, albumes, contacto] = await Promise.all([
    prisma.event.count(),
    prisma.speakerSubmission.count({ where: { status: "PENDIENTE" } }),
    prisma.attendeeRegistration.count(),
    prisma.album.count(),
    prisma.contactMessage.count({ where: { atendido: false } }),
  ]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Panel de Python Guatemala</h1>
      <p style={{ opacity: 0.8 }}>
        Sesión: {session.user?.email} · <b>{role}</b>
      </p>

      <h2 style={{ fontSize: "1.1rem", margin: "28px 0 12px", opacity: 0.7 }}>Gestión</h2>
      <div style={grid}>
        <Card href="/admin/dashboard/eventos" icon="📅" title="Eventos" value={eventos} desc="Crear y publicar eventos" />
        <Card href="/admin/dashboard/galeria" icon="🖼️" title="Álbumes de fotos" value={albumes} desc="Subir y ordenar fotos por actividad" />
        <Card href="/admin/dashboard/ponentes" icon="🎤" title="Postulaciones pendientes" value={ponentes} desc="Revisar y aprobar ponentes" />
        <Card href="/admin/dashboard/inscritos" icon="🎟️" title="Inscritos" value={inscritos} desc="Ver y exportar participantes" />
        <Card href="/admin/dashboard/contacto" icon="✉️" title="Contacto sin atender" value={contacto} desc="Patrocinio, prensa, más información" />
      </div>

      <h2 style={{ fontSize: "1.1rem", margin: "32px 0 12px", opacity: 0.7 }}>Configuración</h2>
      <div style={grid}>
        {esAdmin && (
          <Card
            href="/admin/dashboard/usuarios"
            icon="👥"
            title="Usuarios"
            desc="Quién puede entrar al panel · crear y quitar accesos"
          />
        )}
        {esAdmin && (
          <Card
            href="/admin/dashboard/ajustes"
            icon="📨"
            title="Ajustes de correo"
            desc="A qué correos llegan los avisos"
          />
        )}
        <Card
          href="/admin/dashboard/cuenta"
          icon="🔑"
          title="Mi cuenta"
          desc="Cambiar mi contraseña"
        />
      </div>
    </main>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 14,
};

function Card({
  href,
  icon,
  title,
  value,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  value?: number;
  desc: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        border: "1px solid #e2e2e2",
        borderRadius: 12,
        padding: "16px 18px",
        textDecoration: "none",
        color: "inherit",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {typeof value === "number" && (
          <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{value}</span>
        )}
      </div>
      <div style={{ fontWeight: 600, marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.65, marginTop: 2 }}>{desc}</div>
    </Link>
  );
}
