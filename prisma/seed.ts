import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Fotos del Python eXposition Day 2025 (viven en /public/assets/img/eventos/2025/full)
const PHOTOS_2025: { file: string; caption: string }[] = [
  { file: "ped2025-01.jpg", caption: "Apertura del Python eXposition Day 2025" },
  { file: "ped2025-02.jpg", caption: "Conferencia magistral en el auditorio" },
  { file: "ped2025-03.jpg", caption: "Charla sobre Inteligencia Artificial" },
  { file: "ped2025-04.jpg", caption: "Ponencia principal" },
  { file: "ped2025-05.jpg", caption: "Taller práctico de Python" },
  { file: "ped2025-06.jpg", caption: "Parte de la comunidad" },
  { file: "ped2025-07.jpg", caption: "Del pasado al futuro de la computación" },
  { file: "ped2025-08.jpg", caption: "Reconocimiento a los expositores" },
  { file: "ped2025-09.jpg", caption: "Manos a la obra en los talleres" },
  { file: "ped2025-10.jpg", caption: "Entrega de diplomas" },
  { file: "ped2025-11.jpg", caption: "Auditorio lleno" },
  { file: "ped2025-12.jpg", caption: "Networking y refacción" },
  { file: "ped2025-13.jpg", caption: "Compartiendo conocimiento" },
  { file: "ped2025-14.jpg", caption: "Foto de familia de la comunidad" },
  { file: "ped2025-15.jpg", caption: "Premiación de proyectos" },
  { file: "ped2025-16.jpg", caption: "Reconocimiento a ponentes" },
  { file: "ped2025-17.jpg", caption: "Concentración en el taller" },
  { file: "ped2025-18.jpg", caption: "La comunidad Python Guatemala" },
  { file: "ped2025-19.jpg", caption: "Aprendiendo en comunidad" },
  { file: "ped2025-20.jpg", caption: "Ciudad de Guatemala, sede del evento" },
  { file: "ped2025-21.jpg", caption: "Bienvenidos al Python eXposition Day 2025" },
  { file: "ped2025-22.jpg", caption: "Nuevas amistades en la comunidad" },
  { file: "ped2025-23.jpg", caption: "Python para todas las edades" },
  { file: "ped2025-24.jpg", caption: "Voluntarios y asistentes" },
  { file: "ped2025-25.jpg", caption: "Pausa para la refacción" },
  { file: "ped2025-26.jpg", caption: "Espacios de networking" },
  { file: "ped2025-27.jpg", caption: "Entrega de reconocimientos" },
  { file: "ped2025-28.jpg", caption: "El rol de Python" },
  { file: "ped2025-29.jpg", caption: "Preguntas y respuestas" },
  { file: "ped2025-30.jpg", caption: "Pasión por la programación" },
  { file: "ped2025-31.jpg", caption: "Voces de la comunidad" },
  { file: "ped2025-32.jpg", caption: "Exposición de proyectos" },
  { file: "ped2025-33.jpg", caption: "Talleres especializados" },
  { file: "ped2025-34.jpg", caption: "Automatización y nuevas tecnologías" },
  { file: "ped2025-35.jpg", caption: "Mujeres en Python Guatemala" },
  { file: "ped2025-36.jpg", caption: "Oportunidades con los patrocinadores" },
  { file: "ped2025-37.jpg", caption: "El equipo organizador" },
  { file: "ped2025-38.jpg", caption: "Comunidad y colaboración" },
  { file: "ped2025-39.jpg", caption: "Charlas técnicas" },
  { file: "ped2025-40.jpg", caption: "Productividad y automatización con n8n" },
  { file: "ped2025-41.jpg", caption: "Exposición de proyectos de la comunidad" },
  { file: "ped2025-42.jpg", caption: "Un auditorio repleto" },
  { file: "ped2025-43.jpg", caption: "¡Gracias por acompañarnos!" },
  { file: "ped2025-44.jpg", caption: "La energía de la comunidad" },
  { file: "ped2025-45.jpg", caption: "Panorámica del evento" },
  { file: "ped2025-46.jpg", caption: "Asistentes del Python eXposition Day 2025" },
  { file: "ped2025-47.jpg", caption: "Autoridades y organizadores" },
];

