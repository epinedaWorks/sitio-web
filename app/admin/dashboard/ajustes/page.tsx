import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { SETTING_TEAM_EMAIL, SETTING_EMAIL_BCC } from "@/lib/settings";
import { guardarAjustes } from "../actions";

export const dynamic = "force-dynamic";

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  await requireAdminRole();

  const rows = await prisma.setting.findMany({
    where: { key: { in: [SETTING_TEAM_EMAIL, SETTING_EMAIL_BCC] } },
  });
  const get = (k: string) => rows.find((r) => r.key === k)?.value ?? "";

  const teamGuardado = get(SETTING_TEAM_EMAIL);
  const bccGuardado = get(SETTING_EMAIL_BCC);
  const team = teamGuardado || process.env.TEAM_EMAIL || "";
  const bcc = bccGuardado || process.env.EMAIL_BCC || "";

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: 8,
  };

  return (
    <main style={{ maxWidth: 620, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Ajustes de correo</h1>
      <p style={{ opacity: 0.75 }}>
        Aquí decides a qué correos llegan los avisos de inscripciones, ponentes y
        contacto. Los cambios se aplican en unos segundos, sin volver a publicar.
      </p>

      {searchParams.msg === "ok" && (
        <p style={{ color: "#0a7a55", fontWeight: 600 }}>✅ Ajustes guardados.</p>
      )}

      <form action={guardarAjustes} style={{ display: "grid", gap: 18, marginTop: 16 }}>
        <div>
          <label htmlFor="teamEmail" style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
            Correos del equipo
          </label>
          <textarea
            id="teamEmail"
            name="teamEmail"
            rows={2}
            defaultValue={team}
            placeholder="uno@correo.com, otro@correo.com"
            style={input}
          />
          <small style={{ opacity: 0.7 }}>
            Reciben cada aviso (van en el campo “Para”, se ven entre sí). Varios separados por coma.
            {!teamGuardado && " Ahora mismo se está usando el valor de la variable de entorno."}
          </small>
        </div>

        <div>
          <label htmlFor="emailBcc" style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
            Copia oculta (CCO) — opcional
          </label>
          <textarea
            id="emailBcc"
            name="emailBcc"
            rows={2}
            defaultValue={bcc}
            placeholder="archivo@correo.com"
            style={input}
          />
          <small style={{ opacity: 0.7 }}>
            Reciben copia oculta de <b>todos</b> los correos que manda el sitio (incluidas las
            confirmaciones a las personas). Déjalo vacío para desactivarlo.
          </small>
        </div>

        <button type="submit" style={{ ...input, width: "auto", cursor: "pointer", fontWeight: 600 }}>
          Guardar
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 13, opacity: 0.7 }}>
        El remitente (<code>{process.env.EMAIL_FROM || "no-reply@pythonguatemala.dev"}</code>) sigue
        configurándose en las variables de entorno porque depende del dominio verificado en Resend.
      </p>
    </main>
  );
}
