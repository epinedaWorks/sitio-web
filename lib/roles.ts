// Roles del panel admin. Archivo sin "use client": lo pueden importar tanto
// componentes de servidor (páginas) como de cliente (selectores) por igual.
export type Rol = "ADMIN" | "EDITOR" | "VIEWER" | "ESCANEO";

export const ETIQUETAS: Record<Rol, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Solo lectura",
  ESCANEO: "Solo escaneo",
};
