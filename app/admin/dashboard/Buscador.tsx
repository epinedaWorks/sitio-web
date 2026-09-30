"use client";

import { useState } from "react";

function quitarAcentos(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Caja de búsqueda simple: filtra, en el propio navegador y sin recargar la
// página, cualquier elemento que tenga data-buscar="texto en minúsculas".
// No toca el servidor ni las acciones de cada fila — solo muestra/oculta.
export default function Buscador({
  selector,
  placeholder = "Buscar…",
}: {
  selector: string;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [visibles, setVisibles] = useState<number | null>(null);

  function filtrar(valor: string) {
    setQ(valor);
    // Sin acentos ni mayúsculas: buscar "diaz" también encuentra "Díaz".
    const texto = quitarAcentos(valor.trim().toLowerCase());
    const items = document.querySelectorAll<HTMLElement>(selector);
    let n = 0;
    items.forEach((el) => {
      const coincide = !texto || quitarAcentos(el.dataset.buscar || "").includes(texto);
      el.style.display = coincide ? "" : "none";
      if (coincide) n++;
    });
    setVisibles(texto ? n : null);
  }

  return (
    <div style={{ margin: "14px 0 20px" }}>
      <input
        value={q}
        onChange={(e) => filtrar(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "10px 14px",
          fontSize: 15,
          border: "1px solid #ccc",
          borderRadius: 10,
          boxSizing: "border-box",
        }}
      />
      {visibles !== null && (
        <p style={{ fontSize: 13, opacity: 0.7, margin: "6px 0 0" }}>
          {visibles} resultado{visibles === 1 ? "" : "s"} ·{" "}
          <button
            type="button"
            onClick={() => filtrar("")}
            style={{ border: 0, background: "none", color: "#159d68", cursor: "pointer", padding: 0, font: "inherit" }}
          >
            limpiar
          </button>
        </p>
      )}
    </div>
  );
}
