import { prisma } from "./prisma";

// Ajustes editables desde /admin/dashboard/ajustes, con la variable de entorno
// como respaldo si aún no se ha guardado nada en la base de datos.
// Cache corto para no consultar la BD en cada correo.
const cache = new Map<string, { v: string | null; t: number }>();
const TTL_MS = 30_000;

export async function getSetting(key: string): Promise<string | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL_MS) return hit.v;
  let v: string | null = null;
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    v = row?.value ?? null;
  } catch {
    v = null;
  }
  cache.set(key, { v, t: Date.now() });
  return v;
}

export function invalidarSettingsCache() {
  cache.clear();
}

// Devuelve la lista de correos de un ajuste ("a@x.com, b@y.com" -> [...]),
// usando el valor guardado o, si no hay, el de la variable de entorno.
export async function getListaCorreos(key: string, envFallback?: string): Promise<string[]> {
  const raw = (await getSetting(key)) ?? envFallback ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Claves usadas
export const SETTING_TEAM_EMAIL = "teamEmail";
export const SETTING_EMAIL_BCC = "emailBcc";

// Evento al que apuntan los formularios públicos (inscripción, ponentes,
// voluntarios) y el check-in — se cambia desde /admin/dashboard/eventos al
// crear una edición nueva, sin tocar código ni variables de entorno.
export const SETTING_EVENTO_ACTIVO = "eventoActivo";

export async function getEventoActivoSlug(): Promise<string | null> {
  return getSetting(SETTING_EVENTO_ACTIVO);
}

// El evento activo completo (no solo el slug) — lo usan la portada pública y
// el panel para mostrar su nombre/fecha/lugar sin tenerlos escritos en código.
export async function getEventoActivo() {
  const slug = await getEventoActivoSlug();
  if (!slug) return null;
  return prisma.event.findUnique({ where: { slug } });
}

// ---- Cupos de los formularios públicos — uno por evento (/admin/dashboard/cupos) ----
// Viven como columnas en Event (ver prisma/schema.prisma), no en Setting: un
// cupo cerrado es una propiedad del evento, no un valor global que se
// arrastraría de una edición a la siguiente.
export type Cupos = {
  inscripcionAbierta: boolean;
  inscripcionMensaje: string;
  charlaAbierta: boolean;
  tallerAbierta: boolean;
  proyectoAbierta: boolean;
  modalidadMensaje: string;
};

export function cuposDeEvento(e: Cupos): Cupos {
  return {
    inscripcionAbierta: e.inscripcionAbierta,
    inscripcionMensaje: e.inscripcionMensaje,
    charlaAbierta: e.charlaAbierta,
    tallerAbierta: e.tallerAbierta,
    proyectoAbierta: e.proyectoAbierta,
    modalidadMensaje: e.modalidadMensaje,
  };
}
