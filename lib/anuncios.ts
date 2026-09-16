// Utilidades puras (sin acceso a base de datos ni red) para el envío de
// anuncios. Las usa tanto el formulario del panel (cliente) como la acción
// que envía de verdad (servidor) — por eso viven separadas de lib/email.ts,
// que sí toca la base de datos y no se puede importar desde un componente
// de cliente.

export type PersonaAnuncio = { correo: string; nombre: string };

export const ES_CORREO_ANUNCIO = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

// Convierte el texto del campo "¿A qué correos?" en una lista de personas.
// Admite dos formas por entrada, separadas por coma, punto y coma o salto
// de línea:
//   correo@dominio.com
//   Nombre Apellido <correo@dominio.com>   (para probar cómo se ve {{nombre}})
// Si no se da nombre, se usa la parte del correo antes de la @.
export function parseDestinatariosTexto(texto: string): PersonaAnuncio[] {
  return texto
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entrada): PersonaAnuncio | null => {
      const m = entrada.match(/^(.*)<([^<>]+)>\s*$/);
      const correo = (m ? m[2] : entrada).trim();
      if (!ES_CORREO_ANUNCIO(correo)) return null;
      const nombre = (m ? m[1].trim().replace(/^["']|["']$/g, "") : "") || correo.split("@")[0];
      return { correo, nombre };
    })
    .filter((d): d is PersonaAnuncio => d !== null);
}

export function dedupePorCorreo(lista: PersonaAnuncio[]): PersonaAnuncio[] {
  const vistos = new Set<string>();
  return lista.filter((d) => {
    const k = d.correo.toLowerCase();
    if (!d.correo || vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}
