import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getEventoActivoSlug } from "@/lib/settings";
import { guardarCupos } from "../actions";
import SelectorEvento from "../SelectorEvento";

const MENSAJES: Record<string, string> = {
  ok: "Guardado. Ya está en vivo en el sitio.",
};

export default async function CuposPage({
  searchParams,
}: {
  searchParams?: { msg?: string; evento?: string };
}) {
  await requireAdminRole();

  const eventos = await prisma.event.findMany({ orderBy: { date: "desc" }, select: { id: true, slug: true, title: true } });
  if (eventos.length === 0) {
    return (
      <main className="pg-content-narrow">
        <div className="pg-head">
          <h1>Cupos</h1>
        </div>
        <p className="pg-card" style={{ opacity: 0.7 }}>
          Primero crea un evento en <a href="/admin/dashboard/eventos">Eventos</a>.
        </p>
      </main>
    );
  }

  const eventoActivoSlug = await getEventoActivoSlug();
  const eventoActivoId = eventos.find((e) => e.slug === eventoActivoSlug)?.id;
  const eventoSel = searchParams?.evento ?? eventoActivoId ?? eventos[0].id;
  const evento = await prisma.event.findUniqueOrThrow({ where: { id: eventoSel } });
  const aviso = searchParams?.msg ? MENSAJES[searchParams.msg] : null;

  return (
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Cupos</h1>
        <p>
          Cada evento tiene sus propios cupos. Cierra un formulario (o una modalidad puntual) cuando se
          llene el cupo de ese evento — a quien lo abra le aparecerá el mensaje que escribas en vez del
          formulario, aunque tenga el enlace directo. Al activar un evento nuevo, sus cupos empiezan
          abiertos, sin heredar lo que hayas cerrado en ediciones pasadas.
        </p>
      </div>

      <p style={{ margin: "0 0 18px" }}>
        <SelectorEvento eventos={eventos} valor={eventoSel} />
      </p>

      {aviso && <p className="pg-notice pg-notice-ok">{aviso}</p>}

      <form action={guardarCupos} style={{ display: "grid", gap: 20 }}>
        <input type="hidden" name="eventId" value={evento.id} />
        <fieldset className="pg-card" style={{ border: "1px solid #e7e3d8" }}>
          <legend style={{ fontWeight: 700, padding: "0 6px" }}>Inscripción de asistentes</legend>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="inscripcionAbierta" defaultChecked={evento.inscripcionAbierta} />
            Formulario abierto
          </label>
          <label style={{ display: "block", fontSize: 13, marginTop: 12 }}>
            Mensaje cuando esté cerrado
            <textarea
              name="inscripcionMensaje"
              defaultValue={evento.inscripcionMensaje}
              rows={3}
              style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
        </fieldset>

        <fieldset className="pg-card" style={{ border: "1px solid #e7e3d8" }}>
          <legend style={{ fontWeight: 700, padding: "0 6px" }}>Postulaciones de ponentes, por modalidad</legend>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="charlaAbierta" defaultChecked={evento.charlaAbierta} />
              Charlas / conferencias
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="tallerAbierta" defaultChecked={evento.tallerAbierta} />
              Talleres
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="proyectoAbierta" defaultChecked={evento.proyectoAbierta} />
              Exposición de proyectos
            </label>
          </div>
          <label style={{ display: "block", fontSize: 13, marginTop: 14 }}>
            Mensaje para una modalidad cerrada
            <textarea
              name="modalidadMensaje"
              defaultValue={evento.modalidadMensaje}
              rows={2}
              style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            />
          </label>
          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>
            Si cierras una sola modalidad, sigue apareciendo en el formulario pero no se puede elegir
            ("cupo lleno"). Si cierras las tres, el formulario completo de ponentes muestra este mensaje
            en vez de los campos. Si un evento no va a tener alguna modalidad (por ejemplo, sin exposición
            de proyectos), ciérrala aquí para ese evento.
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
