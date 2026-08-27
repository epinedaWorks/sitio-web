import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearAlbum, agregarFoto, eliminarFoto, moverFoto } from "../actions";
import SubirFotos from "../SubirFotos";

export default async function GaleriaAdminPage() {
  await requireAdminSession();

  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const albumes = await prisma.album.findMany({
    include: { images: { orderBy: { order: "asc" } }, event: true },
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

          {album.images.length > 0 && (
            <p style={{ fontSize: 12, opacity: 0.65, margin: "10px 0 4px" }}>
              Usa ◀ ▶ para cambiar el orden en que se ven en la web.
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "8px 0" }}>
            {album.images.map((img, i) => (
              <div key={img.id} style={{ width: 120 }}>
                <img
                  src={img.url}
                  alt={img.caption || ""}
                  style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, background: "#eee" }}
                />
                <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                  <form
                    action={async () => {
                      "use server";
                      await moverFoto(img.id, "arriba");
                    }}
                  >
                    <button type="submit" style={{ fontSize: 12, padding: "2px 7px" }} disabled={i === 0} title="Mover antes">
                      ◀
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moverFoto(img.id, "abajo");
                    }}
                  >
                    <button
                      type="submit"
                      style={{ fontSize: 12, padding: "2px 7px" }}
                      disabled={i === album.images.length - 1}
                      title="Mover después"
                    >
                      ▶
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await eliminarFoto(img.id);
                    }}
                    style={{ marginLeft: "auto" }}
                  >
                    <button type="submit" style={{ fontSize: 12, padding: "2px 7px", color: "#c0392b" }} title="Eliminar">
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {album.images.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>Aún no hay fotos.</p>}
          </div>

          <SubirFotos albumId={album.id} />

          <form action={agregarFoto} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="hidden" name="albumId" value={album.id} />
            <input name="url" placeholder="…o pega una URL de imagen" required style={{ flex: 1, minWidth: 220 }} />
            <input name="caption" placeholder="Descripción (opcional)" />
            <button type="submit">Agregar por URL</button>
          </form>
        </section>
      ))}
    </main>
  );
}
