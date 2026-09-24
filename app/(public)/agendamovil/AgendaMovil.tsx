"use client";

import { useEffect, useState } from "react";
import { COLOR, FONDO, hh, type Celda } from "../../agenda-celdas";

type Sala = { id: string; nombre: string; aforo: string };

// Agenda para celular: un selector de salón fijo arriba y, debajo, solo la
// lista de ese salón (con lo que es para todos ya incluido).
export default function AgendaMovil({ salas, celdas }: { salas: Sala[]; celdas: Celda[] }) {
  const [activa, setActiva] = useState(0);
  const [vista, setVista] = useState<"salon" | "charla" | "taller" | "ambas">("salon");

  // Deja el salón elegido en la URL (#salon-a) para poder compartirlo.
  useEffect(() => {
    const i = salas.findIndex((s) => `#${s.id}` === window.location.hash);
    if (i >= 0) setActiva(i);
  }, [salas]);

  const elegir = (i: number) => {
    setActiva(i);
    try {
      window.history.replaceState(null, "", `#${salas[i].id}`);
    } catch {}
    window.scrollTo({ top: (document.getElementById("am-lista")?.offsetTop ?? 0) - 190, behavior: "smooth" });
  };

  const col = activa + 2;
  const esCharla = (c: Celda) => c.tipo === "charla" || c.tipo === "pendiente";
  const porSalon = vista === "salon";
  const lista = celdas
    .filter((c) => {
      if (porSalon) return c.col === col || c.col === 0 || (!!c.colFin && col >= c.col && col < c.colFin);
      if (c.col < 2) return false;
      return vista === "charla" ? esCharla(c) : vista === "taller" ? c.tipo === "taller" : esCharla(c) || c.tipo === "taller";
    })
    .sort((a, b) => a.inicio - b.inicio || a.col - b.col);

  const tarde = 14 * 60;
  const manana = 9 * 60;
  const sala = salas[activa];

  return (
    <>
      <div className="am-barra">
        <div className="am-vista" role="group" aria-label="Ver por">
          {(
            [
              ["salon", "Por salón"],
              ["charla", "Charlas"],
              ["taller", "Talleres"],
              ["ambas", "Ambas"],
            ] as const
          ).map(([id, texto]) => (
            <button key={id} className={vista === id ? "on" : ""} onClick={() => setVista(id)}>
              {texto}
            </button>
          ))}
        </div>
        {porSalon && (
          <div className="am-tabs" role="tablist" aria-label="Salón">
            {salas.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === activa}
                className={i === activa ? "on" : ""}
                onClick={() => elegir(i)}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      <div id="am-lista" className="am-head">
        <h2>
          {porSalon
            ? sala.nombre
            : vista === "charla"
              ? "Todas las charlas"
              : vista === "taller"
                ? "Todos los talleres"
                : "Charlas y talleres"}
        </h2>
        <small>{porSalon ? sala.aforo : "De todos los salones, en orden de hora"}</small>
        {porSalon && activa !== 0 && <p className="am-aviso">Hasta las 09:00 todos estamos juntos en el Auditorio.</p>}
      </div>

      <div className="am-list">
        {lista.map((c, k) => {
          const prev = lista[k - 1];
          const titulo = !porSalon
            ? null
            : c.inicio >= tarde && (!prev || prev.inicio < tarde)
              ? "Jornada vespertina"
              : c.inicio >= manana && (!prev || prev.inicio < manana)
                ? "Jornada matutina"
                : null;
          return (
            <div key={k} style={{ display: "contents" }}>
              {titulo && <div className="am-jornada">{titulo}</div>}
              <div className="am-item">
                <div className="am-hora">
                  {hh(c.inicio)}
                  <br />
                  {hh(c.fin)}
                </div>
                <div
                  className={["am-card", c.tipo === "pendiente" ? "pend" : "", c.tipo === "logistica" ? "suave" : ""].join(" ")}
                  style={{ borderLeftColor: COLOR[c.tipo], background: FONDO[c.tipo] }}
                >
                  <div className="t">
                    {(c.tipo === "charla" || c.tipo === "taller") && (
                      <span className="am-tag" style={{ color: COLOR[c.tipo] }}>
                        {c.tipo}
                      </span>
                    )}
                    {c.tipo === "expo" && (
                      <span className="am-tag" style={{ color: COLOR.expo }}>
                        proyectos
                      </span>
                    )}
                    {c.titulo}
                  </div>
                  {!porSalon && <div className="am-sala">{salas[c.col - 2]?.nombre}</div>}
                  {c.ponente && <div className="p">{c.ponente}</div>}
                  {(c.nivel || c.horario || c.nota) && (
                    <div className="n">
                      {c.nivel && <div>Nivel: {c.nivel}</div>}
                      {c.horario && <div>Horario: {c.horario}</div>}
                      {c.nota && <div>{c.nota}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="am-next">
        {porSalon && activa > 0 && <button onClick={() => elegir(activa - 1)}>← {salas[activa - 1].nombre}</button>}
        {porSalon && activa < salas.length - 1 && (
          <button style={{ marginLeft: "auto" }} onClick={() => elegir(activa + 1)}>
            {salas[activa + 1].nombre} →
          </button>
        )}
      </div>
    </>
  );
}
