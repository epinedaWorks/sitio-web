import { requireAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { crearUsuario, eliminarUsuario, actualizarRolUsuario, actualizarScanTiposUsuario } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import RolSelector from "../RolSelector";
import { ETIQUETAS } from "@/lib/roles";
import ScanTiposSelector from "../ScanTiposSelector";

export const dynamic = "force-dynamic";

const MSG: Record<string, [string, string]> = {
  creado: ["✅ Usuario creado.", "#0a7a55"],
  eliminado: ["Usuario eliminado.", "#0a7a55"],
  repetido: ["Ya existe un usuario con ese correo.", "crimson"],
  datos: ["Revisa los datos: correo válido y contraseña de al menos 8 caracteres.", "crimson"],
  propio: ["No puedes eliminar tu propia cuenta.", "crimson"],
  ultimo: ["No puedes eliminar el último usuario.", "crimson"],
  propiorol: ["No puedes cambiar tu propio rol — pídeselo a otro Admin.", "crimson"],
  ultimoadmin: ["No puedes quitarle Admin al último administrador que queda.", "crimson"],
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

  return (
    <main className="pg-content-narrow">
      <div className="pg-head">
        <h1>Usuarios</h1>
        <p>
          Quién puede entrar a este panel. <b>Admin</b> puede todo (incluye crear usuarios y editar los
          correos). <b>Editor</b> gestiona eventos, galería, ponentes, inscritos y contacto, pero no puede
          tocar usuarios ni la configuración de correo. <b>Solo lectura</b> entra y ve todo igual, pero no
          puede crear, cambiar ni borrar nada — ideal para alguien que solo necesita consultar (dar
          seguimiento, revisar datos) sin riesgo de tocar algo por accidente. <b>Solo escaneo</b> es para
          el equipo que solo va a tomar asistencia el día del evento: al entrar va directo a "Tomar
          asistencia" y no ve ninguna otra sección del panel. Además, a cada <b>Editor</b> o{" "}
          <b>Solo escaneo</b> le puedes marcar qué puestos puede trabajar (entrada, exposición de
          proyectos, coffee break, almuerzo o jornada de la tarde) — sin marcar ninguno, puede escanear
          los cinco.
        </p>
      </div>

      {aviso && (
        <p className={`pg-notice ${aviso[1] === "crimson" ? "pg-notice-err" : "pg-notice-ok"}`}>{aviso[0]}</p>
      )}

      <h3 style={{ marginTop: 28, fontSize: 16 }}>Crear usuario</h3>
      <form action={crearUsuario} className="pg-card" style={{ display: "grid", gap: 10, maxWidth: 440 }}>
        <input name="name" placeholder="Nombre" required />
        <input name="email" type="email" placeholder="Correo" required />
        <input name="password" type="password" placeholder="Contraseña (mínimo 8)" required minLength={8} />
        <select name="role" defaultValue="EDITOR">
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
          <option value="VIEWER">Solo lectura</option>
          <option value="ESCANEO">Solo escaneo</option>
        </select>
        <button type="submit" className="pg-btn pg-btn-primary" style={{ justifySelf: "start" }}>
          Crear usuario
        </button>
      </form>

      <h3 style={{ marginTop: 32, fontSize: 16 }}>Usuarios ({usuarios.length})</h3>
      {usuarios.map((u) => (
        <div
          key={u.id}
          className="pg-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{u.name}</b>{" "}
            {u.email === yo ? (
              <span
                className={`pg-badge ${
                  u.role === "ADMIN" ? "pg-badge-success" : u.role === "VIEWER" || u.role === "ESCANEO" ? "pg-badge-neutral" : "pg-badge-info"
                }`}
              >
                {ETIQUETAS[u.role]}
              </span>
            ) : (
              <RolSelector id={u.id} rol={u.role} actualizar={actualizarRolUsuario} />
            )}
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {u.email}
              {u.email === yo ? " · tú" : ""}
            </div>
            {(u.role === "EDITOR" || u.role === "ESCANEO") && (
              <div style={{ marginTop: 6 }}>
                <ScanTiposSelector id={u.id} tipos={u.scanTipos} actualizar={actualizarScanTiposUsuario} />
              </div>
            )}
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
