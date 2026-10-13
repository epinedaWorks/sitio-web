import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { eliminarVoluntario } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import SelectorEvento from "../SelectorEvento";
import FilaExpandible from "../FilaExpandible";
import Buscador from "../Buscador";
import { fechaHora, soloFecha } from "@/lib/fecha";
import { getEventoActivoSlug } from "@/lib/settings";

const COLSPAN = 7;

export default async function VoluntariosAdminPage({
  searchParams,
}: {
  searchParams?: { evento?: string };
}) {
  const session = await requireAdminSession();
  const soloLectura = (session.user as { role?: string } | undefined)?.role === "VIEWER";

  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" }, select: { id: true, slug: true, title: true } });
  const eventoActivoSlug = await getEventoActivoSlug();
  const eventoActivoId = eventos.find((e) => e.slug === eventoActivoSlug)?.id;
  const eventoSel = searchParams?.evento ?? eventoActivoId ?? "todos";

  const voluntarios = await prisma.volunteerApplication.findMany({
    where: eventoSel !== "todos" ? { eventId: eventoSel } : undefined,
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  return (
    <main>
      <div className="pg-head">
        <h1>Voluntarios</h1>
        <p>Postulaciones para apoyar el día del evento.</p>
      </div>

      <div className="pg-head-row" style={{ marginBottom: 16 }}>
        <SelectorEvento eventos={eventos} valor={eventoSel} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            className="pg-btn pg-btn-primary pg-btn-sm"
            href={`/api/admin/export?tipo=voluntarios${eventoSel !== "todos" ? `&eventoId=${eventoSel}` : ""}`}
          >
            ⬇ Excel
          </a>
          <a
            className="pg-btn pg-btn-ghost pg-btn-sm"
            href={`/api/admin/export?tipo=voluntarios&formato=csv${eventoSel !== "todos" ? `&eventoId=${eventoSel}` : ""}`}
          >
            CSV
          </a>
        </div>
      </div>

      <div className="pg-stats" style={{ marginBottom: 18 }}>
        <div className="pg-stat">
          <span className="n">{voluntarios.length}</span>
          <span className="l">Total</span>
        </div>
      </div>

      {soloLectura && (
        <p className="pg-notice pg-notice-info">
          Estás en modo solo lectura: puedes ver y exportar, pero no borrar nada.
        </p>
      )}

      {voluntarios.length === 0 ? (
        <p className="pg-card" style={{ opacity: 0.7 }}>
          Aún no hay postulaciones.
        </p>
      ) : (
        <>
          <Buscador selector="[data-buscar]" placeholder="Buscar por nombre, correo o disponibilidad…" />
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nombre</th>
                  <th>Disponibilidad</th>
                  <th>Universidad</th>
                  <th>Áreas de interés</th>
                  <th>Postulado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {voluntarios.map((v) => (
                  <FilaExpandible
                    key={v.id}
                    colSpan={COLSPAN}
                    buscar={[v.nombre, v.correo, v.disponibilidad, v.universidad].filter(Boolean).join(" ").toLowerCase()}
                    resumen={
                      <>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.nombre}</div>
                          <div style={{ opacity: 0.6, fontSize: 12 }}>{v.correo}</div>
                        </td>
                        <td>{v.disponibilidad}</td>
                        <td>{v.universidad || "No aplica"}</td>
                        <td>{v.areas.join(", ") || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{soloFecha(v.createdAt)}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {!soloLectura && (
                            <ConfirmDelete
                              compact
                              mensaje={`¿Borrar la postulación de voluntario de ${v.nombre}? Esta acción no se puede deshacer.`}
                              action={async () => {
                                "use server";
                                await eliminarVoluntario(v.id);
                              }}
                            />
                          )}
                        </td>
                      </>
                    }
                    detalle={
                      <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "4px 12px", margin: 0, fontSize: 13.5 }}>
                        <Field k="Teléfono" v={v.telefono} />
                        <Field k="Carné" v={v.carnet} />
                        <Field k="Semestre" v={v.semestre} />
                        <Field k="Rango de edad" v={v.edad} />
                        <Field k="Comentarios" v={v.comentarios} pre />
                        <Field k="Evento" v={v.event.title} />
                        <Field k="Fecha de postulación" v={fechaHora(v.createdAt)} />
                      </dl>
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function Field({ k, v, pre }: { k: string; v?: string | null; pre?: boolean }) {
  if (!v) return null;
  return (
    <>
      <dt style={{ fontWeight: 600, opacity: 0.7 }}>{k}</dt>
      <dd style={{ margin: 0, whiteSpace: pre ? "pre-wrap" : "normal" }}>{v}</dd>
    </>
  );
}
