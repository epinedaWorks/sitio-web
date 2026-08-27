import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EventosPage() {
  const eventos = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Eventos</h1>
      {eventos.map((e) => (
        <Link
          key={e.id}
          href={`/eventos/${e.slug}`}
          style={{ display: "block", border: "1px solid #ddd", borderRadius: 10, padding: 20, marginBottom: 12, textDecoration: "none", color: "inherit" }}
        >
          <h3 style={{ margin: 0 }}>{e.title}</h3>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            {e.date.toLocaleDateString("es-GT", { dateStyle: "long" })} · {e.location}
          </p>
        </Link>
      ))}
      {eventos.length === 0 && <p>Aún no hay eventos publicados.</p>}
    </main>
  );
}
