import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearAlbum, agregarFoto, eliminarFoto } from "../actions";

export default async function GaleriaAdminPage() {
  await requireAdminSession();

  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const albumes = await prisma.album.findMany({
    include: { images: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Álbumes y galería</h1>
      <p style={{ opacity: 0.75 }}>
        Cada evento puede tener varios álbumes (uno por actividad: charlas, talleres, networking, etc.)
      </p>

      <h3>Crear álbum</h3>
      <form action={crearAlbum} style={{ display: "grid", gap: 10, maxWidth: 480, marginBottom: 32 }}>
        <select name="eventId" required>
          <option value="" disabled selected>
            Selecciona un evento
          </option>
          {eventos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <input name="title" placeholder="Nombre del álbum (ej. Talleres)" required />
        <textarea name="description" placeholder="Descripción (opcional)" rows={2} />
        <button type="submit">Crear álbum</button>
      </form>

      {albumes.map((album) => (
        <section key={album.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <h4>
            {album.title} <span style={{ opacity: 0.6, fontWeight: 400 }}>· {album.event.title}</span>
          </h4>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "12px 0" }}>
            {album.images.map((img) => (
              <div key={img.id} style={{ width: 120 }}>
                <img src={img.url} alt={img.caption || ""} style={{ width: "100%", borderRadius: 6 }} />
                <form
                  action={async () => {
                    "use server";
                    await eliminarFoto(img.id);
                  }}
                >
                  <button type="submit" style={{ fontSize: 12 }}>
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
            {album.images.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>Aún no hay fotos.</p>}
          </div>

          <form action={agregarFoto} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="hidden" name="albumId" value={album.id} />
            <input name="url" placeholder="URL de la imagen" required style={{ flex: 1, minWidth: 220 }} />
            <input name="caption" placeholder="Descripción (opcional)" />
            <button type="submit">Agregar foto</button>
          </form>
        </section>
      ))}
    </main>
  );
}
