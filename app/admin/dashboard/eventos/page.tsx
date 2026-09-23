import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearEvento, togglePublicado, editarEvento } from "../actions";
import { soloFecha, paraInputDateTime } from "@/lib/fecha";

const MENSAJES: Record<string, { texto: string; ok: boolean }> = {
  creado: { texto: "Evento creado.", ok: true },
  guardado: { texto: "Cambios guardados.", ok: true },
  slug: { texto: "Ese slug ya lo usa otro evento. Elige uno distinto.", ok: false },
  faltan: { texto: "Faltan campos obligatorios (título, slug y fecha).", ok: false },
};

export default async function EventosAdminPage({
  searchParams,
}: {
  searchParams?: { msg?: string };
}) {
  const session = await requireAdminSession();
  const soloLectura = (session.user as { role?: string } | undefined)?.role === "VIEWER";
  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Eventos</h1>

      {soloLectura && (
        <p style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, background: "#eee", color: "#555" }}>
          Estás en modo solo lectura: puedes ver todo, pero no crear ni cambiar nada aquí.
        </p>
      )}

      {aviso && (
        <p
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 14,
            background: aviso.ok ? "#d5f5e3" : "#fadbd8",
            color: aviso.ok ? "#1b5e20" : "#8e2a22",
          }}
        >
          {aviso.texto}
        </p>
      )}

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Crear evento</h2>
      <form action={crearEvento} style={{ display: "grid", gap: 10, maxWidth: 480, marginBottom: 36 }}>
        <input name="title" placeholder="Título (ej. Python eXposition Day 2027)" required />
        <input name="slug" placeholder="slug (ej. xpday-2027)" required />
        <input name="date" type="datetime-local" required />
        <input name="location" placeholder="Ubicación" />
        <textarea name="description" placeholder="Descripción" rows={3} />
        <label style={{ fontSize: 14 }}>
          <input type="checkbox" name="published" /> Publicado (visible en el sitio)
        </label>
        <button type="submit">Crear evento</button>
      </form>

      <h2 style={{ fontSize: 18 }}>Eventos ({eventos.length})</h2>
      <p style={{ opacity: 0.7, fontSize: 13, marginTop: 0 }}>
        Haz clic en un evento para editar su fecha, lugar, descripción o slug.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {eventos.map((e) => (
          <div
            key={e.id}
            style={{ border: "1px solid #ddd", borderRadius: 10, padding: "10px 14px", background: "#fff" }}
          >
            <details>
              <summary style={{ cursor: "pointer", fontWeight: 600, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <span>{e.title}</span>
                <span style={{ opacity: 0.65, fontWeight: 400 }}>{soloFecha(e.date)}</span>
                <code style={{ fontSize: 12, background: "#f2f2f2", padding: "1px 6px", borderRadius: 4 }}>
                  /eventos/{e.slug}
                </code>
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: e.published ? "#d5f5e3" : "#eee",
                    color: e.published ? "#1b5e20" : "#666",
                  }}
                >
                  {e.published ? "Publicado" : "Borrador"}
                </span>
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
                <button type="submit">Guardar cambios</button>
              </form>

              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13 }}>
                <form
                  action={async () => {
                    "use server";
                    await togglePublicado(e.id, !e.published);
                  }}
                >
                  <button type="submit">{e.published ? "Despublicar" : "Publicar ahora"}</button>
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
