import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Devuelve los álbumes de un evento (con sus fotos), o de todos si no se
// pasa eventSlug. Usado por la página pública de eventos.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventSlug = searchParams.get("eventSlug");

  const albums = await prisma.album.findMany({
    where: eventSlug ? { event: { slug: eventSlug } } : undefined,
    include: {
      images: { orderBy: { order: "asc" } },
      event: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(albums);
}
