import type { Metadata } from "next";
import { SALAS_INFO, LEYENDA, TOTALES } from "../../agenda-data";
import { COLOR, construirCeldas } from "../../agenda-celdas";
import AgendaMovil from "./AgendaMovil";

// Versión de la agenda pensada para celular: una lista por salón, sin URL en el
// menú y sin indexar (todavía en pruebas).
export const metadata: Metadata = {
  title: "Agenda (móvil) · Python eXposition Day 2026",
  robots: { index: false, follow: false },
};

const css = `
.am-barra{position:sticky;top:64px;z-index:20;margin:22px -4px 0;padding:8px 4px;background:rgba(9,15,13,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:grid;gap:6px}
.am-vista{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.am-vista button{font:inherit;font-size:.74rem;font-weight:700;padding:8px 2px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--dim);cursor:pointer}
.am-vista button.on{color:var(--gold);border-color:var(--gold)}
.am-sala{margin-top:4px;font-size:.74rem;font-weight:700;color:var(--gold)}
.am-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.am-tabs button{font:inherit;font-size:.82rem;font-weight:700;padding:11px 4px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--soft);cursor:pointer}
.am-tabs button.on{background:var(--gold);border-color:var(--gold);color:#1a1200}
.am-head{margin:22px 0 12px;scroll-margin-top:190px}
.am-head h2{font-size:1.3rem;margin:0 0 2px}
.am-head small{color:var(--dim);font-size:.8rem}
.am-aviso{margin:8px 0 0;font-size:.8rem;color:var(--soft)}
.am-jornada{margin:14px 0 2px;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
.am-next{display:flex;margin-top:22px}
.am-next button{font:inherit;font-weight:700;font-size:.85rem;padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--soft);cursor:pointer}
.am-list{display:grid;gap:8px}
.am-item{display:grid;grid-template-columns:62px 1fr;gap:10px;align-items:stretch}
.am-hora{font-variant-numeric:tabular-nums;font-size:.74rem;font-weight:700;color:var(--gold);line-height:1.35;padding-top:12px;text-align:right}
.am-card{border:1px solid var(--line);border-left-width:4px;border-radius:10px;padding:10px 12px;min-width:0}
.am-card .t{font-weight:600;font-size:.92rem;line-height:1.3;overflow-wrap:anywhere}
.am-card .p{color:var(--soft);font-size:.82rem;margin-top:3px}
.am-card .n{color:var(--dim);font-size:.76rem;margin-top:3px}
.am-tag{display:inline-block;font-size:.62rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:1px 7px;border-radius:999px;margin-right:6px;background:rgba(255,255,255,.08);vertical-align:1px}
.am-card.pend{border-style:dashed}
.am-card.pend .t{color:var(--dim);font-style:italic}
.am-card.suave .t{font-weight:500;font-size:.85rem;color:var(--soft)}
.am-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:16px;font-size:.78rem;color:var(--soft)}
.am-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px}
`;

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
