import type { Metadata } from "next";
import {
  APERTURA,
  MATUTINA,
  ALMUERZO,
  VESPERTINA,
  CIERRE,
  SALAS_INFO,
  LEYENDA,
  TOTALES,
  type Bloque,
  type Sesion,
  type Tipo,
} from "../../agenda-data";
import FiltroTipo from "./FiltroTipo";
import { min, COLOR, FONDO, construirCeldas, hh, type Celda } from "../../agenda-celdas";

export const metadata: Metadata = {
  title: "Agenda · Python eXposition Day 2026",
  description:
    "Agenda del Python eXposition Day 2026 (sábado 3 de octubre, UVG): charlas, talleres y exposición de proyectos por sala y horario.",
};

// ---- Cuadrícula horaria --------------------------------------------------
// Cada fila de la cuadrícula son 5 minutos; cada sesión ocupa exactamente las
// filas de su duración (como celdas combinadas), así todo queda alineado
// vertical (mismo horario = misma altura) y horizontalmente (una columna por sala).
const PASO = 5; // minutos por fila
const UNIDAD = 21; // px por fila
const css = `
.ag-legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:22px;font-size:.85rem;color:var(--soft)}
.ag-legend span{display:inline-flex;align-items:center;gap:7px}
.ag-dot{width:10px;height:10px;border-radius:3px;display:inline-block}
.ag-scroll{margin-top:6px;overflow-x:auto;padding-bottom:8px}
@media (min-width:1100px){.ag-scroll{overflow:visible}}
.ag-grid{display:grid;grid-template-columns:104px repeat(4,minmax(215px,1fr));gap:0 8px;min-width:1020px}
.ag-head{text-align:center;padding:10px 12px;margin-bottom:6px;border-radius:10px;background:rgba(10,19,16,.92);border:1px solid var(--line)}
.ag-head.ag-fijo{position:sticky;top:126px;z-index:6;align-self:start;height:58px;margin:0;padding:8px 12px;box-sizing:border-box;background:rgba(10,19,16,.97)}
.ag-head b{display:block;font-size:.95rem}
.ag-head small{color:var(--dim);font-size:.75rem}
.ag-tick{font-variant-numeric:tabular-nums;font-size:.72rem;font-weight:700;color:var(--gold);border-top:1px solid var(--line);line-height:1;display:flex;align-items:center;white-space:nowrap;overflow:hidden}
.ag-linea{border-top:1px solid rgba(255,255,255,.06);pointer-events:none}
.ag-cell{position:relative;margin:1px 0;padding:6px 10px;border-radius:9px;border:1px solid var(--line);border-left-width:4px;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:2px;min-height:0}
.ag-cell .ag-h{font-variant-numeric:tabular-nums;font-size:.7rem;font-weight:700;color:var(--gold)}
.ag-cell .ag-t{font-weight:600;font-size:.86rem;line-height:1.25}
.ag-cell .ag-p{color:var(--soft);font-size:.78rem}
.ag-cell .ag-n{color:var(--dim);font-size:.72rem}
.ag-filtro{position:sticky;top:74px;z-index:8;display:grid;grid-template-columns:repeat(4,minmax(0,118px));gap:6px;margin-top:26px;padding:8px 0;height:52px;box-sizing:border-box;background:rgba(9,15,13,.94);backdrop-filter:blur(8px)}
.ag-filtro button{font:inherit;font-size:.78rem;font-weight:700;padding:8px 2px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--dim);cursor:pointer}
.ag-filtro button.on{color:var(--gold);border-color:var(--gold)}
.ag-cell{transition:opacity .2s}
.ag-grid[data-filtro="charla"] .ag-cell:not([data-tipo="charla"]):not([data-tipo="pendiente"]):not(.ag-todas),
.ag-grid[data-filtro="taller"] .ag-cell:not([data-tipo="taller"]):not(.ag-todas),
.ag-grid[data-filtro="ambas"] .ag-cell:not([data-tipo="charla"]):not([data-tipo="pendiente"]):not([data-tipo="taller"]):not(.ag-todas){opacity:.16}
.ag-tag{display:inline-block;font-size:.62rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:1px 7px;border-radius:999px;margin-right:6px;background:rgba(255,255,255,.08);vertical-align:1px}
.ag-cell.ag-todas{align-items:center;text-align:center;flex-direction:row;justify-content:center;gap:12px;flex-wrap:wrap}
.ag-cell.ag-conh{flex-direction:column;gap:2px}
.ag-cell.ag-todas .ag-t{font-size:.92rem}
.ag-cell.ag-relleno{background:transparent;border-left-width:1px;padding:0 10px;flex-direction:row;align-items:center;gap:8px}
.ag-cell.ag-relleno .ag-t{font-weight:500;font-size:.72rem;color:var(--dim)}
.ag-cell.ag-pend{border-style:dashed}
.ag-cell.ag-pend .ag-t{color:var(--dim);font-style:italic}
.ag-cell.ag-corta{flex-direction:row;align-items:center;gap:8px;padding-top:0;padding-bottom:0}
.ag-cell.ag-corta .ag-t{font-size:.78rem}
`;


