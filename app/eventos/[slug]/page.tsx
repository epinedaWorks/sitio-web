import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventoModales from "@/app/components/EventoModales";

export default async function EventoDetallePage({ params }: { params: { slug: string } }) {
  const evento = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      albums: {
        include: { images: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!evento || !evento.published) return notFound();

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>{evento.title}</h1>
      <p style={{ opacity: 0.75 }}>
        {evento.date.toLocaleDateString("es-GT", { dateStyle: "long" })} · {evento.location}
      </p>
      <p>{evento.description}</p>

      <EventoModales eventSlug={evento.slug} />

      <h2 style={{ marginTop: 40 }}>Galería por actividad</h2>
      {evento.albums.map((album) => (
        <section key={album.id} style={{ marginBottom: 32 }}>
          <h3>{album.title}</h3>
          {album.description && <p style={{ opacity: 0.75 }}>{album.description}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {album.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.caption || album.title}
                style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8 }}
              />
            ))}
          </div>
          {album.images.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>Aún no hay fotos en este álbum.</p>}
        </section>
      ))}
      {evento.albums.length === 0 && <p>Aún no hay álbumes para este evento.</p>}
    </main>
  );
}
