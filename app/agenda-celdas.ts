// Datos de la agenda ya armados como celdas por sala (los usan /agenda y /agendamovil).
import { APERTURA, MATUTINA, ALMUERZO, VESPERTINA, CIERRE, SALAS_INFO, type Bloque, type Sesion, type Tipo } from "./agenda-data";

export const min = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
};

export const COLOR: Record<Tipo, string> = {
  charla: "#5aa9ff",
  taller: "#2fd39b",
  expo: "#ff9a5a",
  receso: "#ffc23c",
  logistica: "rgba(255,255,255,0.38)",
  pendiente: "rgba(255,255,255,0.28)",
};
export const FONDO: Record<Tipo, string> = {
  charla: "rgba(90,169,255,.13)",
  taller: "rgba(47,211,155,.13)",
  expo: "rgba(255,154,90,.14)",
  receso: "rgba(255,194,60,.13)",
  logistica: "transparent",
  pendiente: "transparent",
};

export type Celda = {
  col: number; // 2..5 = una sala; 0 = todas las salas
  inicio: number;
  fin: number;
  colFin?: number; // columna final (exclusiva) si abarca varias salas
  tipo: Tipo;
  titulo: string;
  ponente?: string;
  nivel?: string;
  nota?: string;
  horario?: string; // horario real de talleres y exposición
  relleno?: boolean;
};

export function construirCeldas(): Celda[] {
  const celdas: Celda[] = [];
  const bloques: Bloque[] = [...APERTURA, ...ALMUERZO, ...CIERRE];
  bloques.forEach((b) =>
    celdas.push({
      col: b.soloSalones ? 3 : 0,
      colFin: b.soloSalones ? 6 : undefined,
      inicio: min(b.inicio),
      fin: min(b.fin),
      tipo: b.tipo,
      titulo: b.titulo,
      nota: b.nota,
      horario: b.tipo === "receso" ? `${b.inicio} - ${b.fin}` : undefined,
    })
  );

  // Cada sala con sus sesiones (mañana + tarde) en orden.
  const salas = SALAS_INFO.map((_, i) =>
    [...MATUTINA[i].sesiones, ...VESPERTINA[i].sesiones].sort((a, b) => min(a.inicio) - min(b.inicio))
  );

  // Las charlas y talleres absorben las preguntas, el cambio de speaker y el ordenado del salón: cada una llega
  // hasta donde empieza lo siguiente (otra sesión de la sala o un bloque común).
  const esCharla = (s: Sesion) => s.tipo === "charla" || s.tipo === "pendiente";
  const comunes = bloques.map((x) => min(x.inicio));

  salas.forEach((sesiones, i) => {
    const col = i + 2;
    const inicios = [...sesiones.map((x) => min(x.inicio)), ...comunes];
    sesiones.forEach((s) => {
      const siguiente = Math.min(...inicios.filter((t) => t >= min(s.fin)), Infinity);
      celdas.push({
        col,
        inicio: min(s.inicio),
        fin: (esCharla(s) || s.tipo === "taller") && siguiente !== Infinity ? siguiente : min(s.fin),
        tipo: s.tipo,
        titulo: s.titulo,
        ponente: s.ponente,
        nivel: s.nivel,
        nota: s.nota,
        horario: s.tipo === "taller" || s.tipo === "expo" ? `${s.inicio} - ${s.fin}` : undefined,
        relleno: s.tipo === "logistica",
      });
    });
  });
  return celdas;
}


export const hh = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
