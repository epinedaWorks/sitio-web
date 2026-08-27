import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export default async function InscritosAdminPage() {
  await requireAdminSession();
  const registrations = await prisma.attendeeRegistration.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  const compartenDatos = registrations.filter((r) => r.compartirDatos).length;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Participantes inscritos</h1>
      <p style={{ opacity: 0.75 }}>
        Total: {registrations.length} · Autorizan compartir datos con empresas: {compartenDatos}
      </p>

      {registrations.length === 0 && <p>Aún no hay inscritos.</p>}

      {registrations.map((r) => (
        <details key={r.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            {r.nombre} · <span style={{ opacity: 0.7 }}>{r.correo}</span> · {r.asistira || "—"}
            {r.compartirDatos && (
              <span style={{ fontSize: 12, marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "#d5f5e3" }}>
                comparte datos
              </span>
            )}
          </summary>
          <dl style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "4px 12px", margin: "12px 0", fontSize: 14 }}>
            <Field k="¿Asistirá?" v={r.asistira} />
            <Field k="Correo" v={r.correo} />
            <Field k="Teléfono" v={r.telefono} />
            <Field k="Rol actual" v={r.rol} />
            <Field k="Universidad" v={r.universidad} />
            <Field k="Semestre" v={r.semestre} />
            <Field k="Experiencia con Python" v={r.experiencia} />
            <Field k="¿Cómo se enteró?" v={r.comoSeEntero} />
            <Field k="Comentarios" v={r.comentarios} pre />
            <Field k="Autoriza compartir datos con empresas" v={r.compartirDatos ? "Sí" : "No"} />
            <Field k="Evento" v={r.event.title} />
            <Field k="Fecha de inscripción" v={r.createdAt.toLocaleString("es-GT")} />
          </dl>
        </details>
      ))}
    </main>
  );
}

function Field({ k, v, pre }: { k: string; v?: string | null; pre?: boolean }) {
  if (!v) return null;
  return (
    <>
      <dt style={{ fontWeight: 600, opacity: 0.7 }}>{k}</dt>
      <dd style={{ margin: 0, whiteSpace: pre ? "pre-wrap" : "normal" }}>{v}</dd>
    </>
  );
}
