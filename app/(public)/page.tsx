import { prisma } from "@/lib/prisma";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Comunidad from "../components/Comunidad";
import Eventos from "../components/Eventos";
import Apoyanos from "../components/Apoyanos";
import Equipo from "../components/Equipo";
import Conducta from "../components/Conducta";
import Unete from "../components/Unete";
import type { Album } from "../components/Albumes";

// Refresca los álbumes cada hora sin necesidad de redeploy.
export const revalidate = 3600;

async function getAlbumes(): Promise<Album[]> {
  try {
    const albums = await prisma.album.findMany({
      include: {
        images: { orderBy: { order: "asc" }, select: { url: true, caption: true } },
        event: { select: { slug: true, published: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    // Primero los álbumes con fotos (y el que más tenga), luego los vacíos.
    return albums
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        images: a.images,
        // Si el álbum pertenece a un evento publicado, la tarjeta enlaza a su
        // página (/eventos/<slug>) en vez de abrir el modal: así hay una URL
        // que se puede compartir. Los álbumes del contenedor "galería de la
        // comunidad" (evento sin publicar) no tienen slug y siguen con modal.
        slug: a.event?.published ? a.event.slug : null,
      }))
      .sort((x, y) => (y.images.length > 0 ? 1 : 0) - (x.images.length > 0 ? 1 : 0) || y.images.length - x.images.length);
  } catch {
    // Si la base de datos no está disponible, el sitio igual se renderiza.
    return [];
  }
}

export default async function HomePage() {
  const albums = await getAlbumes();

  return (
    <main>
      <Hero />
      <Marquee />
      <Comunidad />
      <Eventos albums={albums} />
      <Apoyanos />
      <Equipo />
      <Conducta />
      <Unete />
    </main>
  );
}