export default function AgendaPage() {
  const celdas = construirCeldas();
  const T0 = Math.min(...celdas.map((c) => c.inicio)); // 07:30
  const T1 = Math.max(...celdas.map((c) => c.fin)); // 16:30
  const filas = (T1 - T0) / PASO;
  // Hasta las 09:00 todo ocurre en el Auditorio (un solo encabezado arriba);
  // entre "Instrucciones" y las charlas se intercala la fila con los
  // encabezados de cada salón, y de ahí en adelante ya hay una columna por sala.
  const CORTE = min("09:00");
  const antes = (CORTE - T0) / PASO;
  const base = (m: number) => (m - T0) / PASO + 2; // fila 1 = encabezado del Auditorio
  const fila = (m: number) => base(m) + (m >= CORTE ? 1 : 0); // inicio de una celda
  const filaFin = (m: number) => base(m) + (m > CORTE ? 1 : 0); // fin (exclusivo)

  // Eje de horas: un tramo entre cada par de horarios consecutivos (inicio o fin
  // de cualquier sesión), para que cada etiqueta quede alineada con lo que abre y cierra.
  const cortes = Array.from(new Set(celdas.flatMap((c) => [c.inicio, c.fin]))).sort((a, b) => a - b);
  const tramos = cortes.slice(0, -1).map((a, i) => [a, cortes[i + 1]] as const);

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="section-pad" style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Agenda</span>
            <h1 style={{ fontSize: "clamp(2rem, 4.4vw, 3.3rem)", margin: "18px 0 14px" }}>
              Python eXposition Day 2026
            </h1>
            <p style={{ color: "var(--gold)", fontFamily: "var(--font-head)", fontWeight: 700 }}>
              Sábado 3 de octubre de 2026 · Universidad del Valle de Guatemala (UVG)
            </p>
            <p style={{ color: "var(--soft)" }}>
              {TOTALES}, repartidos en cuatro salas. Sujeto a cambios de último momento.
            </p>
            <div className="ag-legend">
              {LEYENDA.map((l) => (
                <span key={l.tipo}>
                  <i className="ag-dot" style={{ background: COLOR[l.tipo] }} />
                  {l.texto}
                </span>
              ))}
            </div>
          </div>

          <FiltroTipo />
          <div className="ag-scroll">
            <div
              className="ag-grid"
              id="ag-grid"
              style={{ gridTemplateRows: `auto repeat(${antes}, ${UNIDAD}px) 64px repeat(${filas - antes}, ${UNIDAD}px)` }}
              role="table"
              aria-label="Agenda por sala y horario"
            >
              {/* Encabezado único del Auditorio: registro, bienvenida y keynote */}
              <div />
              <div className="ag-head" style={{ gridColumn: "2 / 6", gridRow: 1 }}>
                <b>{SALAS_INFO[0].nombre}</b>
                <small>{SALAS_INFO[0].aforo} · Registro, bienvenida y keynote para todos</small>
              </div>

              {/* Encabezados de cada salón, justo después de "Instrucciones y movimiento a salones" */}
              {SALAS_INFO.map((s, i) => (
                <div
                  key={s.id}
                  className="ag-head ag-fijo"
                  style={{ gridColumn: i + 2, gridRow: `${antes + 2} / -1` }}
                >
                  <b>{s.nombre}</b>
                  <small>{s.aforo}</small>
                </div>
              ))}

              {/* Eje de horas: cada tramo con su inicio y fin */}
              {tramos.map(([a, b]) => (
                <div
                  key={`t${a}`}
                  className="ag-tick"
                  style={{ gridColumn: 1, gridRow: `${fila(a)} / ${filaFin(b)}` }}
                >
                  {hh(a)} - {hh(b)}
                </div>
              ))}

              {/* Sesiones, bloques comunes y huecos */}
              {celdas.map((c, i) => {
                const dur = (c.fin) - c.inicio;
                const corta = dur <= 15 || c.relleno;
                const clases = [
                  "ag-cell",
                  c.col === 0 || c.colFin ? "ag-todas" : "",
                  c.col === 0 && c.horario ? "ag-conh" : "",
                  c.relleno ? "ag-relleno" : "",
                  c.tipo === "pendiente" ? "ag-pend" : "",
                  !c.relleno && c.col !== 0 && dur <= 20 ? "ag-corta" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={i}
                    className={clases}
                    data-tipo={c.tipo}
                    style={{
                      gridColumn: c.col === 0 ? "2 / 6" : c.colFin ? `${c.col} / ${c.colFin}` : c.col,
                      gridRow: `${fila(c.inicio)} / ${filaFin(c.fin)}`,
                      borderLeftColor: COLOR[c.tipo],
                      background: FONDO[c.tipo],
                    }}
                  >
                    <div className="ag-t">
                      {(c.tipo === "charla" || c.tipo === "taller") && !corta && c.col !== 0 && (
                        <span className="ag-tag" style={{ color: COLOR[c.tipo] }}>
                          {c.tipo}
                        </span>
                      )}
                      {c.tipo === "expo" && (
                        <span className="ag-tag" style={{ color: COLOR.expo }}>
                          proyectos
                        </span>
                      )}
                      {c.titulo}
                    </div>
                    {c.ponente && <div className="ag-p">{c.ponente}</div>}
                    {(c.nivel || c.nota || c.horario) && !corta && (
                      <div className="ag-n">
                        {c.nivel && <div>Nivel: {c.nivel}</div>}
                        {c.horario && <div>Horario: {c.horario}</div>}
                        {c.nota && <div>{c.nota}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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
