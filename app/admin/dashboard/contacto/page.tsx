import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { eliminarContacto, marcarContacto } from "../actions";
import ConfirmDelete from "../ConfirmDelete";

export default async function ContactoAdminPage() {
  await requireAdminSession();
  const mensajes = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const pendientes = mensajes.filter((m) => !m.atendido).length;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Mensajes de contacto</h1>
      <p style={{ opacity: 0.75 }}>
        {mensajes.length} en total · {pendientes} sin atender
      </p>

      <p style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a
          href="/api/admin/export?tipo=contacto"
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
        <a href="/api/admin/export?tipo=contacto&formato=csv" style={{ fontSize: 13 }}>
          o CSV
        </a>
      </p>

      {mensajes.length === 0 && <p>Aún no hay mensajes.</p>}

      {mensajes.map((m) => (
        <div
          key={m.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10,
            background: m.atendido ? "#f3f3f3" : "#fff",
          }}
        >
          <details style={{ flex: 1, minWidth: 0 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {m.nombre} · <span style={{ opacity: 0.7 }}>{m.correo}</span>
              {"  "}
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "#fdebd0",
                  color: "#8a5a00",
                }}
              >
                {m.asunto}
              </span>
              {m.atendido && (
                <span style={{ fontSize: 12, marginLeft: 6, opacity: 0.6 }}>· atendido</span>
              )}
            </summary>
            <dl style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "4px 12px", margin: "12px 0", fontSize: 14 }}>
              <Field k="Correo" v={m.correo} />
              <Field k="Organización" v={m.organizacion} />
              <Field k="Asunto" v={m.asunto} />
              <Field k="Recibido" v={m.createdAt.toLocaleString("es-GT")} />
            </dl>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Mensaje:</p>
            <p style={{ fontSize: 14, whiteSpace: "pre-wrap", marginTop: 0 }}>{m.mensaje}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <form
                action={async () => {
                  "use server";
                  await marcarContacto(m.id, !m.atendido);
                }}
              >
                <button type="submit">{m.atendido ? "Marcar sin atender" : "Marcar atendido"}</button>
              </form>
            </div>
          </details>
          <ConfirmDelete
            compact
            mensaje={`¿Borrar el mensaje de ${m.nombre}? Esta acción no se puede deshacer.`}
            action={async () => {
              "use server";
              await eliminarContacto(m.id);
            }}
          />
        </div>
      ))}
    </main>
  );
}

function Field({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null;
  return (
    <>
      <dt style={{ fontWeight: 600, opacity: 0.7 }}>{k}</dt>
      <dd style={{ margin: 0 }}>{v}</dd>
    </>
  );
}
