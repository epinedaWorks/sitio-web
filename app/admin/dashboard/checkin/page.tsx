import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { TIPOS_ESCANEO, ETIQUETA_TIPO, CAMPOS_ESCANEO, tiposPermitidos } from "@/lib/scan";
import { getEventoActivoSlug } from "@/lib/settings";
import Scanner from "./Scanner";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const session = await requireAdminSession({ permiteSoloEscaneo: true });
  const rol = (session.user as { role?: string } | undefined)?.role;
  const soloLectura = rol === "VIEWER";
  const soloEscaneo = rol === "ESCANEO";
  const permitidos = tiposPermitidos(session);

  const eventoActivoSlug = await getEventoActivoSlug();
  const eventoActivo = eventoActivoSlug
    ? await prisma.event.findUnique({ where: { slug: eventoActivoSlug }, select: { id: true, title: true } })
    : null;
  // Los contadores (y el escaneo por correo, ver /api/admin/checkin) se
  // limitan al evento activo para no mezclar asistencia de ediciones
  // distintas si llegara a haber inscritos de más de un evento a la vez.
  const whereEvento = eventoActivo ? { eventId: eventoActivo.id } : {};

  const [total, ...conteos] = await Promise.all([
    prisma.attendeeRegistration.count({ where: whereEvento }),
    ...TIPOS_ESCANEO.map((t) =>
      prisma.attendeeRegistration.count({
        where: { ...whereEvento, [CAMPOS_ESCANEO[t].at]: { not: null } } as any,
      })
    ),
  ]);
  const conteo: Record<string, number> = Object.fromEntries(TIPOS_ESCANEO.map((t, i) => [t, conteos[i]]));

  return (
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Tomar asistencia</h1>
        <p>
          Apunta la cámara al QR de la persona. También puedes buscar por correo si no lo tiene. El mismo
          QR sirve para los cinco puestos: entrada, exposición de proyectos, coffee break, almuerzo
          (requiere ya tener entrada y proyectos) y jornada de la tarde (para quienes se quedan después de
          almuerzo).
        </p>
      </div>

      {eventoActivo ? (
        <p className="pg-notice pg-notice-info">
          Contando solo <strong>{eventoActivo.title}</strong> (el evento activo).
        </p>
      ) : (
        <p className="pg-notice pg-notice-warn">
          No hay ningún evento marcado como activo — los contadores de abajo cuentan TODOS los eventos
          juntos. Márcalo en{" "}
          <Link href="/admin/dashboard/eventos" style={{ color: "inherit" }}>
            Eventos
          </Link>
          .
        </p>
      )}

      <div className="pg-stats">
        {TIPOS_ESCANEO.map((t) => (
          <div key={t} className="pg-stat">
            <span className="n">
              {conteo[t]}
              <span style={{ fontSize: 14, opacity: 0.5, fontWeight: 600 }}> / {total}</span>
            </span>
            <span className="l">{ETIQUETA_TIPO[t]}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 8 }}>
        <Link href="/admin/dashboard/checkin" style={{ fontSize: 13 }}>
          actualizar
        </Link>
      </p>

      <div style={{ marginTop: 18 }}>
        {soloLectura ? (
          <p className="pg-notice pg-notice-info">
            Estás en modo solo lectura: no puedes registrar asistencia. Pide a un Admin o Editor que
            escanee, o consulta la lista de inscritos.
          </p>
        ) : permitidos.length === 0 ? (
          <p className="pg-notice pg-notice-warn">
            Tu cuenta no tiene ningún puesto de escaneo habilitado. Pide a un Admin que te lo asigne en
            Usuarios.
          </p>
        ) : (
          <Scanner tipos={permitidos} />
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 13 }}>
        {soloEscaneo ? (
          <Link href="/admin/dashboard/cuenta">Cambiar mi contraseña →</Link>
        ) : (
          <Link href="/admin/dashboard/inscritos">Ver la lista completa de inscritos →</Link>
        )}
      </p>
    </main>
  );
}
