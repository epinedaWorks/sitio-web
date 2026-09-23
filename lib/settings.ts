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

// ---- Cupos de los formularios públicos (/admin/dashboard/cupos) ----
export const SETTING_INSCRIPCION_ABIERTA = "inscripcionAbierta";
export const SETTING_INSCRIPCION_MENSAJE = "inscripcionMensaje";
export const SETTING_CHARLA_ABIERTA = "charlaAbierta";
export const SETTING_TALLER_ABIERTA = "tallerAbierta";
export const SETTING_PROYECTO_ABIERTA = "proyectoAbierta";
export const SETTING_MODALIDAD_MENSAJE = "modalidadMensaje";

const MENSAJE_INSCRIPCION_POR_DEFECTO =
  "Ya se llenó el cupo de inscripción para este evento. ¡Gracias por tu interés! Síguenos en redes para enterarte de la próxima edición.";
const MENSAJE_MODALIDAD_POR_DEFECTO = "Ya se llenó el cupo para esta modalidad.";

// Una casilla cerrada guarda "0"; cualquier otra cosa (incluido que nunca se
// haya tocado el ajuste) se trata como abierto — así un formulario nuevo
// empieza disponible sin que haga falta configurar nada primero.
export async function estaAbierto(key: string): Promise<boolean> {
  return (await getSetting(key)) !== "0";
}

export type Cupos = {
  inscripcionAbierta: boolean;
  inscripcionMensaje: string;
  charlaAbierta: boolean;
  tallerAbierta: boolean;
  proyectoAbierta: boolean;
  modalidadMensaje: string;
};

export async function getCupos(): Promise<Cupos> {
  const [inscripcionAbierta, inscripcionMensaje, charlaAbierta, tallerAbierta, proyectoAbierta, modalidadMensaje] =
    await Promise.all([
      estaAbierto(SETTING_INSCRIPCION_ABIERTA),
      getSetting(SETTING_INSCRIPCION_MENSAJE),
      estaAbierto(SETTING_CHARLA_ABIERTA),
      estaAbierto(SETTING_TALLER_ABIERTA),
      estaAbierto(SETTING_PROYECTO_ABIERTA),
      getSetting(SETTING_MODALIDAD_MENSAJE),
    ]);
  return {
    inscripcionAbierta,
    inscripcionMensaje: inscripcionMensaje || MENSAJE_INSCRIPCION_POR_DEFECTO,
    charlaAbierta,
    tallerAbierta,
    proyectoAbierta,
    modalidadMensaje: modalidadMensaje || MENSAJE_MODALIDAD_POR_DEFECTO,
  };
}
