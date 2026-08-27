import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { actualizarEstadoPonente, eliminarPonente } from "../actions";
import ConfirmDelete from "../ConfirmDelete";

export default async function PonentesAdminPage() {
  await requireAdminSession();
  const submissions = await prisma.speakerSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Postulaciones de ponentes</h1>
      <p style={{ opacity: 0.7 }}>{submissions.length} en total. Haz clic en una para ver todos los datos.</p>

      <p>
        <a
          href="/api/admin/export?tipo=ponentes"
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
          ⬇ Descargar CSV (Excel / Google Sheets)
        </a>
      </p>

      {submissions.length === 0 && <p>Aún no hay postulaciones.</p>}

      {submissions.map((s) => (
        <details
          key={s.id}
          style={{ border: "1px solid #ddd", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            {s.nombre} · {s.modalidad}
            {s.nivel ? ` (${s.nivel})` : ""} · <span style={{ opacity: 0.7 }}>{s.tema}</span>
            {"  "}
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 999,
                color:
                  s.status === "ACEPTADA" ? "#1b5e20" : s.status === "RECHAZADA" ? "#8e2a22" : "#8a5a00",
                background:
                  s.status === "ACEPTADA" ? "#d5f5e3" : s.status === "RECHAZADA" ? "#fadbd8" : "#fdebd0",
              }}
            >
              {s.status}
            </span>
          </summary>

          <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "4px 12px", margin: "12px 0", fontSize: 14 }}>
            <Field k="Correo" v={s.correo} />
            <Field k="Teléfono" v={s.telefono} />
            <Field k="Evento" v={s.event.title} />
            <Field k="Modalidad" v={s.modalidad} />
            <Field k="Nivel" v={s.nivel} />
            <Field k="Descripción de la propuesta" v={s.descripcion} pre />
            <Field k="Acerca de (bio)" v={s.bio} pre />
            <Field k="Sigue a la comunidad" v={s.sigueComunidad == null ? null : s.sigueComunidad ? "Sí" : "No"} />
            <Field k="LinkedIn" v={s.linkedin} link />
            <Field k="Instagram" v={s.instagram} />
            <Field k="Empresa" v={s.empresa} />
            <Field k="Cargo" v={s.cargo} />
            <Field k="Edad" v={s.edad?.toString()} />
            <Field k="Foto (URL)" v={s.fotoUrl} link />
            <Field k="¿De otro país?" v={s.pais} />
            <Field k="¿Cómo se enteró?" v={s.comoSeEntero} />
            <Field k="Comentarios" v={s.comentarios} pre />
            <Field k="Autoriza compartir datos con empresas" v={s.compartirDatos ? "Sí" : "No"} />
            <Field k="Recibida" v={s.createdAt.toLocaleString("es-GT")} />
          </dl>

          <div style={{ display: "flex", gap: 8 }}>
            <form
              action={async () => {
                "use server";
                await actualizarEstadoPonente(s.id, "ACEPTADA");
              }}
            >
              <button type="submit">Aceptar</button>
            </form>
            <form
              action={async () => {
                "use server";
                await actualizarEstadoPonente(s.id, "RECHAZADA");
              }}
            >
              <button type="submit">Rechazar</button>
            </form>
            <form
              action={async () => {
                "use server";
                await actualizarEstadoPonente(s.id, "PENDIENTE");
              }}
            >
              <button type="submit">Volver a pendiente</button>
            </form>
            <span style={{ flex: 1 }} />
            <ConfirmDelete
              mensaje={`¿Borrar la postulación de ${s.nombre} ("${s.tema}")? Esta acción no se puede deshacer.`}
              action={async () => {
                "use server";
                await eliminarPonente(s.id);
              }}
            />
          </div>
        </details>
      ))}
    </main>
  );
}

function Field({ k, v, pre, link }: { k: string; v?: string | null; pre?: boolean; link?: boolean }) {
  if (!v) return null;
  return (
    <>
      <dt style={{ fontWeight: 600, opacity: 0.7 }}>{k}</dt>
      <dd style={{ margin: 0, whiteSpace: pre ? "pre-wrap" : "normal" }}>
        {link ? (
          <a href={v} target="_blank" rel="noopener noreferrer">
            {v}
          </a>
        ) : (
          v
        )}
      </dd>
    </>
  );
}
