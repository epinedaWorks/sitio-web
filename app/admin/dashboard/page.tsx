import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getEventoActivo } from "@/lib/settings";
import { TIPOS_ESCANEO, ETIQUETA_TIPO, CAMPOS_ESCANEO } from "@/lib/scan";
import { soloFecha, soloHora } from "@/lib/fecha";

export const dynamic = "force-dynamic";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams?: { msg?: string };
}) {
  const session = await requireAdminSession();
  const role = (session.user as { role?: string } | undefined)?.role;
  const esAdmin = role === "ADMIN";

  const eventoActivo = await getEventoActivo();

  // Todo lo de esta página es del evento activo — si no hay ninguno marcado,
  // no hay nada que mostrar más que la invitación a elegir uno.
  if (!eventoActivo) {
    return (
      <main className="pg-content-narrow">
        <div className="pg-head">
          <h1>Evento en curso</h1>
        </div>
        <div className="pg-card">
          <p style={{ margin: "0 0 14px" }}>
            Todavía no hay ningún evento marcado como <strong>activo</strong>. Mientras no elijas uno, la
            portada, los formularios públicos y este dashboard no tienen de qué evento mostrar datos.
          </p>
          {esAdmin ? (
            <Link href="/admin/dashboard/eventos" className="pg-btn pg-btn-primary">
              Elegir evento activo →
            </Link>
          ) : (
            <p style={{ fontSize: 13, opacity: 0.7 }}>Pide a una cuenta ADMIN que marque un evento activo.</p>
          )}
        </div>
      </main>
    );
  }

  const whereEvento = { eventId: eventoActivo.id };

  const [
    totalInscritos,
    conteosCheckin,
    porEstadoPonente,
    totalVoluntarios,
    ultimosInscritos,
    albumes,
    sinAtender,
  ] = await Promise.all([
    prisma.attendeeRegistration.count({ where: whereEvento }),
    Promise.all(
      TIPOS_ESCANEO.map((t) =>
        prisma.attendeeRegistration.count({ where: { ...whereEvento, [CAMPOS_ESCANEO[t].at]: { not: null } } as any })
      )
    ),
    Promise.all(
      (["PENDIENTE", "ACEPTADA", "RECHAZADA"] as const).map((s) =>
        prisma.speakerSubmission.count({ where: { ...whereEvento, status: s } })
      )
    ),
    prisma.volunteerApplication.count({ where: whereEvento }),
    prisma.attendeeRegistration.findMany({
      where: whereEvento,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { nombre: true, correo: true, rol: true, createdAt: true, checkedInAt: true },
    }),
    prisma.album.count({ where: whereEvento }),
    prisma.contactMessage.count({ where: { atendido: false } }),
  ]);

  const conteo: Record<string, number> = Object.fromEntries(TIPOS_ESCANEO.map((t, i) => [t, conteosCheckin[i]]));
  const [pendientes, aceptadas, rechazadas] = porEstadoPonente;
  const esProximo = eventoActivo.date.getTime() >= Date.now();

  return (
    <main>
      <div className="pg-head">
        <div className="pg-head-row">
          <div>
            <h1>Evento en curso</h1>
            <p>
              <strong>{eventoActivo.title}</strong> · {soloFecha(eventoActivo.date, "full")} ·{" "}
              {eventoActivo.location}
              {esProximo ? (
                <span className="pg-badge pg-badge-info" style={{ marginLeft: 8 }}>
                  Próximo
                </span>
              ) : (
                <span className="pg-badge pg-badge-neutral" style={{ marginLeft: 8 }}>
                  Ya pasó
                </span>
              )}
            </p>
          </div>
          {esAdmin && (
            <Link href="/admin/dashboard/eventos" className="pg-btn pg-btn-ghost pg-btn-sm">
              Cambiar evento activo
            </Link>
          )}
        </div>
      </div>

      {searchParams?.msg === "solo_lectura" && (
        <p className="pg-notice pg-notice-warn">
          Tu cuenta es de solo lectura: puedes ver todo, pero no crear, cambiar ni borrar nada.
        </p>
      )}

      {/* Inscripción */}
      <h2 style={{ fontSize: 15, opacity: 0.7, margin: "0 0 10px" }}>Inscripción</h2>
      <div className="pg-stats" style={{ marginBottom: 26 }}>
        <Link href="/admin/dashboard/inscritos" className="pg-stat">
          <span className="ic">🎟️</span>
          <span className="n">{totalInscritos}</span>
          <span className="l">Inscritos</span>
        </Link>
        <Link href="/admin/dashboard/ponentes" className="pg-stat">
          <span className="ic">🎤</span>
          <span className="n">{pendientes}</span>
          <span className="l">Ponentes pendientes</span>
        </Link>
        <Link href="/admin/dashboard/voluntarios" className="pg-stat">
          <span className="ic">🙋</span>
          <span className="n">{totalVoluntarios}</span>
          <span className="l">Voluntarios</span>
        </Link>
        <Link href="/admin/dashboard/galeria" className="pg-stat">
          <span className="ic">🖼️</span>
          <span className="n">{albumes}</span>
          <span className="l">Álbumes del evento</span>
        </Link>
      </div>

      {/* Check-in del día */}
      <h2 style={{ fontSize: 15, opacity: 0.7, margin: "0 0 10px" }}>Asistencia (check-in)</h2>
      <div className="pg-stats" style={{ marginBottom: 26 }}>
        {TIPOS_ESCANEO.map((t) => (
          <Link key={t} href="/admin/dashboard/checkin" className="pg-stat">
            <span className="n">
              {conteo[t]}
              <span style={{ fontSize: 14, opacity: 0.5, fontWeight: 600 }}> / {totalInscritos}</span>
            </span>
            <span className="l">{ETIQUETA_TIPO[t]}</span>
          </Link>
        ))}
      </div>

      <div className="pg-dash-grid">
        {/* Últimos inscritos */}
        <div>
          <h2 style={{ fontSize: 15, opacity: 0.7, margin: "0 0 10px" }}>Últimos inscritos</h2>
          <div className="pg-table-wrap">
            {ultimosInscritos.length === 0 ? (
              <p style={{ padding: 16, opacity: 0.7, margin: 0 }}>Aún no hay inscritos.</p>
            ) : (
              <table className="pg-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Cuándo</th>
                    <th>Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosInscritos.map((r) => (
                    <tr key={r.correo} className={r.checkedInAt ? "is-done" : undefined}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                        <div style={{ opacity: 0.6, fontSize: 12 }}>{r.correo}</div>
                      </td>
                      <td>{r.rol || "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{soloHora(r.createdAt)}</td>
                      <td>
                        {r.checkedInAt ? (
                          <span className="pg-badge pg-badge-success">✓ ingresó</span>
                        ) : (
                          <span className="pg-badge pg-badge-neutral">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p style={{ marginTop: 8 }}>
            <Link href="/admin/dashboard/inscritos" style={{ fontSize: 13 }}>
              Ver todos los inscritos →
            </Link>
          </p>
        </div>

        {/* Accesos rápidos + ponentes */}
        <div>
          <h2 style={{ fontSize: 15, opacity: 0.7, margin: "0 0 10px" }}>Ponentes por estado</h2>
          <div className="pg-card" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className="pg-badge pg-badge-warn">{pendientes} pendientes</span>
            <span className="pg-badge pg-badge-success">{aceptadas} aceptadas</span>
            <span className="pg-badge pg-badge-danger">{rechazadas} rechazadas</span>
          </div>

          <h2 style={{ fontSize: 15, opacity: 0.7, margin: "0 0 10px" }}>Accesos rápidos</h2>
          <div className="pg-card" style={{ display: "grid", gap: 8 }}>
            <Link href="/admin/dashboard/checkin" className="pg-btn pg-btn-primary">
              📷 Tomar asistencia
            </Link>
            {esAdmin && (
              <Link href="/admin/dashboard/anuncios" className="pg-btn pg-btn-ghost">
                📣 Enviar un anuncio
              </Link>
            )}
            <Link href="/admin/dashboard/contacto" className="pg-btn pg-btn-ghost">
              ✉️ Contacto sin atender
              {sinAtender > 0 && <span className="pg-badge pg-badge-danger" style={{ marginLeft: "auto" }}>{sinAtender}</span>}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
