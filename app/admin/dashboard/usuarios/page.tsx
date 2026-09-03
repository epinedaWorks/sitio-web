import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearUsuario, eliminarUsuario } from "../actions";
import ConfirmDelete from "../ConfirmDelete";

export const dynamic = "force-dynamic";

const MSG: Record<string, [string, string]> = {
  creado: ["✅ Usuario creado.", "#0a7a55"],
  eliminado: ["Usuario eliminado.", "#0a7a55"],
  repetido: ["Ya existe un usuario con ese correo.", "crimson"],
  datos: ["Revisa los datos: correo válido y contraseña de al menos 8 caracteres.", "crimson"],
  propio: ["No puedes eliminar tu propia cuenta.", "crimson"],
  ultimo: ["No puedes eliminar el último usuario.", "crimson"],
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const session = await requireAdminRole();
  const yo = (session.user as { email?: string } | undefined)?.email;
  const usuarios = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  const aviso = searchParams.msg ? MSG[searchParams.msg] : null;

  const input: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: 8,
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Usuarios del panel</h1>
      <p style={{ opacity: 0.75 }}>
        Quién puede entrar a este panel. <b>Admin</b> puede todo (incluye crear usuarios y editar
        los correos). <b>Editor</b> gestiona eventos, galería, ponentes, inscritos y contacto, pero
        no puede tocar usuarios ni la configuración de correo.
      </p>

      {aviso && <p style={{ color: aviso[1], fontWeight: 600 }}>{aviso[0]}</p>}

      <h3 style={{ marginTop: 28 }}>Crear usuario</h3>
      <form action={crearUsuario} style={{ display: "grid", gap: 10, maxWidth: 440 }}>
        <input name="name" placeholder="Nombre" required style={input} />
        <input name="email" type="email" placeholder="Correo" required style={input} />
        <input
          name="password"
          type="password"
          placeholder="Contraseña (mínimo 8)"
          required
          minLength={8}
          style={input}
        />
        <select name="role" defaultValue="EDITOR" style={input}>
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" style={{ ...input, cursor: "pointer", fontWeight: 600 }}>
          Crear usuario
        </button>
      </form>

      <h3 style={{ marginTop: 32 }}>Usuarios ({usuarios.length})</h3>
      {usuarios.map((u) => (
        <div
          key={u.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 8,
            background: "#fff",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{u.name}</b>{" "}
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 999,
                background: u.role === "ADMIN" ? "#d5f5e3" : "#eef",
                color: u.role === "ADMIN" ? "#1b5e20" : "#334",
              }}
            >
              {u.role}
            </span>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {u.email}
              {u.email === yo ? " · tú" : ""}
            </div>
          </div>
          {u.email === yo ? (
            <span style={{ fontSize: 12, opacity: 0.5 }}>—</span>
          ) : (
            <ConfirmDelete
              compact
              label="Eliminar"
              mensaje={`¿Eliminar el acceso de ${u.name} (${u.email})?`}
              action={async () => {
                "use server";
                await eliminarUsuario(u.id);
              }}
            />
          )}
        </div>
      ))}
    </main>
  );
}
