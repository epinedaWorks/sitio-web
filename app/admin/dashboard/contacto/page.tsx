import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { eliminarContacto, marcarContacto } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import { fechaHora } from "@/lib/fecha";

export default async function ContactoAdminPage() {
  const session = await requireAdminSession();
  const soloLectura = (session.user as { role?: string } | undefined)?.role === "VIEWER";
  const mensajes = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const pendientes = mensajes.filter((m) => !m.atendido).length;

  return (
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Contacto</h1>
        <p>Mensajes recibidos desde el formulario de contacto del sitio.</p>
      </div>

      <div className="pg-stats" style={{ marginBottom: 18 }}>
        <div className="pg-stat">
          <span className="n">{mensajes.length}</span>
          <span className="l">Total</span>
        </div>
        <div className="pg-stat">
          <span className="n">{pendientes}</span>
          <span className="l">Sin atender</span>
        </div>
      </div>

      {soloLectura && (
        <p className="pg-notice pg-notice-info">
          Estás en modo solo lectura: puedes ver todo, pero no marcar como atendido ni borrar nada.
        </p>
      )}

      <p style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <a className="pg-btn pg-btn-primary pg-btn-sm" href="/api/admin/export?tipo=contacto">
          ⬇ Excel
        </a>
        <a className="pg-btn pg-btn-ghost pg-btn-sm" href="/api/admin/export?tipo=contacto&formato=csv">
          CSV
        </a>
      </p>

      {mensajes.length === 0 && (
        <p className="pg-card" style={{ opacity: 0.7 }}>
          Aún no hay mensajes.
        </p>
      )}

      {mensajes.map((m) => (
        <div
          key={m.id}
          className="pg-card"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 10,
            background: m.atendido ? "#faf9f5" : "#fff",
          }}
        >
          <details style={{ flex: 1, minWidth: 0 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {m.nombre} · <span style={{ opacity: 0.7, fontWeight: 400 }}>{m.correo}</span>{" "}
              <span className="pg-badge pg-badge-warn">{m.asunto}</span>
              {m.atendido && <span className="pg-badge pg-badge-success" style={{ marginLeft: 6 }}>atendido</span>}
            </summary>
            <dl style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "4px 12px", margin: "12px 0", fontSize: 14 }}>
              <Field k="Correo" v={m.correo} />
              <Field k="Organización" v={m.organizacion} />
              <Field k="Asunto" v={m.asunto} />
              <Field k="Recibido" v={fechaHora(m.createdAt)} />
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
                <button type="submit" className="pg-btn pg-btn-ghost pg-btn-sm">
                  {m.atendido ? "Marcar sin atender" : "Marcar atendido"}
                </button>
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
