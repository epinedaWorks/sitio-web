import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Eventos de la Comunidad Python Guatemala: el Python eXposition Day y las actividades de la comunidad.",
};

export default async function EventosPage() {
  const eventos = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    include: {
      albums: {
        include: { images: { orderBy: { order: "asc" }, select: { url: true } } },
      },
    },
  });

  const ahora = Date.now();

  return (
    <main>
      <section className="section-pad" style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Eventos</span>
            <h1 style={{ fontSize: "clamp(2rem, 4.4vw, 3.3rem)", margin: "18px 0 14px" }}>
              Nuestros encuentros
            </h1>
            <p style={{ color: "var(--soft)" }}>
              El evento insignia es el <b>Python eXposition Day</b>: un día completo de charlas,
              talleres y exposición de proyectos.
            </p>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            {eventos.map((e) => {
              const portada = e.albums.flatMap((a) => a.images)[0]?.url;
              const proximo = e.date.getTime() >= ahora;
              return (
                <Link
                  key={e.id}
                  href={`/eventos/${e.slug}`}
                  className="album-card reveal"
                  style={{ textDecoration: "none", display: "grid", gridTemplateColumns: portada ? "220px 1fr" : "1fr" }}
                >
                  {portada && (
                    <div className="album-cover" style={{ aspectRatio: "auto" }}>
                      <img src={portada.replace("/full/", "/thumb/")} alt={e.title} loading="lazy" />
                    </div>
                  )}
                  <div className="album-body">
                    <span className="album-count" style={{ position: "static", display: "inline-block", marginBottom: 8 }}>
                      {proximo ? "Próximo" : "Pasado"}
                    </span>
                    <h3 style={{ fontSize: "1.4rem", margin: "0 0 6px" }}>{e.title}</h3>
                    <p style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 600 }}>
                      {e.date.toLocaleDateString("es-GT", { dateStyle: "long" })} · {e.location}
                    </p>
                    <p style={{ color: "var(--soft)", fontSize: "0.95rem", marginTop: 6 }}>
                      {e.description.slice(0, 160)}
                      {e.description.length > 160 ? "…" : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
            {eventos.length === 0 && <p style={{ color: "var(--dim)" }}>Aún no hay eventos publicados.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
