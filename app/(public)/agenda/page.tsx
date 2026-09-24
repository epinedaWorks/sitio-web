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
const min = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
};

const COLOR: Record<Tipo, string> = {
  charla: "#5aa9ff",
  taller: "#2fd39b",
  expo: "#ff9a5a",
  receso: "#ffc23c",
  logistica: "rgba(255,255,255,0.38)",
  pendiente: "rgba(255,255,255,0.28)",
};
const FONDO: Record<Tipo, string> = {
  charla: "rgba(90,169,255,.13)",
  taller: "rgba(47,211,155,.13)",
  expo: "rgba(255,154,90,.14)",
  receso: "rgba(255,194,60,.13)",
  logistica: "transparent",
  pendiente: "transparent",
};

type Celda = {
  col: number; // 2..5 = una sala; 0 = todas las salas
  inicio: number;
  fin: number;
  colFin?: number; // columna final (exclusiva) si abarca varias salas
  tipo: Tipo;
  titulo: string;
  ponente?: string;
  nivel?: string;
  nota?: string;
  horario?: string; // horario real de talleres y exposición
  relleno?: boolean;
};

function construirCeldas(): Celda[] {
  const celdas: Celda[] = [];
  const bloques: Bloque[] = [...APERTURA, ...ALMUERZO, ...CIERRE];
  bloques.forEach((b) =>
    celdas.push({
      col: b.soloSalones ? 3 : 0,
      colFin: b.soloSalones ? 6 : undefined,
      inicio: min(b.inicio),
      fin: min(b.fin),
      tipo: b.tipo,
      titulo: b.titulo,
      nota: b.nota,
      horario: b.tipo === "receso" ? `${b.inicio} - ${b.fin}` : undefined,
    })
  );

  // Cada sala con sus sesiones (mañana + tarde) en orden.
  const salas = SALAS_INFO.map((_, i) =>
    [...MATUTINA[i].sesiones, ...VESPERTINA[i].sesiones].sort((a, b) => min(a.inicio) - min(b.inicio))
  );

  // Las charlas y talleres absorben las preguntas, el cambio de speaker y el ordenado del salón: cada una llega
  // hasta donde empieza lo siguiente (otra sesión de la sala o un bloque común).
  const esCharla = (s: Sesion) => s.tipo === "charla" || s.tipo === "pendiente";
  const comunes = bloques.map((x) => min(x.inicio));

  salas.forEach((sesiones, i) => {
    const col = i + 2;
    const inicios = [...sesiones.map((x) => min(x.inicio)), ...comunes];
    sesiones.forEach((s) => {
      const siguiente = Math.min(...inicios.filter((t) => t >= min(s.fin)), Infinity);
      celdas.push({
        col,
        inicio: min(s.inicio),
        fin: (esCharla(s) || s.tipo === "taller") && siguiente !== Infinity ? siguiente : min(s.fin),
        tipo: s.tipo,
        titulo: s.titulo,
        ponente: s.ponente,
        nivel: s.nivel,
        nota: s.nota,
        horario: s.tipo === "taller" || s.tipo === "expo" ? `${s.inicio} - ${s.fin}` : undefined,
        relleno: s.tipo === "logistica",
      });
    });
  });
  return celdas;
}

const css = `
.ag-legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:22px;font-size:.85rem;color:var(--soft)}
.ag-legend span{display:inline-flex;align-items:center;gap:7px}
.ag-dot{width:10px;height:10px;border-radius:3px;display:inline-block}
.ag-scroll{margin-top:34px;overflow-x:auto;padding-bottom:8px}
.ag-grid{display:grid;grid-template-columns:104px repeat(4,minmax(215px,1fr));gap:0 8px;min-width:1020px}
.ag-head{text-align:center;padding:10px 12px;margin-bottom:6px;border-radius:10px;background:rgba(10,19,16,.92);border:1px solid var(--line)}
.ag-head b{display:block;font-size:.95rem}
.ag-head small{color:var(--dim);font-size:.75rem}
.ag-tick{font-variant-numeric:tabular-nums;font-size:.72rem;font-weight:700;color:var(--gold);border-top:1px solid var(--line);line-height:1;padding-top:4px;white-space:nowrap;overflow:hidden}
.ag-linea{border-top:1px solid rgba(255,255,255,.06);pointer-events:none}
.ag-cell{position:relative;margin:1px 0;padding:6px 10px;border-radius:9px;border:1px solid var(--line);border-left-width:4px;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:2px;min-height:0}
.ag-cell .ag-h{font-variant-numeric:tabular-nums;font-size:.7rem;font-weight:700;color:var(--gold)}
.ag-cell .ag-t{font-weight:600;font-size:.86rem;line-height:1.25}
.ag-cell .ag-p{color:var(--soft);font-size:.78rem}
.ag-cell .ag-n{color:var(--dim);font-size:.72rem}
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

const hh = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

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

          <div className="ag-scroll">
            <div
              className="ag-grid"
              style={{ gridTemplateRows: `auto repeat(${antes}, ${UNIDAD}px) auto repeat(${filas - antes}, ${UNIDAD}px)` }}
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
                  className="ag-head"
                  style={{ gridColumn: i + 2, gridRow: antes + 2, margin: "6px 0" }}
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
