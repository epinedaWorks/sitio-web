// Agenda del Python eXposition Day 2026 (sábado 3 de octubre · UVG).
// Fuente: "Agenda Final.xlsx". Para cambiar algo del programa, edita este archivo.

export type Tipo = "charla" | "taller" | "expo" | "receso" | "logistica" | "pendiente";
export type Nivel = "Básico" | "Intermedio" | "Avanzado";

export type Sesion = {
  inicio: string;
  fin: string;
  tipo: Tipo;
  titulo: string;
  ponente?: string;
  nivel?: Nivel;
  nota?: string;
};

export type Sala = { id: string; nombre: string; aforo: string; sesiones: Sesion[] };

// Momentos en los que todo el evento va junto (una sola fila para todas las salas).
export type Bloque = { inicio: string; fin: string; tipo: Tipo; titulo: string; nota?: string; soloSalones?: boolean };

export const SALAS_INFO = [
  { id: "auditorio", nombre: "Auditorio", aforo: "150 personas" },
  { id: "a", nombre: "Salón A", aforo: "30 personas" },
  { id: "b", nombre: "Salón B", aforo: "30 personas" },
  { id: "c", nombre: "Salón C", aforo: "30 personas" },
] as const;

export const APERTURA: Bloque[] = [
  { inicio: "07:30", fin: "08:00", tipo: "logistica", titulo: "Registro" },
  { inicio: "08:00", fin: "08:20", tipo: "logistica", titulo: "Bienvenida por la Comunidad Python" },
  { inicio: "08:20", fin: "08:50", tipo: "charla", titulo: "Charla Keynote" },
  {
    inicio: "08:50",
    fin: "09:00",
    tipo: "logistica",
    titulo: "Instrucciones y movimiento a salones",
    nota: "Salones, baños y salidas de emergencia.",
  },
];

export const MATUTINA: Sala[] = [
  {
    ...SALAS_INFO[0],
    sesiones: [
      { inicio: "09:00", fin: "09:30", tipo: "charla", titulo: "PyCon US 2026 ReCap: Mi primera experiencia en una PyCon", ponente: "Samuel Palacios", nivel: "Básico" },
      { inicio: "09:45", fin: "10:15", tipo: "pendiente", titulo: "Pendiente confirmar" },
      { inicio: "10:20", fin: "10:40", tipo: "receso", titulo: "Coffee Break" },
      { inicio: "10:40", fin: "11:10", tipo: "charla", titulo: "Del prompt a producción: Python detrás de agentes de IA", ponente: "José Figueroa", nivel: "Intermedio" },
      { inicio: "11:25", fin: "11:55", tipo: "charla", titulo: "Algoritmos cuánticos en Python aplicados a criptografía de curvas elípticas", ponente: "Ariel Montejo", nivel: "Avanzado" },
      { inicio: "12:10", fin: "12:40", tipo: "charla", titulo: "La IA no termina en el prompt: construyendo sistemas reales", ponente: "Dalia Paredes · TRIBAL", nivel: "Intermedio" },
    ],
  },
  {
    ...SALAS_INFO[1],
    sesiones: [
      { inicio: "09:00", fin: "09:30", tipo: "charla", titulo: "Risk Model & Reinforcement Learning", ponente: "Samuel Ramos", nivel: "Intermedio" },
      { inicio: "09:45", fin: "10:15", tipo: "charla", titulo: "Explorando Python en la educación", ponente: "Antonio García", nivel: "Intermedio" },
      { inicio: "10:20", fin: "10:40", tipo: "receso", titulo: "Coffee Break" },
      { inicio: "10:40", fin: "12:20", tipo: "taller", titulo: "Eleva tu carrera en datos con Databricks", ponente: "Christian Serrano", nivel: "Intermedio" },
    ],
  },
  {
    ...SALAS_INFO[2],
    sesiones: [
      { inicio: "09:00", fin: "09:30", tipo: "charla", titulo: "Más allá del código: la importancia del networking en tecnología", ponente: "Rudy Reinoso", nivel: "Básico" },
      { inicio: "09:45", fin: "10:15", tipo: "charla", titulo: "Cómo conseguir oportunidades internacionales en Big Data e IA", ponente: "Mario Gómez", nivel: "Básico" },
      { inicio: "10:20", fin: "10:40", tipo: "receso", titulo: "Coffee Break" },
      { inicio: "10:40", fin: "12:20", tipo: "taller", titulo: "IA con visión de negocio para tu carrera tech", ponente: "Mar García", nivel: "Básico" },
    ],
  },
  {
    ...SALAS_INFO[3],
    sesiones: [
      { inicio: "09:00", fin: "09:45", tipo: "charla", titulo: "El nuevo perfil profesional: Python, datos e Inteligencia Artificial", ponente: "Luciano Tom", nivel: "Avanzado" },
      { inicio: "09:45", fin: "10:20", tipo: "logistica", titulo: "Montaje de la exposición" },
      { inicio: "10:20", fin: "12:20", tipo: "expo", titulo: "Exposición de proyectos", nota: "El coffee break se sirve aquí de 10:20 a 10:40." },
      { inicio: "12:20", fin: "12:45", tipo: "logistica", titulo: "Desmontaje de la exposición" },
    ],
  },
];

