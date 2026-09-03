import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

// Úsalo al inicio de cualquier página o server action del panel admin.
// Si no hay sesión, redirige al login en vez de dejar pasar la petición.
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

// Solo para lo sensible (usuarios, ajustes de correo): exige rol ADMIN.
// Un EDITOR con sesión válida se manda de vuelta al panel.
export async function requireAdminRole() {
  const session = await requireAdminSession();
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }
  return session;
}
