"use client";

export default function ConfirmDelete({
  action,
  mensaje,
  label = "Borrar registro",
  compact = false,
}: {
  action: () => Promise<void>;
  mensaje: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <form
      action={action}
      // stopPropagation: sirve dentro de <summary> para no expandir la fila al borrar
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      <button
        type="submit"
        title={label}
        style={{
          background: "#c0392b",
          color: "#fff",
          border: 0,
          borderRadius: 6,
          padding: compact ? "3px 9px" : "6px 12px",
          cursor: "pointer",
          fontSize: compact ? 12 : 13,
        }}
      >
        {compact ? "🗑 Borrar" : label}
      </button>
    </form>
  );
}