async function main() {
  // ---- Usuario admin del panel ----
  const passwordHash = await bcrypt.hash("cambia-esta-clave", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@pythonguatemala.org" },
    update: {},
    create: {
      email: "admin@pythonguatemala.org",
      passwordHash,
      name: "Equipo Core",
      role: "ADMIN",
    },
  });

  // ---- Evento próximo: Python eXposition Day 2026 ----
  await prisma.event.upsert({
    where: { slug: "xpday-2026" },
    update: {
      title: "Python eXposition Day 2026",
      date: new Date("2026-10-03T08:00:00-06:00"),
      location: "Universidad del Valle de Guatemala (UVG)",
      description:
        "Una nueva edición del Python eXposition Day para aprender, construir y conectar en comunidad: un día completo de charlas, talleres y exposición de proyectos hechos por la comunidad.",
      published: true,
    },
    create: {
      title: "Python eXposition Day 2026",
      slug: "xpday-2026",
      date: new Date("2026-10-03T08:00:00-06:00"),
      location: "Universidad del Valle de Guatemala (UVG)",
      description:
        "Una nueva edición del Python eXposition Day para aprender, construir y conectar en comunidad: un día completo de charlas, talleres y exposición de proyectos hechos por la comunidad.",
      published: true,
    },
  });

  // ---- Edición pasada: Python eXposition Day 2025 (guarda la galería) ----
  const evento2025 = await prisma.event.upsert({
    where: { slug: "xpday-2025" },
    update: {
      title: "Python eXposition Day 2025",
      date: new Date("2025-10-11T08:00:00-06:00"),
      location: "Universidad del Valle de Guatemala (UVG)",
      description:
        "Talleres a reventar, conferencias sobre IA y \"40 años de programación\", automatización y una exposición de proyectos creados por la comunidad. Con el apoyo de la UVG y Tribal.",
      published: true,
    },
    create: {
      title: "Python eXposition Day 2025",
      slug: "xpday-2025",
      date: new Date("2025-10-11T08:00:00-06:00"),
      location: "Universidad del Valle de Guatemala (UVG)",
      description:
        "Talleres a reventar, conferencias sobre IA y \"40 años de programación\", automatización y una exposición de proyectos creados por la comunidad. Con el apoyo de la UVG y Tribal.",
      published: true,
    },
  });

  // ---- Álbum + fotos del Python eXposition Day 2025 (idempotente) ----
  // Renombra el álbum si venía de una versión previa del seed.
  for (const viejo of ["Galería XPDay 2025", "XPDay 2025"]) {
    const a = await prisma.album.findFirst({ where: { eventId: evento2025.id, title: viejo } });
    if (a) await prisma.album.update({ where: { id: a.id }, data: { title: "Python eXposition Day 2025" } });
  }

  let album = await prisma.album.findFirst({
    where: { eventId: evento2025.id, title: "Python eXposition Day 2025" },
  });
  if (!album) {
    album = await prisma.album.create({
      data: {
        title: "Python eXposition Day 2025",
        description: "Un auditorio lleno de comunidad · 11 de octubre de 2025 · UVG",
        eventId: evento2025.id,
      },
    });
  }

  const yaTiene = await prisma.galleryImage.count({ where: { albumId: album.id } });
  if (yaTiene === 0) {
    await prisma.galleryImage.createMany({
      data: PHOTOS_2025.map((p, i) => ({
        url: `/assets/img/eventos/2025/full/${p.file}`,
        caption: p.caption,
        order: i,
        albumId: album!.id,
      })),
    });
    console.log(`  ${PHOTOS_2025.length} fotos agregadas al álbum "${album.title}"`);
  } else {
    console.log(`  El álbum "${album.title}" ya tiene ${yaTiene} fotos, no se tocan`);
  }

  // ---- Otras actividades de la comunidad: cada una es su propio evento ----
  // Cada evento tiene su página compartible (/eventos/<slug>) y un álbum donde
  // se suben las fotos desde /admin/dashboard/galeria.
  const ACTIVIDADES = [
    {
      slug: "foro-de-ia",
      title: "Foro de IA",
      date: new Date("2026-05-15T12:00:00-06:00"),
      location: "Fundación BI",
      description: "Foro de IA.",
    },
    {
      slug: "python-after-office",
      title: "Python After Office",
      date: new Date("2025-11-15T12:00:00-06:00"),
      location: "Universidad Galileo",
      description: "Charlas varias en un meetup after office de la comunidad.",
    },
    {
      slug: "pyzzathon",
      title: "Pyzzathon",
      date: new Date("2026-06-15T12:00:00-06:00"),
      location: "Improving",
      description: "Charlas con pizza: una tarde de código, comunidad y buena comida.",
    },
  ];
  for (const a of ACTIVIDADES) {
    const evento = await prisma.event.upsert({
      where: { slug: a.slug },
      update: {}, // no piso datos que ya se hayan ajustado desde el panel
      create: { ...a, published: true },
    });
    // El álbum solo se crea si no existe ya uno con ese título (en cualquier evento).
    const existe = await prisma.album.findFirst({ where: { title: a.title } });
    if (!existe) {
      await prisma.album.create({
        data: { title: a.title, description: a.description, eventId: evento.id },
      });
      console.log(`  Álbum "${a.title}" creado (sin fotos todavía)`);
    }
  }

  // Limpieza: el viejo contenedor "galería de la comunidad" ya no se usa.
  const viejoContenedor = await prisma.event.findUnique({
    where: { slug: "galeria-comunidad" },
    include: { albums: true, registrations: true, speakerSubmissions: true },
  });
  if (
    viejoContenedor &&
    viejoContenedor.albums.length === 0 &&
    viejoContenedor.registrations.length === 0 &&
    viejoContenedor.speakerSubmissions.length === 0
  ) {
    await prisma.event.delete({ where: { id: viejoContenedor.id } });
    console.log("  Contenedor 'galeria-comunidad' eliminado (ya no se usa)");
  }

  console.log("Datos iniciales listos. Admin: admin@pythonguatemala.org / cambia-esta-clave");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
