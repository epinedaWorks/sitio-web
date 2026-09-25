import type { Metadata } from "next";
import { SALAS_INFO, LEYENDA, TOTALES } from "../../agenda-data";
import { COLOR, construirCeldas } from "../../agenda-celdas";
import AgendaMovil from "./AgendaMovil";
import VistaSwitch from "../agenda/VistaSwitch";
import { css } from "../../agenda-movil-css";

// Versión de la agenda pensada para celular: una lista por salón, sin URL en el
// menú y sin indexar (todavía en pruebas).
export const metadata: Metadata = {
  title: "Agenda (móvil) · Python eXposition Day 2026",
  robots: { index: false, follow: false },
};



export default function AgendaMovilPage() {
  const celdas = construirCeldas();

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="section-pad" style={{ paddingTop: 120 }}>
        <div className="container" style={{ maxWidth: 620 }}>
          <span className="eyebrow">Agenda</span>
          <h1 style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)", margin: "16px 0 12px" }}>
            Python eXposition Day 2026
          </h1>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-head)", fontWeight: 700 }}>
            Sábado 3 de octubre de 2026 · UVG
          </p>
          <p style={{ color: "var(--soft)", fontSize: ".92rem" }}>
            {TOTALES}. Sujeto a cambios de último momento.
          </p>

          <VistaSwitch en="movil" />

          <div className="am-legend">
            {LEYENDA.map((l) => (
              <span key={l.tipo}>
                <i style={{ background: COLOR[l.tipo] }} />
                {l.texto}
              </span>
            ))}
          </div>

          <AgendaMovil salas={SALAS_INFO.map(({ id, nombre, aforo }) => ({ id, nombre, aforo }))} celdas={celdas} />

          <p style={{ marginTop: 44 }}>
            <a className="eu-link" href="/#eventos">
              ← Volver a eventos
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
