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
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Cupos</h1>
        <p>
          Cierra un formulario (o una modalidad puntual) cuando se llene el cupo. A quien lo abra le
          aparecerá el mensaje que escribas en vez del formulario — no se puede seguir enviando aunque se
          tenga el enlace directo (/inscripcion, /conferencistas).
        </p>
      </div>

      {aviso && <p className="pg-notice pg-notice-ok">{aviso}</p>}

      <form action={guardarCupos} style={{ display: "grid", gap: 20 }}>
        <fieldset className="pg-card" style={{ border: "1px solid #e7e3d8" }}>
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

        <fieldset className="pg-card" style={{ border: "1px solid #e7e3d8" }}>
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
          <button type="submit" className="pg-btn pg-btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </main>
  );
}
