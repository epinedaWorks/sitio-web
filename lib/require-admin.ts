import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

// Úsalo al inicio de cualquier página o server action del panel admin.
// Si no hay sesión, redirige al login en vez de dejar pasar la petición.
// Una cuenta "ESCANEO" (solo escaneo) no ve nada del panel salvo Tomar
// asistencia: cualquier otra página la manda directo ahí, a menos que se
// pase permiteSoloEscaneo (la propia página de escaneo, y "Mi cuenta").
export async function requireAdminSession(opts?: { permiteSoloEscaneo?: boolean }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }
  const role = (session.user as { role?: string } | undefined)?.role;
  if (role === "ESCANEO" && !opts?.permiteSoloEscaneo) {
    redirect("/admin/dashboard/checkin");
  }
  return session;
}

// Solo para lo sensible (usuarios, ajustes de correo): exige rol ADMIN.
// Un EDITOR, VIEWER o ESCANEO con sesión válida se manda de vuelta al panel.
export async function requireAdminRole() {
  const session = await requireAdminSession();
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }
  return session;
}

// Para cualquier acción que cambie datos "de contenido" (eventos, galería,
// ponentes, inscritos, contacto, ajustes...): admite ADMIN y EDITOR, pero no
// VIEWER (solo lectura) ni ESCANEO (solo escaneo). Úsalo en vez de
// requireAdminSession() en toda acción de ese tipo que escriba en la base.
export async function requireEditorSession() {
  const session = await requireAdminSession();
  const role = (session.user as { role?: string } | undefined)?.role;
  if (role === "VIEWER" || role === "ESCANEO") {
    redirect("/admin/dashboard?msg=solo_lectura");
  }
  return session;
}

// Para marcar asistencia en los puestos de escaneo (entrada, proyectos,
// coffee, almuerzo, tarde): admite ADMIN, EDITOR y ESCANEO, pero no VIEWER.
export async function requireScanSession() {
  const session = await requireAdminSession({ permiteSoloEscaneo: true });
  if ((session.user as { role?: string } | undefined)?.role === "VIEWER") {
    redirect("/admin/dashboard?msg=solo_lectura");
  }
  return session;
}
