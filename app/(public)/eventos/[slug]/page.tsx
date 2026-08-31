import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Albumes, { type Album } from "@/app/components/Albumes";
import { EVENT_SLUG } from "@/app/site-data";

export const revalidate = 3600;

async function getEvento(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      albums: {
        include: {
          images: { orderBy: { order: "asc" }, select: { url: true, caption: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const e = await getEvento(params.slug);
  if (!e || !e.published) return { title: "Evento no encontrado" };
  const foto = e.albums.flatMap((a) => a.images)[0]?.url;
  const fecha = e.date.toLocaleDateString("es-GT", { dateStyle: "long" });
  return {
    title: e.title,
    description: `${e.title} · ${fecha} · ${e.location}. ${e.description}`.slice(0, 300),
    openGraph: {
      title: e.title,
      description: e.description.slice(0, 200),
      images: foto ? [foto] : undefined,
    },
  };
}

export default async function EventoDetallePage({
  params,
}: {
  params: { slug: string };
}) {
  const e = await getEvento(params.slug);
  if (!e || !e.published) return notFound();

  const esProximo = e.date.getTime() >= Date.now();
  const albums: Album[] = e.albums
    .map((a) => ({ id: a.id, title: a.title, description: a.description, images: a.images }))
    .filter((a) => a.images.length > 0);

  return (
    <main>
      <section className="section-pad" style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head reveal" style={{ maxWidth: 820 }}>
            <span className="eyebrow">{esProximo ? "Próximo evento" : "Edición pasada"}</span>
            <h1 style={{ fontSize: "clamp(2rem, 4.6vw, 3.4rem)", margin: "18px 0 14px", lineHeight: 1.02 }}>
              {e.title}
            </h1>
            <p style={{ color: "var(--gold)", fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 14 }}>
              {e.date.toLocaleDateString("es-GT", { dateStyle: "full" })} · {e.location}
            </p>
            <p style={{ color: "var(--soft)", fontSize: "1.08rem" }}>{e.description}</p>

            {esProximo && e.slug === EVENT_SLUG && (
              <div className="hero-cta" style={{ marginTop: 24 }}>
                <a className="btn btn-yellow js-inscribir" href="/inscripcion">
                  Inscríbete como asistente →
                </a>
                <a className="btn btn-primary js-ponente" href="/conferencistas">
                  Ser conferencista, tallerista o expositor
                </a>
              </div>
            )}
          </div>

          {albums.length > 0 ? (
            <Albumes
              albums={albums}
              heading={`Galería · ${e.title}`}
              sub="Momentos capturados por la comunidad · haz clic para ampliar"
            />
          ) : (
            <p style={{ color: "var(--dim)", marginTop: 20 }}>
              {esProximo
                ? "Las fotos se publicarán después del evento."
                : "Aún no hay fotos de este evento."}
            </p>
          )}

          <p style={{ marginTop: 40 }}>
            <a className="eu-link" href="/eventos">
              ← Ver todos los eventos
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
