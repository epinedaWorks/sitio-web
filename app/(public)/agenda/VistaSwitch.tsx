"use client";

import { useEffect, useState } from "react";

// Interruptor "Computadora / Celular" para elegir cómo ver la agenda.
// - En /agenda ("auto"): muestra la vista que corresponde al ancho de pantalla;
//   "Celular" lleva a /agendamovil y "Computadora" fuerza la tabla completa.
// - En /agendamovil ("movil"): "Computadora" lleva de vuelta a /agenda.
export default function VistaSwitch({ en }: { en: "auto" | "movil" }) {
  const [v, setV] = useState<"pc" | "cel">(en === "movil" ? "cel" : "pc");

  useEffect(() => {
    if (en === "movil") return;
    const mq = window.matchMedia("(max-width: 1099px)");
    const html = document.documentElement;
    const actualizar = () => setV(mq.matches && !html.classList.contains("ag-fuerza-pc") ? "cel" : "pc");
    if (window.location.hash === "#escritorio") html.classList.add("ag-fuerza-pc");
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => {
      mq.removeEventListener("change", actualizar);
      html.classList.remove("ag-fuerza-pc");
    };
  }, [en]);

  function elegir(destino: "pc" | "cel") {
    if (destino === v) return;
    if (destino === "cel") {
      window.location.href = "/agendamovil";
    } else if (en === "movil") {
      window.location.href = "/agenda#escritorio";
    } else {
      document.documentElement.classList.add("ag-fuerza-pc");
      window.history.replaceState(null, "", "#escritorio");
      setV("pc");
    }
  }

  return (
    <div className="ag-sw-fila">
      <span>Ver la agenda en:</span>
      <div className="ag-sw" data-v={v} role="group" aria-label="Vista de la agenda">
        <button className={v === "pc" ? "on" : ""} aria-pressed={v === "pc"} onClick={() => elegir("pc")}>
          🖥 Computadora
        </button>
        <button className={v === "cel" ? "on" : ""} aria-pressed={v === "cel"} onClick={() => elegir("cel")}>
          📱 Celular
        </button>
      </div>
    </div>
  );
}
