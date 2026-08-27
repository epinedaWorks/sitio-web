"use client";

export default function ConfirmDelete({
  action,
  mensaje,
  label = "Borrar registro",
}: {
  action: () => Promise<void>;
  mensaje: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      <button
        type="submit"
        style={{
          background: "#c0392b",
          color: "#fff",
          border: 0,
          borderRadius: 6,
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        {label}
      </button>
    </form>
  );
}
