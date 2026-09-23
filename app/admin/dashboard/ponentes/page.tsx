import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { actualizarEstadoPonente, actualizarModalidadPonente, actualizarContactadoPonente, eliminarPonente } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import EstadoPonenteBotones from "../EstadoPonenteBotones";
import ModalidadSelector from "../ModalidadSelector";
import ContactadoToggle from "../ContactadoToggle";
import AceptarRapido from "../AceptarRapido";
import { fechaHora } from "@/lib/fecha";

const MODALIDADES = ["CHARLA", "TALLER", "PROYECTO"] as const;
const ETIQUETA_MODALIDAD: Record<(typeof MODALIDADES)[number], string> = {
  CHARLA: "Charlas",
  TALLER: "Talleres",
  PROYECTO: "Proyectos",
};

export default async function PonentesAdminPage() {
  const session = await requireAdminSession();
  const soloLectura = (session.user as { role?: string } | undefined)?.role === "VIEWER";
  const submissions = await prisma.speakerSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  const porEstado = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0 };
  const porModalidad = Object.fromEntries(
    MODALIDADES.map((m) => [m, { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0 }])
  ) as Record<(typeof MODALIDADES)[number], { PENDIENTE: number; ACEPTADA: number; RECHAZADA: number }>;
  submissions.forEach((s) => {
    porEstado[s.status]++;
    porModalidad[s.modalidad][s.status]++;
  });

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Postulaciones de ponentes</h1>
      <p style={{ opacity: 0.7 }}>{submissions.length} en total. Haz clic en una para ver todos los datos.</p>

      {soloLectura && (
        <p style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, background: "#eee", color: "#555" }}>
          Estás en modo solo lectura: puedes ver todo, pero no aceptar, rechazar, cambiar ni borrar nada.
        </p>
      )}

      {/* Resumen tipo dashboard: cuántas van en cada estado, total y por modalidad */}
      <div
        style={{
          display: "grid",
          gap: 14,
          border: "1px solid #e2e2e2",
          borderRadius: 10,
          padding: "14px 16px",
          margin: "16px 0",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Stat label="Pendientes" valor={porEstado.PENDIENTE} bg="#fdebd0" fg="#8a5a00" />
          <Stat label="Aceptadas" valor={porEstado.ACEPTADA} bg="#d5f5e3" fg="#1b5e20" />
          <Stat label="Rechazadas" valor={porEstado.RECHAZADA} bg="#fadbd8" fg="#8e2a22" />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.65, margin: "0 0 6px", textTransform: "uppercase" }}>
            Por modalidad
          </p>
          <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={cabecera}></th>
                <th style={cabecera}>Pendientes</th>
                <th style={cabecera}>Aceptadas</th>
                <th style={cabecera}>Rechazadas</th>
                <th style={cabecera}>Total</th>
              </tr>
            </thead>
            <tbody>
              {MODALIDADES.map((m) => {
                const c = porModalidad[m];
                const total = c.PENDIENTE + c.ACEPTADA + c.RECHAZADA;
                return (
                  <tr key={m}>
                    <td style={{ ...celda, fontWeight: 600 }}>{ETIQUETA_MODALIDAD[m]}</td>
                    <td style={celda}>{c.PENDIENTE}</td>
                    <td style={celda}>{c.ACEPTADA}</td>
                    <td style={celda}>{c.RECHAZADA}</td>
                    <td style={{ ...celda, fontWeight: 600 }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          ⬇ Descargar Excel
        </a>
        <a href="/api/admin/export?tipo=ponentes&formato=csv" style={{ fontSize: 13 }}>
          o CSV
        </a>
      </p>

      {submissions.length === 0 && <p>Aún no hay postulaciones.</p>}

      {submissions.map((s) => (
        <div
          key={s.id}
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
              {s.contactado && (
                <span
                  style={{
                    fontSize: 12,
                    marginLeft: 6,
                    padding: "2px 8px",
                    borderRadius: 999,
                    color: "#0a4a7a",
                    background: "#dcedfa",
                  }}
                >
                  Contactado
                </span>
              )}
            </summary>

            <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "4px 12px", margin: "12px 0", fontSize: 14 }}>
              <Field k="Correo" v={s.correo} />
              <Field k="Teléfono" v={s.telefono} />
              <Field k="Evento" v={s.event.title} />
              <Field k="Modalidad" v={s.modalidad} />
              <Field k="Nivel" v={s.nivel} />
              <Field k="Descripción de la propuesta" v={s.descripcion} pre />
              <Field k="Acerca de (bio)" v={s.bio} pre />
              <Field k="Integrantes del equipo" v={s.integrantes} pre />
              <Field k="Necesidades / logística" v={s.necesidades} pre />
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
              <Field k="Recibida" v={fechaHora(s.createdAt)} />
            </dl>

            <div style={{ display: "grid", gap: 8 }}>
              <EstadoPonenteBotones id={s.id} estado={s.status} actualizar={actualizarEstadoPonente} />
              <ModalidadSelector id={s.id} modalidad={s.modalidad} actualizar={actualizarModalidadPonente} />
              <ContactadoToggle id={s.id} contactado={s.contactado} actualizar={actualizarContactadoPonente} />
            </div>
          </details>

          <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
            <AceptarRapido id={s.id} estado={s.status} actualizar={actualizarEstadoPonente} />
            <ConfirmDelete
              compact
              mensaje={`¿Borrar la postulación de ${s.nombre} ("${s.tema}")? Esta acción no se puede deshacer.`}
              action={async () => {
                "use server";
                await eliminarPonente(s.id);
              }}
            />
          </div>
        </div>
      ))}
    </main>
  );
}

function Stat({ label, valor, bg, fg }: { label: string; valor: number; bg: string; fg: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 10,
        background: bg,
        color: fg,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700 }}>{valor}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

const cabecera: React.CSSProperties = {
  textAlign: "left",
  padding: "3px 12px 3px 0",
  fontWeight: 600,
  opacity: 0.6,
  fontSize: 12,
};
const celda: React.CSSProperties = { padding: "3px 12px 3px 0" };

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