export const ALMUERZO: Bloque[] = [
  { inicio: "12:45", fin: "13:45", tipo: "receso", titulo: "Almuerzo libre" },
  { inicio: "13:45", fin: "14:00", tipo: "logistica", titulo: "Llamado para volver a salones", nota: "Conexión de speakers y talleristas." },
];

export const VESPERTINA: Sala[] = [
  {
    ...SALAS_INFO[0],
    sesiones: [
      { inicio: "14:00", fin: "14:30", tipo: "charla", titulo: "Desarrollo de SLM en Kaqchikel", ponente: "Cristian Lavarreda", nivel: "Intermedio" },
      { inicio: "14:40", fin: "15:10", tipo: "charla", titulo: "IA aplicada a la automatización en procesos empresariales", ponente: "Mitsa Marisol Castellanos Pineda", nivel: "Intermedio" },
      { inicio: "15:20", fin: "15:50", tipo: "pendiente", titulo: "Pendiente confirmar" },
      { inicio: "15:55", fin: "16:00", tipo: "logistica", titulo: "Preparación del cierre" },
    ],
  },
  {
    ...SALAS_INFO[1],
    sesiones: [
      { inicio: "14:00", fin: "15:40", tipo: "taller", titulo: "Python as a Shield: automatizando la seguridad en AWS", ponente: "Jenner Fernández", nivel: "Intermedio" },
    ],
  },
  {
    ...SALAS_INFO[2],
    sesiones: [
      { inicio: "14:00", fin: "15:40", tipo: "taller", titulo: "Ciencia de datos aplicada en la predicción de demanda energética", ponente: "Deniz Arriaza", nivel: "Básico" },
    ],
  },
  {
    ...SALAS_INFO[3],
    sesiones: [
      { inicio: "14:00", fin: "15:40", tipo: "taller", titulo: "API a todo color", ponente: "Erick Marroquín", nivel: "Avanzado" },
    ],
  },
];

export const CIERRE: Bloque[] = [
  { inicio: "15:50", fin: "16:00", tipo: "logistica", titulo: "Traslado al auditorio", soloSalones: true },
  { inicio: "16:00", fin: "16:30", tipo: "logistica", titulo: "Despedida, reconocimientos y foto grupal" },
];

export const TOTALES = "13 charlas, 5 talleres y 1 exposición de proyectos";

export const LEYENDA: { tipo: Tipo; texto: string }[] = [
  { tipo: "charla", texto: "Charla" },
  { tipo: "taller", texto: "Taller" },
  { tipo: "expo", texto: "Exposición de proyectos" },
  { tipo: "receso", texto: "Coffee break / almuerzo" },
  { tipo: "logistica", texto: "Logística" },
];
