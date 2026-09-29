// Tipos de escaneo del día del evento: cada uno es su propio "puesto" con su
// propio QR (el mismo QR de la persona sirve para los cinco).
export const TIPOS_ESCANEO = ["entrada", "proyectos", "coffee", "almuerzo", "tarde"] as const;
export type TipoEscaneo = (typeof TIPOS_ESCANEO)[number];

export const ETIQUETA_TIPO: Record<TipoEscaneo, string> = {
  entrada: "Entrada",
  proyectos: "Exposición de proyectos",
  coffee: "Coffee break",
  almuerzo: "Almuerzo",
  tarde: "Jornada de la tarde",
};

// Campos de AttendeeRegistration que guardan cada puesto (marca de tiempo y
// quién lo escaneó). Se usa tanto para leer/escribir en /api/admin/checkin
// como para contar en /admin/dashboard/checkin.
export const CAMPOS_ESCANEO: Record<TipoEscaneo, { at: string; by: string }> = {
  entrada: { at: "checkedInAt", by: "checkedInBy" },
  proyectos: { at: "proyectosAt", by: "proyectosBy" },
  coffee: { at: "coffeeAt", by: "coffeeBy" },
  almuerzo: { at: "almuerzoAt", by: "almuerzoBy" },
  tarde: { at: "tardeAt", by: "tardeBy" },
};

// Qué tipos de escaneo puede hacer esta sesión.
// - VIEWER: ninguno (es de solo lectura, ya bloqueado antes de llegar aquí).
// - ADMIN: todos siempre, sin importar lo que diga scanTipos.
// - EDITOR y ESCANEO: los que tenga asignados en scanTipos; una lista vacía
//   significa "sin restricción" (puede escanear todo), para no dejar a nadie
//   sin poder trabajar el día del evento solo por no haberle configurado nada.
export function tiposPermitidos(session: { user?: unknown } | null | undefined): TipoEscaneo[] {
  const user = session?.user as { role?: string; scanTipos?: string[] } | undefined;
  if (!user || user.role === "VIEWER") return [];
  if (user.role === "ADMIN") return [...TIPOS_ESCANEO];
  const propios = (user.scanTipos || []).filter((t): t is TipoEscaneo =>
    (TIPOS_ESCANEO as readonly string[]).includes(t)
  );
  return propios.length ? propios : [...TIPOS_ESCANEO];
}
