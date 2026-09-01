// Contenido editorial del sitio. Lo dinámico (evento, galería) viene de la base
// de datos; esto es el texto fijo de las secciones.

export const EVENT_SLUG = "xpday-2026";

export const SOCIALS = [
  { icon: "📸", label: "Instagram", handle: "@pythonguatemala", href: "https://www.instagram.com/pythonguatemala/" },
  { icon: "👍", label: "Facebook", handle: "Python Guatemala", href: "https://www.facebook.com/pythonGuatemala/" },
  { icon: "📅", label: "Meetup", handle: "python-guatemala", href: "https://www.meetup.com/python-guatemala/" },
  { icon: "💼", label: "LinkedIn", handle: "Python Guatemala", href: "https://www.linkedin.com/company/python-guatemala/" },
  { icon: "💻", label: "GitHub", handle: "ComunidadPythonGuatemala", href: "https://github.com/ComunidadPythonGuatemala" },
];

export const FEATURES = [
  { icon: "🎤", title: "Conferencias", text: "Charlas de la mano de personas de la industria y la academia sobre IA, automatización, desarrollo web, datos y más." },
  { icon: "🛠️", title: "Talleres prácticos", text: "Sesiones manos a la obra donde escribes código real, resuelves retos y te llevas algo funcionando a casa." },
  { icon: "🚀", title: "Exposición de proyectos", text: "Un escenario para que la comunidad muestre lo que construye y reciba retroalimentación de otras personas." },
  { icon: "🗓️", title: "Charlas en línea", text: "Al menos una vez al mes nos reunimos en línea para compartir conocimiento sin importar dónde estés." },
  { icon: "🌎", title: "Presencia internacional", text: "Representamos a Guatemala en conferencias de Python por toda la región y Estados Unidos." },
  { icon: "🤝", title: "Networking", text: "Conecta con gente que ama la tecnología, encuentra mentores, colaboradores o tu próxima oportunidad." },
];

export const STATS = [
  { count: 300, suffix: "+", label: "Asistentes en 2025" },
  { count: 5, suffix: " países", label: "Presencia internacional" },
  { count: 12, suffix: "/año", label: "Charlas en línea" },
  { count: 100, suffix: "%", label: "Gratis y abierto" },
];

export const XP_TRACKS = [
  {
    tag: "🎤 Charlas",
    img: "/assets/img/eventos/2025/full/ped2025-30.jpg",
    title: "Charlas",
    html: "Conferencias de personas expertas de la industria y la academia sobre <b>inteligencia artificial, ciencia de datos, desarrollo web y automatización</b>. Las tendencias que marcan el rumbo de la tecnología, explicadas para inspirarte y dejarte pensando.",
  },
  {
    tag: "🛠️ Talleres",
    img: "/assets/img/eventos/2025/full/ped2025-05.jpg",
    title: "Talleres",
    html: "Sesiones <b>manos al teclado</b> donde aprendés haciendo. Desde tus primeros pasos en Python hasta automatización, datos y herramientas modernas. Traé tu laptop y salí con algo funcionando y nuevas habilidades bajo el brazo.",
  },
  {
    tag: "🚀 Proyectos",
    img: "/assets/img/eventos/2025/full/ped2025-31.jpg",
    title: "Exposición de proyectos",
    html: "El escenario donde la comunidad <b>muestra lo que construye</b>: proyectos reales hechos con Python. Descubrí qué están creando otras personas, recibí retroalimentación y animate a exponer el tuyo ante la comunidad.",
  },
];

export const TEAM = [
  { img: "/assets/img/equipo/erick.jpg", name: "MSc. Erick J. Pineda Amézquita", role: "Líder de la Comunidad", text: "Lidera y representa a la comunidad ante universidades, empresas y patrocinadores. Define la visión, la estrategia y el plan de actividades." },
  { img: "/assets/img/equipo/ariel.jpg", name: "Ing. Ariel Chitay", role: "Contenido / Academia · Apoyo en dirección", text: "Contacta a conferencistas y talleristas, prepara material educativo y propone temas relevantes para la comunidad." },
  { img: "/assets/img/equipo/mydelin.jpg", name: "Ing. Mydelin Valladares", role: "Logística y Patrocinios", text: "Coordina espacios y equipo, apoya el día del evento y busca alianzas con universidades, empresas y sponsors." },
  { img: "/assets/img/equipo/allison.jpg", name: "Allison Juárez", role: "Comunicación y Marketing · Embajadores", text: "Maneja redes sociales, diseño de flyers y campañas, e invita a más personas a sumarse a la comunidad." },
];

