import { requireAdminRole } from "@/lib/require-admin";
import { getCupos } from "@/lib/settings";
import { guardarCupos } from "../actions";

const MENSAJES: Record<string, string> = {
  ok: "Guardado. Ya está en vivo en el sitio.",
};

export default async function CuposPage({
  searchParams,
}: {
  searchParams?: { msg?: string };
}) {
  await requireAdminRole();
  const cupos = await getCupos();
  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Cupos de los formularios</h1>
      <p style={{ opacity: 0.75, fontSize: 14 }}>
        Cierra un formulario (o una modalidad puntual) cuando se llene el cupo. A quien lo abra le
        aparecerá el mensaje que escribas en vez del formulario — no se puede seguir enviando aunque se
        tenga el enlace directo (/inscripcion, /conferencistas).
      </p>

      {aviso && (
        <p style={{ padding: "8px 12px", borderRadius: 8, fontSize: 14, background: "#d5f5e3", color: "#1b5e20" }}>
          {aviso}
        </p>
      )}

      <form action={guardarCupos} style={{ display: "grid", gap: 20, marginTop: 20 }}>
        <fieldset style={{ border: "1px solid #e2e2e2", borderRadius: 10, padding: 16 }}>
          <legend style={{ fontWeight: 700, padding: "0 6px" }}>Inscripción de asistentes</legend>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="inscripcionAbierta" defaultChecked={cupos.inscripcionAbierta} />
            Formulario abierto
          </label>
          <label style={{ display: "block", fontSize: 13, marginTop: 12 }}>
            Mensaje cuando esté cerrado
            <textarea
              name="inscripcionMensaje"
              defaultValue={cupos.inscripcionMensaje}
              rows={3}
              style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
        </fieldset>

        <fieldset style={{ border: "1px solid #e2e2e2", borderRadius: 10, padding: 16 }}>
          <legend style={{ fontWeight: 700, padding: "0 6px" }}>Postulaciones de ponentes, por modalidad</legend>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="charlaAbierta" defaultChecked={cupos.charlaAbierta} />
              Charlas / conferencias
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="tallerAbierta" defaultChecked={cupos.tallerAbierta} />
              Talleres
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="proyectoAbierta" defaultChecked={cupos.proyectoAbierta} />
              Exposición de proyectos
            </label>
          </div>
          <label style={{ display: "block", fontSize: 13, marginTop: 14 }}>
            Mensaje para una modalidad cerrada
            <textarea
              name="modalidadMensaje"
              defaultValue={cupos.modalidadMensaje}
              rows={2}
              style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>
            Si cierras una sola modalidad, sigue apareciendo en el formulario pero no se puede elegir
            ("cupo lleno"). Si cierras las tres, el formulario completo de ponentes muestra este mensaje
            en vez de los campos.
          </p>
        </fieldset>

        <div>
          <button type="submit" style={{ fontWeight: 700, padding: "8px 16px" }}>
            Guardar
          </button>
        </div>
      </form>
    </main>
  );
}
