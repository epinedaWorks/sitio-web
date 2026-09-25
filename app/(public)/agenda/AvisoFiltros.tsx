"use client";

import { useEffect, useState } from "react";

const CLAVE = "agenda-aviso-filtros";

// Aviso para que se note que la agenda se puede filtrar. Se cierra con la X o
// en cuanto se toca cualquiera de los botones, y no vuelve a salir en ese navegador.
export default function AvisoFiltros({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let visto = false;
    try {
      visto = window.localStorage.getItem(CLAVE) === "1";
    } catch {}
    if (!visto) setVisible(true);

    const alTocar = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest(".am-barra, .ag-filtro")) cerrar();
    };
    document.addEventListener("click", alTocar);
    return () => document.removeEventListener("click", alTocar);
  }, []);

  function cerrar() {
    setVisible(false);
    try {
      window.localStorage.setItem(CLAVE, "1");
    } catch {}
  }

  if (!visible) return null;
  return (
    <div className="ag-aviso" role="note">
      <span className="ag-aviso-flecha" aria-hidden="true">
        ↓
      </span>
      <span>{texto}</span>
      <button onClick={cerrar} aria-label="Cerrar aviso">
        ✕
      </button>
    </div>
  );
}
