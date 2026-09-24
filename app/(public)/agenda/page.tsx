import type { Metadata } from "next";
import {
  APERTURA,
  MATUTINA,
  ALMUERZO,
  VESPERTINA,
  CIERRE,
  LEYENDA,
  TOTALES,
  type Bloque,
  type Sala,
  type Sesion,
  type Tipo,
} from "../../agenda-data";

export const metadata: Metadata = {
  title: "Agenda · Python eXposition Day 2026",
  description:
    "Agenda del Python eXposition Day 2026 (sábado 3 de octubre, UVG): charlas, talleres y exposición de proyectos por sala y horario.",
};

const COLOR: Record<Tipo, string> = {
  charla: "#5aa9ff",
  taller: "#2fd39b",
  expo: "#ff9a5a",
  receso: "#ffc23c",
  logistica: "rgba(255,255,255,0.35)",
  pendiente: "rgba(255,255,255,0.2)",
};

const css = `
.ag-wrap{display:grid;gap:44px;margin-top:34px}
.ag-fase h2{font-size:1.25rem;margin:0 0 4px}
.ag-fase .ag-sub{color:var(--dim);font-size:.9rem;margin:0 0 16px}
.ag-legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:22px;font-size:.85rem;color:var(--soft)}
.ag-legend span{display:inline-flex;align-items:center;gap:7px}
.ag-dot{width:10px;height:10px;border-radius:3px;display:inline-block}
.ag-bloques{display:grid;gap:8px}
.ag-bloque{display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;padding:11px 16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-left-width:4px}
.ag-hora{font-variant-numeric:tabular-nums;font-weight:700;font-size:.88rem;color:var(--gold);min-width:104px}
.ag-bloque b{font-weight:600}
.ag-nota{color:var(--dim);font-size:.85rem}
.ag-salas{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px;align-items:start}
.ag-sala h3{font-size:1rem;margin:0 0 2px}
.ag-sala .ag-aforo{color:var(--dim);font-size:.78rem;margin:0 0 12px}
.ag-cards{display:grid;gap:10px}
.ag-card{padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.045);border:1px solid var(--line);border-left-width:4px}
.ag-card .ag-hora{min-width:0;display:block;font-size:.8rem;margin-bottom:4px}
.ag-card .ag-titulo{font-weight:600;line-height:1.3;font-size:.95rem}
.ag-card .ag-ponente{color:var(--soft);font-size:.86rem;margin-top:5px}
.ag-tag{display:inline-block;font-size:.68rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-right:6px;background:rgba(255,255,255,.08)}
.ag-card.ag-menor{background:transparent;border-style:dashed;padding:9px 14px}
.ag-card.ag-menor .ag-titulo{font-weight:500;font-size:.88rem;color:var(--soft)}
.ag-card.ag-pend .ag-titulo{color:var(--dim);font-style:italic}
`;

function Horas({ inicio, fin }: { inicio: string; fin: string }) {
  return (
    <span className="ag-hora">
      {inicio} – {fin}
    </span>
  );
}

function FilaBloque({ b }: { b: Bloque }) {
  return (
    <div className="ag-bloque" style={{ borderLeftColor: COLOR[b.tipo] }}>
      <Horas inicio={b.inicio} fin={b.fin} />
      <b>{b.titulo}</b>
      {b.nota && <span className="ag-nota">{b.nota}</span>}
    </div>
  );
}

function Tarjeta({ s }: { s: Sesion }) {
  const menor = s.tipo === "receso" || s.tipo === "logistica";
  return (
    <div
      className={`ag-card${menor ? " ag-menor" : ""}${s.tipo === "pendiente" ? " ag-pend" : ""}`}
      style={{ borderLeftColor: COLOR[s.tipo] }}
    >
      <Horas inicio={s.inicio} fin={s.fin} />
      <div className="ag-titulo">
        {(s.tipo === "charla" || s.tipo === "taller") && (
          <span className="ag-tag" style={{ color: COLOR[s.tipo] }}>
            {s.tipo}
          </span>
        )}
        {s.tipo === "expo" && (
          <span className="ag-tag" style={{ color: COLOR.expo }}>
            proyectos
          </span>
        )}
        {s.titulo}
      </div>
      {s.ponente && <div className="ag-ponente">{s.ponente}</div>}
      {(s.nivel || s.nota) && (
        <div className="ag-nota" style={{ marginTop: 4 }}>
          {s.nivel && <>Nivel: {s.nivel}</>}
          {s.nivel && s.nota && " · "}
          {s.nota}
        </div>
      )}
    </div>
  );
}

function Salas({ salas }: { salas: Sala[] }) {
  return (
    <div className="ag-salas">
      {salas.map((sala) => (
        <div className="ag-sala" key={sala.id}>
          <h3>{sala.nombre}</h3>
          <p className="ag-aforo">{sala.aforo}</p>
          <div className="ag-cards">
            {sala.sesiones.map((s) => (
              <Tarjeta key={s.inicio + s.titulo} s={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgendaPage() {
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

          <div className="ag-wrap">
            <div className="ag-fase">
              <h2>Apertura</h2>
              <p className="ag-sub">Todo el público junto, en el auditorio</p>
              <div className="ag-bloques">
                {APERTURA.map((b) => (
                  <FilaBloque key={b.inicio} b={b} />
                ))}
              </div>
            </div>

            <div className="ag-fase">
              <h2>Jornada matutina</h2>
              <p className="ag-sub">09:00 – 12:45 · elige la sala que más te interese</p>
              <Salas salas={MATUTINA} />
            </div>

            <div className="ag-fase">
              <h2>Almuerzo</h2>
              <div className="ag-bloques" style={{ marginTop: 12 }}>
                {ALMUERZO.map((b) => (
                  <FilaBloque key={b.inicio} b={b} />
                ))}
              </div>
            </div>

            <div className="ag-fase">
              <h2>Jornada vespertina</h2>
              <p className="ag-sub">14:00 – 15:50</p>
              <Salas salas={VESPERTINA} />
            </div>

            <div className="ag-fase">
              <h2>Cierre</h2>
              <p className="ag-sub">De vuelta en el auditorio</p>
              <div className="ag-bloques">
                {CIERRE.map((b) => (
                  <FilaBloque key={b.inicio} b={b} />
                ))}
              </div>
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
