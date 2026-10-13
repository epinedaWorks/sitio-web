import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { actualizarEstadoPonente, actualizarModalidadPonente, actualizarContactadoPonente, eliminarPonente } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import EstadoPonenteBotones from "../EstadoPonenteBotones";
import ModalidadSelector from "../ModalidadSelector";
import ContactadoToggle from "../ContactadoToggle";
import AceptarRapido from "../AceptarRapido";
import SelectorEvento from "../SelectorEvento";
import FilaExpandible from "../FilaExpandible";
import Buscador from "../Buscador";
import { fechaHora } from "@/lib/fecha";
import { getEventoActivoSlug } from "@/lib/settings";

const MODALIDADES = ["CHARLA", "TALLER", "PROYECTO"] as const;
const ETIQUETA_MODALIDAD: Record<(typeof MODALIDADES)[number], string> = {
  CHARLA: "Charlas",
  TALLER: "Talleres",
  PROYECTO: "Proyectos",
};
const COLSPAN = 9;

const BADGE_ESTADO: Record<string, string> = {
  PENDIENTE: "pg-badge-warn",
  ACEPTADA: "pg-badge-success",
  RECHAZADA: "pg-badge-danger",
};

export default async function PonentesAdminPage({
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

  const submissions = await prisma.speakerSubmission.findMany({
    where: eventoSel !== "todos" ? { eventId: eventoSel } : undefined,
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  const porEstado = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0 };
  const porModalidad = Object.fromEntries(
    MODALIDADES.map((m) => [m, { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0 }])
  ) as Record<(typeof MODALIDADES)[number], { PENDIENTE: number; ACEPTADA: number; RECHAZADA: number }>;
  submissions.forEach((s) => {
    porEstado[s.status]++;
    porModalidad[s.modalidad][s.status]++;
  });

  return (
    <main>
      <div className="pg-head">
        <h1>Ponentes</h1>
        <p>Postulaciones de charlas, talleres y proyectos.</p>
      </div>

      <div className="pg-head-row" style={{ marginBottom: 16 }}>
        <SelectorEvento eventos={eventos} valor={eventoSel} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            className="pg-btn pg-btn-primary pg-btn-sm"
            href={`/api/admin/export?tipo=ponentes${eventoSel !== "todos" ? `&eventoId=${eventoSel}` : ""}`}
          >
            ⬇ Excel
          </a>
          <a
            className="pg-btn pg-btn-ghost pg-btn-sm"
            href={`/api/admin/export?tipo=ponentes&formato=csv${eventoSel !== "todos" ? `&eventoId=${eventoSel}` : ""}`}
          >
            CSV
          </a>
        </div>
      </div>

      <div className="pg-stats" style={{ marginBottom: 14 }}>
        <div className="pg-stat">
          <span className="n">{porEstado.PENDIENTE}</span>
          <span className="l">Pendientes</span>
        </div>
        <div className="pg-stat">
          <span className="n">{porEstado.ACEPTADA}</span>
          <span className="l">Aceptadas</span>
        </div>
        <div className="pg-stat">
          <span className="n">{porEstado.RECHAZADA}</span>
          <span className="l">Rechazadas</span>
        </div>
      </div>

      <div className="pg-card" style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, margin: "0 0 8px", textTransform: "uppercase" }}>
          Por modalidad
        </p>
        <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
          <thead>
            <tr>
              <th style={cabecera}></th>
              <th style={cabecera}>Pendientes</th>
              <th style={cabecera}>Aceptadas</th>
              <th style={cabecera}>Rechazadas</th>
              <th style={cabecera}>Total</th>
            </tr>
          </thead>
          <tbody>
            {MODALIDADES.map((m) => {
              const c = porModalidad[m];
              const total = c.PENDIENTE + c.ACEPTADA + c.RECHAZADA;
              return (
                <tr key={m}>
                  <td style={{ ...celda, fontWeight: 600 }}>{ETIQUETA_MODALIDAD[m]}</td>
                  <td style={celda}>{c.PENDIENTE}</td>
                  <td style={celda}>{c.ACEPTADA}</td>
                  <td style={celda}>{c.RECHAZADA}</td>
                  <td style={{ ...celda, fontWeight: 600 }}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {soloLectura && (
        <p className="pg-notice pg-notice-info">
          Estás en modo solo lectura: puedes ver todo, pero no aceptar, rechazar, cambiar ni borrar nada.
        </p>
      )}

      {submissions.length === 0 ? (
        <p className="pg-card" style={{ opacity: 0.7 }}>
          Aún no hay postulaciones.
        </p>
      ) : (
        <>
          <Buscador selector="[data-buscar]" placeholder="Buscar por nombre, correo, tema o modalidad…" />
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nombre</th>
                  <th>Modalidad</th>
                  <th>Tema</th>
                  <th>Nivel</th>
                  <th>Estado</th>
                  <th>Contactado</th>
                  <th>Recibida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <FilaExpandible
                    key={s.id}
                    colSpan={COLSPAN}
                    buscar={[s.nombre, s.correo, s.tema, s.modalidad].filter(Boolean).join(" ").toLowerCase()}
                    resumen={
                      <>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                          <div style={{ opacity: 0.6, fontSize: 12 }}>{s.correo}</div>
                        </td>
                        <td>{ETIQUETA_MODALIDAD[s.modalidad]}</td>
                        <td style={{ maxWidth: 220 }}>{s.tema}</td>
                        <td>{s.nivel || "—"}</td>
                        <td>
                          <span className={`pg-badge ${BADGE_ESTADO[s.status]}`}>{s.status}</span>
                        </td>
                        <td>
                          {s.contactado ? (
                            <span className="pg-badge pg-badge-info">Sí</span>
                          ) : (
                            <span className="pg-badge pg-badge-neutral">No</span>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{fechaHora(s.createdAt)}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {!soloLectura && (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <AceptarRapido id={s.id} estado={s.status} actualizar={actualizarEstadoPonente} />
                              <ConfirmDelete
                                compact
                                mensaje={`¿Borrar la postulación de ${s.nombre} ("${s.tema}")? Esta acción no se puede deshacer.`}
                                action={async () => {
                                  "use server";
                                  await eliminarPonente(s.id);
                                }}
                              />
                            </div>
                          )}
                        </td>
                      </>
                    }
                    detalle={
                      <div style={{ display: "grid", gap: 16 }}>
                        <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "4px 12px", margin: 0, fontSize: 13.5 }}>
                          <Field k="Teléfono" v={s.telefono} />
                          <Field k="Evento" v={s.event.title} />
                          <Field k="Descripción de la propuesta" v={s.descripcion} pre />
                          <Field k="Acerca de (bio)" v={s.bio} pre />
                          <Field k="Integrantes del equipo" v={s.integrantes} pre />
                          <Field k="Necesidades / logística" v={s.necesidades} pre />
                          <Field k="Sigue a la comunidad" v={s.sigueComunidad == null ? null : s.sigueComunidad ? "Sí" : "No"} />
                          <Field k="LinkedIn" v={s.linkedin} link />
                          <Field k="Instagram" v={s.instagram} />
                          <Field k="Empresa" v={s.empresa} />
                          <Field k="Cargo" v={s.cargo} />
                          <Field k="Edad" v={s.edad?.toString()} />
                          <Field k="Foto (URL)" v={s.fotoUrl} link />
                          <Field k="¿De otro país?" v={s.pais} />
                          <Field k="¿Cómo se enteró?" v={s.comoSeEntero} />
                          <Field k="Comentarios" v={s.comentarios} pre />
                          <Field k="Autoriza compartir datos con empresas" v={s.compartirDatos ? "Sí" : "No"} />
                        </dl>
                        {!soloLectura && (
                          <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
                            <EstadoPonenteBotones id={s.id} estado={s.status} actualizar={actualizarEstadoPonente} />
                            <ModalidadSelector id={s.id} modalidad={s.modalidad} actualizar={actualizarModalidadPonente} />
                            <ContactadoToggle id={s.id} contactado={s.contactado} actualizar={actualizarContactadoPonente} />
                          </div>
                        )}
                      </div>
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

const cabecera: React.CSSProperties = {
  textAlign: "left",
  padding: "3px 12px 3px 0",
  fontWeight: 600,
  opacity: 0.6,
  fontSize: 12,
};
const celda: React.CSSProperties = { padding: "3px 12px 3px 0" };

function Field({ k, v, pre, link }: { k: string; v?: string | null; pre?: boolean; link?: boolean }) {
  if (!v) return null;
  return (
    <>
      <dt style={{ fontWeight: 600, opacity: 0.7 }}>{k}</dt>
      <dd style={{ margin: 0, whiteSpace: pre ? "pre-wrap" : "normal" }}>
        {link ? (
          <a href={v} target="_blank" rel="noopener noreferrer">
            {v}
          </a>
        ) : (
          v
        )}
      </dd>
    </>
  );
}
