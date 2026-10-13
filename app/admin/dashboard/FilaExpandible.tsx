"use client";

import { useState } from "react";

// Una fila de tabla que se puede expandir para ver el detalle completo de la
// persona (todos los campos del formulario) sin salir de la lista. La usan
// Inscritos, Ponentes y Voluntarios — cada quien arma sus propias celdas de
// "resumen" y su propio bloque de "detalle".
export default function FilaExpandible({
  resumen,
  detalle,
  colSpan,
  destacada,
  buscar,
}: {
  resumen: React.ReactNode;
  detalle: React.ReactNode;
  colSpan: number;
  destacada?: boolean;
  buscar?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <tr className={destacada ? "is-done" : undefined} data-buscar={buscar}>
        <td style={{ width: 26, padding: "10px 0 10px 14px" }}>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? "Ocultar detalle" : "Ver detalle"}
            style={{
              background: "none",
              border: "1px solid #d8d4c8",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              width: 22,
              height: 22,
              lineHeight: 1,
              padding: 0,
            }}
          >
            {abierto ? "▾" : "▸"}
          </button>
        </td>
        {resumen}
      </tr>
      {abierto && (
        <tr>
          <td colSpan={colSpan} style={{ background: "#fbfaf6", padding: "14px 20px", borderTop: "1px solid #efece3" }}>
            {detalle}
          </td>
        </tr>
      )}
    </>
  );
}
