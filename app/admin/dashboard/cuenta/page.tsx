import { requireAdminSession } from "@/lib/require-admin";
import { cambiarPassword } from "../actions";

const MSG: Record<string, [string, boolean]> = {
  ok: ["✅ Contraseña actualizada. Úsala la próxima vez que inicies sesión.", true],
  malactual: ["La contraseña actual no es correcta.", false],
  nocoincide: ["La nueva contraseña y su confirmación no coinciden.", false],
  corta: ["La nueva contraseña debe tener al menos 8 caracteres.", false],
  error: ["No se pudo actualizar. Intenta de nuevo.", false],
};

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const session = await requireAdminSession({ permiteSoloEscaneo: true });
  const aviso = searchParams.msg ? MSG[searchParams.msg] : null;

  return (
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Mi cuenta</h1>
        <p>Sesión iniciada como {session.user?.email}</p>
      </div>

      <h3 style={{ fontSize: 16 }}>Cambiar contraseña</h3>
      {aviso && <p className={`pg-notice ${aviso[1] ? "pg-notice-ok" : "pg-notice-err"}`}>{aviso[0]}</p>}
      <form action={cambiarPassword} className="pg-card" style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <input type="password" name="actual" placeholder="Contraseña actual" required autoComplete="current-password" />
        <input
          type="password"
          name="nueva"
          placeholder="Nueva contraseña (mínimo 8 caracteres)"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <input
          type="password"
          name="confirmar"
          placeholder="Repite la nueva contraseña"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <button type="submit" className="pg-btn pg-btn-primary" style={{ justifySelf: "start" }}>
          Guardar nueva contraseña
        </button>
      </form>
    </main>
  );
}
