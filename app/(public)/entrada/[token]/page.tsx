import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { qrUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu entrada",
  robots: { index: false, follow: false },
};

export default async function EntradaPage({ params }: { params: { token: string } }) {
  const r = await prisma.attendeeRegistration.findUnique({
    where: { checkinToken: params.token },
    include: { event: true },
  });
  if (!r) return notFound();

  const fecha = r.event.date.toLocaleDateString("es-GT", { dateStyle: "full" });

  return (
    <main>
      <section className="section-pad" style={{ paddingTop: 130 }}>
        <div className="container" style={{ maxWidth: 520, marginInline: "auto", textAlign: "center" }}>
          <span className="eyebrow">Tu entrada</span>
          <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", margin: "16px 0 8px" }}>
            {r.event.title}
          </h1>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-head)", fontWeight: 700 }}>
            {fecha} · {r.event.location}
          </p>

          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 20,
              display: "inline-block",
              margin: "18px 0 12px",
              border: "2px solid var(--ink)",
              boxShadow: "var(--shadow-hard)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl(params.token)}
              alt="Código QR de tu entrada"
              width={280}
              height={280}
              style={{ display: "block", width: 280, height: 280 }}
            />
          </div>

          <p style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem", margin: "6px 0" }}>
            {r.nombre}
          </p>

          {r.checkedInAt ? (
            <p style={{ color: "var(--jade)", fontWeight: 600 }}>
              ✅ Asistencia registrada · {r.checkedInAt.toLocaleString("es-GT")}
            </p>
          ) : (
            <p style={{ color: "var(--soft)" }}>
              Muestra este código en la entrada del evento. Guárdalo o toma una captura.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
