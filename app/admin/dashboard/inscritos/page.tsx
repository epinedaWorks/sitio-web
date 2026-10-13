import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { eliminarInscrito, toggleCheckin } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import Buscador from "../Buscador";
import SelectorEvento from "../SelectorEvento";
import FilaExpandible from "../FilaExpandible";
import { fechaHora, soloFecha } from "@/lib/fecha";
import { getEventoActivoSlug } from "@/lib/settings";

const COLSPAN = 9;

export default async function InscritosAdminPage({
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

  const registrations = await prisma.attendeeRegistration.findMany({
    where: eventoSel !== "todos" ? { eventId: eventoSel } : undefined,
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  const compartenDatos = registrations.filter((r) => r.compartirDatos).length;
  const ingresaron = registrations.filter((r) => r.checkedInAt).length;

  return (
    <main>
      <div className="pg-head">
        <h1>Inscritos</h1>
        <p>Participantes inscritos a través del formulario público.</p>
      </div>

      <div className="pg-head-row" style={{ marginBottom: 16 }}>
        <SelectorEvento eventos={eventos} valor={eventoSel} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            className="pg-btn pg-btn-primary pg-btn-sm"
            href={`/api/admin/export?tipo=inscritos${eventoSel !== "todos" ? `&eventoId=${eventoSel}` : ""}`}
          >
            ⬇ Excel
          </a>
          <a
            className="pg-btn pg-btn-ghost pg-btn-sm"
            href={`/api/admin/export?tipo=inscritos&formato=csv${eventoSel !== "todos" ? `&eventoId=${eventoSel}` : ""}`}
          >
            CSV
          </a>
        </div>
      </div>

      <div className="pg-stats" style={{ marginBottom: 18 }}>
        <div className="pg-stat">
          <span className="n">{registrations.length}</span>
          <span className="l">Total</span>
        </div>
        <div className="pg-stat">
          <span className="n">{ingresaron}</span>
          <span className="l">Ingresaron</span>
        </div>
        <div className="pg-stat">
          <span className="n">{compartenDatos}</span>
          <span className="l">Autorizan compartir datos</span>
        </div>
      </div>

      {soloLectura && (
        <p className="pg-notice pg-notice-info">
          Estás en modo solo lectura: puedes ver y exportar, pero no marcar asistencia ni borrar nada.
        </p>
      )}

      {registrations.length === 0 ? (
        <p className="pg-card" style={{ opacity: 0.7 }}>
          Aún no hay inscritos.
        </p>
      ) : (
        <>
          <Buscador selector="[data-buscar]" placeholder="Buscar por nombre, correo, teléfono o rol…" />
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Universidad</th>
                  <th>Edad</th>
                  <th>Inscrito</th>
                  <th>Entrada</th>
                  <th>Comparte datos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <FilaExpandible
                    key={r.id}
                    colSpan={COLSPAN}
                    destacada={!!r.checkedInAt}
                    buscar={[r.nombre, r.correo, r.telefono, r.rol, r.universidad, r.event.title]
                      .filter(Boolean)
                      .join(" ")
                      .toLowerCase()}
                    resumen={
                      <>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                          <div style={{ opacity: 0.6, fontSize: 12 }}>{r.correo}</div>
                        </td>
                        <td>{r.rol || "—"}</td>
                        <td>{r.universidad || "No aplica"}</td>
                        <td>{r.edad || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{soloFecha(r.createdAt)}</td>
                        <td>
                          {r.checkedInAt ? (
                            <span className="pg-badge pg-badge-success">✓ ingresó</span>
                          ) : (
                            <span className="pg-badge pg-badge-neutral">—</span>
                          )}
                        </td>
                        <td>
                          {r.compartirDatos ? (
                            <span className="pg-badge pg-badge-success">Sí</span>
                          ) : (
                            <span className="pg-badge pg-badge-neutral">No</span>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {!soloLectura && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <form
                                action={async () => {
                                  "use server";
                                  await toggleCheckin(r.id);
                                }}
                              >
                                <button type="submit" className="pg-btn pg-btn-ghost pg-btn-sm">
                                  {r.checkedInAt ? "Quitar" : "Marcar"}
                                </button>
                              </form>
                              <ConfirmDelete
                                compact
                                mensaje={`¿Borrar la inscripción de ${r.nombre}? Esta acción no se puede deshacer.`}
                                action={async () => {
                                  "use server";
                                  await eliminarInscrito(r.id);
                                }}
                              />
                            </div>
                          )}
                        </td>
                      </>
                    }
                    detalle={
                      <dl style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "4px 12px", margin: 0, fontSize: 13.5 }}>
                        <Field k="¿Asistirá?" v={r.asistira} />
                        <Field k="Correo" v={r.correo} />
                        <Field k="Teléfono" v={r.telefono} />
                        <Field k="Semestre" v={r.semestre} />
                        <Field k="Experiencia con Python" v={r.experiencia} />
                        <Field k="Años de experiencia en tecnología" v={r.aniosExperiencia} />
                        <Field k="¿Cómo se enteró?" v={r.comoSeEntero} />
                        <Field k="Comentarios" v={r.comentarios} pre />
                        <Field k="Evento" v={r.event.title} />
                        <Field k="Fecha de inscripción" v={fechaHora(r.createdAt)} />
                        <Field k="Entrada" v={r.checkedInAt ? `Ingresó ${fechaHora(r.checkedInAt)}` : "No ha ingresado"} />
                        <Field
                          k="Exposición de proyectos"
                          v={r.proyectosAt ? `Pasó ${fechaHora(r.proyectosAt)}` : "No ha pasado"}
                        />
                        <Field k="Coffee break" v={r.coffeeAt ? `Pasó ${fechaHora(r.coffeeAt)}` : "No ha pasado"} />
                        <Field
                          k="Almuerzo"
                          v={r.almuerzoAt ? `Se le dio ${fechaHora(r.almuerzoAt)}` : "No se le ha dado"}
                        />
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
