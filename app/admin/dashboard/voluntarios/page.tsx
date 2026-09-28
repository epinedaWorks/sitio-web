import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { eliminarVoluntario } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import { fechaHora } from "@/lib/fecha";

export default async function VoluntariosAdminPage() {
  const session = await requireAdminSession();
  const soloLectura = (session.user as { role?: string } | undefined)?.role === "VIEWER";
  const voluntarios = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Postulaciones de voluntarios</h1>
      <p style={{ opacity: 0.75 }}>Total: {voluntarios.length}</p>

      {soloLectura && (
        <p style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, background: "#eee", color: "#555" }}>
          Estás en modo solo lectura: puedes ver y exportar, pero no borrar nada.
        </p>
      )}

      <p style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a
          href="/api/admin/export?tipo=voluntarios"
          style={{
            display: "inline-block",
            padding: "8px 14px",
            background: "#159d68",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ⬇ Descargar Excel
        </a>
        <a href="/api/admin/export?tipo=voluntarios&formato=csv" style={{ fontSize: 13 }}>
          o CSV
        </a>
      </p>

      {voluntarios.length === 0 && <p>Aún no hay postulaciones.</p>}

      {voluntarios.map((v) => (
        <div
          key={v.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10,
            background: "#fff",
          }}
        >
          <details style={{ flex: 1, minWidth: 0 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {v.nombre} · <span style={{ opacity: 0.7 }}>{v.correo}</span> ·{" "}
              <span style={{ opacity: 0.7 }}>{v.disponibilidad}</span>
              {v.areas.length > 0 && (
                <span style={{ opacity: 0.7 }}> · {v.areas.join(", ")}</span>
              )}
            </summary>
            <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "4px 12px", margin: "12px 0", fontSize: 14 }}>
              <Field k="Correo" v={v.correo} />
              <Field k="Teléfono" v={v.telefono} />
              <Field k="Disponibilidad" v={v.disponibilidad} />
              <Field k="Universidad" v={v.universidad || "No aplica"} />
              <Field k="Carné" v={v.carnet} />
              <Field k="Semestre" v={v.semestre} />
              <Field k="Rango de edad" v={v.edad} />
              <Field k="Áreas de interés" v={v.areas.join(", ")} />
              <Field k="Comentarios" v={v.comentarios} pre />
              <Field k="Evento" v={v.event.title} />
              <Field k="Fecha de postulación" v={fechaHora(v.createdAt)} />
            </dl>
          </details>
          <ConfirmDelete
            compact
            mensaje={`¿Borrar la postulación de voluntario de ${v.nombre}? Esta acción no se puede deshacer.`}
            action={async () => {
              "use server";
              await eliminarVoluntario(v.id);
            }}
          />
        </div>
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
