import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearEvento, togglePublicado } from "../actions";

export default async function EventosAdminPage() {
  await requireAdminSession();
  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" } });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Eventos</h1>

      <form action={crearEvento} style={{ display: "grid", gap: 10, maxWidth: 480, marginBottom: 32 }}>
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

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cell}>Título</th>
            <th style={cell}>Fecha</th>
            <th style={cell}>Slug</th>
            <th style={cell}>Publicado</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((e) => (
            <tr key={e.id}>
              <td style={cell}>{e.title}</td>
              <td style={cell}>{e.date.toLocaleDateString("es-GT")}</td>
              <td style={cell}>{e.slug}</td>
              <td style={cell}>
                <form
                  action={async () => {
                    "use server";
                    await togglePublicado(e.id, !e.published);
                  }}
                >
                  <button type="submit">{e.published ? "Sí — despublicar" : "No — publicar"}</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const cell: React.CSSProperties = { border: "1px solid #ddd", padding: "8px 12px", fontSize: 14, textAlign: "left" };