export const COC = [
  { b: "Ser inclusivo.", rest: "Estamos abiertos a la colaboración en proyectos, parches, problemas y más." },
  { b: "Priorizar la comunidad.", rest: "Trabajamos dentro de los procesos establecidos y por el bien común." },
  { b: "Reconocer el esfuerzo.", rest: "Valoramos el tiempo y el trabajo voluntario de cada persona." },
  { b: "Respetar la diversidad.", rest: "Somos receptivos a distintos puntos de vista, experiencias y críticas constructivas." },
  { b: "Mostrar empatía.", rest: "Somos atentos y tenemos tacto en nuestras comunicaciones, en persona o en línea." },
  { b: "Lenguaje acogedor.", rest: "Fomentamos un entorno donde cualquiera pueda participar y marcar la diferencia." },
];

// Niveles de patrocinio — se muestran solo en /patrocinio (página no enlazada).
export const SPONSOR_TIERS: {
  nivel?: number;
  nombre: string;
  precio: string;
  etiqueta?: string;
  para: string;
  destacado?: boolean;
  incluye: string[];
}[] = [
  {
    nombre: "Aliado Colaborador",
    precio: "A tu medida",
    etiqueta: "Aporte flexible",
    para: "Para quienes quieren sumarse aportando productos o servicios, según lo que esté a su alcance.",
    incluye: [
      "Aportas lo que puedas: refacción o coffee break, stickers y artículos promocionales, impresión de materiales, premios para dinámicas, espacio, equipo audiovisual, etc.",
      "Mención y agradecimiento como aliado en las redes sociales oficiales.",
      "Logo en los materiales digitales del evento, según el aporte.",
    ],
  },
  {
    nivel: 1,
    nombre: "Aliado Emprendedor",
    precio: "Q300",
    para: "Ideal para empresas que desean presencia de marca y visibilidad digital en el evento.",
    incluye: [
      "Logo en piezas promocionales digitales (redes sociales, afiches y materiales del evento).",
      "Mención en la apertura y cierre del evento.",
      "Reconocimiento como “Aliado Básico” en las redes sociales oficiales.",
    ],
  },
  {
    nivel: 2,
    nombre: "Aliado Estratégico",
    precio: "Q600",
    para: "Para empresas que buscan un rol más activo y visibilidad ampliada durante el evento.",
    incluye: [
      "Todo lo del nivel anterior.",
      "Espacio para compartir material promocional o folletos durante el evento (brindado por el patrocinador).",
      "Logo más grande que el nivel básico, en el banner principal y en la presentación de bienvenida.",
      "Logotipo proyectado durante las charlas.",
    ],
  },
  {
    nivel: 3,
    nombre: "Aliado Premium",
    precio: "Q1000",
    destacado: true,
    para: "Para empresas que buscan el rol más activo y la mayor visibilidad durante y después del evento.",
    incluye: [
      "Todo lo del nivel anterior.",
      "Logo más grande que el nivel 2, en el banner principal y en la presentación de bienvenida.",
      "Presencia preferente de marca en escenario, banners y redes sociales.",
      "Reconocimiento entregado en la reunión de clausura.",
      "Mención especial como “Aliado Premium” en medios y publicaciones posteriores al evento.",
      "Espacio para dar una charla de 25 minutos o un taller de 120 minutos.",
      "Logo dentro del diploma digital de participación de asistentes y ponentes.",
      "Acceso al listado de asistentes con perfil académico y laboral (bajo consentimiento).",
    ],
  },
];

// Con "/#…" para que funcionen desde cualquier página, no solo la portada.
export const NAV_LINKS: { href: string; label: string; contacto?: boolean }[] = [
  { href: "/#comunidad", label: "Comunidad" },
  { href: "/#eventos", label: "Eventos" },
  { href: "/#apoyanos", label: "Apóyanos" },
  { href: "/#equipo", label: "Equipo" },
  { href: "/#conducta", label: "Código de conducta" },
  { href: "/#unete", label: "Únete" },
  { href: "/#apoyanos", label: "Contacto", contacto: true },
];
