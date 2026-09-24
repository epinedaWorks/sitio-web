"use client";

import { useState } from "react";

const OPCIONES = [
  { id: "todo", texto: "Por salón" },
  { id: "charla", texto: "Charlas" },
  { id: "taller", texto: "Talleres" },
  { id: "ambas", texto: "Ambas" },
];

// Resalta en la cuadrícula solo lo que interesa (el resto se atenúa).
export default function FiltroTipo() {
  const [activo, setActivo] = useState("todo");
  const elegir = (id: string) => {
    setActivo(id);
    const g = document.getElementById("ag-grid");
    if (!g) return;
    if (id === "todo") g.removeAttribute("data-filtro");
    else g.setAttribute("data-filtro", id);
  };
  return (
    <div className="ag-filtro" role="group" aria-label="Filtrar por tipo">
      {OPCIONES.map((o) => (
        <button key={o.id} className={o.id === activo ? "on" : ""} onClick={() => elegir(o.id)}>
          {o.texto}
        </button>
      ))}
    </div>
  );
}
