import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearEvento, togglePublicado, editarEvento, marcarEventoActivo } from "../actions";
import { soloFecha, paraInputDateTime } from "@/lib/fecha";
import { getEventoActivoSlug } from "@/lib/settings";
import SelectorEventoActivo from "../SelectorEventoActivo";

const MENSAJES: Record<string, { texto: string; ok: boolean }> = {
  creado: { texto: "Evento creado.", ok: true },
  guardado: { texto: "Cambios guardados.", ok: true },
  activo: { texto: "Listo, ese es ahora el evento activo: los formularios públicos y el check-in apuntan a él.", ok: true },
  slug: { texto: "Ese slug ya lo usa otro evento. Elige uno distinto.", ok: false },
  faltan: { texto: "Faltan campos obligatorios (título, slug y fecha).", ok: false },
};

export default async function EventosAdminPage({
  searchParams,
}: {
  searchParams?: { msg?: string };
}) {
  const session = await requireAdminSession();
  const rol = (session.user as { role?: string } | undefined)?.role;
  const soloLectura = rol === "VIEWER";
  const esAdmin = rol === "ADMIN";
  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const eventoActivoSlug = await getEventoActivoSlug();
  const eventoActivoId = eventos.find((e) => e.slug === eventoActivoSlug)?.id;
  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  return (
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Eventos</h1>
        <p>
          El evento marcado como <strong>activo</strong> es al que apuntan la portada, la inscripción, las
          postulaciones de ponentes/voluntarios, el check-in y las estadísticas del panel. Solo puede haber
          uno activo a la vez, y cambiarlo actualiza todo eso de inmediato.
        </p>
      </div>

      {esAdmin ? (
        <div className="pg-card" style={{ background: "#fff8e1", borderColor: "#ffe29a", marginBottom: 24 }}>
          <SelectorEventoActivo eventos={eventos} activoId={eventoActivoId} action={marcarEventoActivo} />
        </div>
      ) : (
        <p className="pg-notice pg-notice-info">Solo una cuenta ADMIN puede cambiar el evento activo.</p>
      )}

      {soloLectura && (
        <p className="pg-notice pg-notice-info">
          Estás en modo solo lectura: puedes ver todo, pero no crear ni cambiar nada aquí.
        </p>
      )}

      {aviso && <p className={`pg-notice ${aviso.ok ? "pg-notice-ok" : "pg-notice-err"}`}>{aviso.texto}</p>}

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Crear evento</h2>
      <form action={crearEvento} className="pg-card" style={{ display: "grid", gap: 10, maxWidth: 480, marginBottom: 36 }}>
        <input name="title" placeholder="Título (ej. Python eXposition Day 2027)" required />
        <input name="slug" placeholder="slug (ej. xpday-2027)" required />
        <input name="date" type="datetime-local" required />
        <input name="location" placeholder="Ubicación" />
        <textarea name="description" placeholder="Descripción" rows={3} />
        <label style={{ fontSize: 14 }}>
          <input type="checkbox" name="published" /> Publicado (visible en el sitio)
        </label>
        <button type="submit" className="pg-btn pg-btn-primary" style={{ justifySelf: "start" }}>
          Crear evento
        </button>
      </form>

      <h2 style={{ fontSize: 16 }}>Eventos ({eventos.length})</h2>
      <p style={{ opacity: 0.7, fontSize: 13, marginTop: 0 }}>
        Haz clic en un evento para editar su fecha, lugar, descripción o slug.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {eventos.map((e) => (
          <div key={e.id} className="pg-card">
            <details>
              <summary style={{ cursor: "pointer", fontWeight: 600, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <span>{e.title}</span>
                <span style={{ opacity: 0.65, fontWeight: 400 }}>{soloFecha(e.date)}</span>
                <code style={{ fontSize: 12, background: "#f2f2f2", padding: "1px 6px", borderRadius: 4 }}>
                  /eventos/{e.slug}
                </code>
                <span className={`pg-badge ${e.published ? "pg-badge-success" : "pg-badge-neutral"}`}>
                  {e.published ? "Publicado" : "Borrador"}
                </span>
                {e.slug === eventoActivoSlug && <span className="pg-badge pg-badge-gold">★ Activo</span>}
              </summary>

              <form
                action={editarEvento.bind(null, e.id)}
                style={{ display: "grid", gap: 8, maxWidth: 480, margin: "14px 0 6px" }}
              >
                <label style={{ fontSize: 13 }}>
                  Título
                  <input name="title" defaultValue={e.title} required style={{ width: "100%" }} />
                </label>
                <label style={{ fontSize: 13 }}>
                  Slug (parte final de la URL)
                  <input name="slug" defaultValue={e.slug} required style={{ width: "100%" }} />
                </label>
                <label style={{ fontSize: 13 }}>
                  Fecha y hora
                  <input
                    name="date"
                    type="datetime-local"
                    defaultValue={paraInputDateTime(e.date)}
                    required
                    style={{ width: "100%" }}
                  />
                </label>
                <label style={{ fontSize: 13 }}>
                  Ubicación
                  <input name="location" defaultValue={e.location} style={{ width: "100%" }} />
                </label>
                <label style={{ fontSize: 13 }}>
                  Descripción
                  <textarea name="description" defaultValue={e.description} rows={3} style={{ width: "100%" }} />
                </label>
                <label style={{ fontSize: 14 }}>
                  <input type="checkbox" name="published" defaultChecked={e.published} /> Publicado (visible en el sitio)
                </label>
                <button type="submit" className="pg-btn pg-btn-sm" style={{ justifySelf: "start" }}>
                  Guardar cambios
                </button>
              </form>

              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13 }}>
                <form
                  action={async () => {
                    "use server";
                    await togglePublicado(e.id, !e.published);
                  }}
                >
                  <button type="submit" className="pg-btn pg-btn-ghost pg-btn-sm">
                    {e.published ? "Despublicar" : "Publicar ahora"}
                  </button>
                </form>
                {e.published && (
                  <a href={`/eventos/${e.slug}`} target="_blank" rel="noopener noreferrer">
                    Ver página pública →
                  </a>
                )}
              </div>
            </details>
          </div>
        ))}
        {eventos.length === 0 && <p style={{ opacity: 0.7 }}>Aún no hay eventos.</p>}
      </div>
    </main>
  );
}
