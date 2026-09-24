import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda · Python eXposition Day 2026",
  description:
    "Agenda del Python eXposition Day 2026 de la Comunidad Python Guatemala: charlas, talleres y exposición de proyectos.",
};

// Página provisional: la agenda (horarios, salones, charlas) se agrega después.
export default function AgendaPage() {
  return (
    <main>
      <section className="section-pad" style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Agenda</span>
            <h1 style={{ fontSize: "clamp(2rem, 4.4vw, 3.3rem)", margin: "18px 0 14px" }}>
              Python eXposition Day 2026
            </h1>
            <p style={{ color: "var(--soft)" }}>
              Estamos armando el programa del día. Muy pronto vas a encontrar aquí los horarios,
              charlas, talleres y proyectos.
            </p>
            <p style={{ marginTop: 24 }}>
              <a className="eu-link" href="/#eventos">
                ← Volver a eventos
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
