"use client";

import { useRouter, usePathname } from "next/navigation";

// Dropdown para filtrar una lista de admin (inscritos, ponentes, voluntarios,
// check-in) a un solo evento, vía el query param ?evento=<id>. "todos" lo
// quita de la URL y muestra todo junto, como antes.
export default function SelectorEvento({
  eventos,
  valor,
}: {
  eventos: { id: string; title: string }[];
  valor: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label style={{ fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>
      Evento:
      <select
        value={valor}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v === "todos" ? pathname : `${pathname}?evento=${v}`);
        }}
        style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
      >
        <option value="todos">Todos los eventos</option>
        {eventos.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>
    </label>
  );
}
