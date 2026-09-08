import { withAuth } from "next-auth/middleware";

// Segunda barrera para el panel: aunque cada página ya llama a
// requireAdminSession(), esto bloquea de entrada cualquier ruta de
// /admin/dashboard sin sesión válida (por si algún día se agrega una
// página y se olvida el guard). Redirige a /admin/login.
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin/dashboard", "/admin/dashboard/:path*"],
};
