import { requireAdminSession } from "@/lib/require-admin";
import { cambiarPassword } from "../actions";

const MSG: Record<string, [string, string]> = {
  ok: ["✅ Contraseña actualizada. Úsala la próxima vez que inicies sesión.", "#0a7a55"],
  malactual: ["La contraseña actual no es correcta.", "crimson"],
  nocoincide: ["La nueva contraseña y su confirmación no coinciden.", "crimson"],
  corta: ["La nueva contraseña debe tener al menos 8 caracteres.", "crimson"],
  error: ["No se pudo actualizar. Intenta de nuevo.", "crimson"],
};

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const session = await requireAdminSession();
  const aviso = searchParams.msg ? MSG[searchParams.msg] : null;

  const input: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: 8,
  };

  return (
    <main style={{ maxWidth: 460, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Mi cuenta</h1>
      <p style={{ opacity: 0.7 }}>Sesión iniciada como {session.user?.email}</p>

      <h3 style={{ marginTop: 28 }}>Cambiar contraseña</h3>
      {aviso && (
        <p style={{ color: aviso[1], fontWeight: 600, margin: "8px 0 4px" }}>{aviso[0]}</p>
      )}
      <form action={cambiarPassword} style={{ display: "grid", gap: 12, marginTop: 8 }}>
        <input
          type="password"
          name="actual"
          placeholder="Contraseña actual"
          required
          autoComplete="current-password"
          style={input}
        />
        <input
          type="password"
          name="nueva"
          placeholder="Nueva contraseña (mínimo 8 caracteres)"
          required
          minLength={8}
          autoComplete="new-password"
          style={input}
        />
        <input
          type="password"
          name="confirmar"
          placeholder="Repite la nueva contraseña"
          required
          minLength={8}
          autoComplete="new-password"
          style={input}
        />
        <button type="submit" style={{ ...input, cursor: "pointer", fontWeight: 600 }}>
          Guardar nueva contraseña
        </button>
      </form>
    </main>
  );
}
