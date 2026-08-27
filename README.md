# Python Guatemala — sitio full-stack (starter)

Stack: **Next.js + TypeScript + Prisma + PostgreSQL + NextAuth**, pensado para
desplegarse gratis en **Vercel** (app) + **Neon** (base de datos).

Este starter ya incluye:
- Esquema de base de datos (`prisma/schema.prisma`) con eventos, álbumes de
  fotos por actividad, inscripciones de participantes, postulaciones de
  ponentes y usuarios admin.
- Login del equipo core (`/admin/login`) con NextAuth.
- Panel admin protegido en `/admin/dashboard` con secciones:
  - `/eventos` — crear eventos y publicarlos/despublicarlos
  - `/galeria` — crear álbumes por evento y agregar fotos (por URL)
  - `/ponentes` — revisar postulaciones y aceptar/rechazar
  - `/inscritos` — ver participantes registrados
- Páginas públicas `/eventos` y `/eventos/[slug]` con galería por álbum e
  inscripción/postulación **desde tu propia base de datos, sin Google Forms**.
- `app/page.tsx` como punto de partida para migrar el resto de tu `index.html`
  actual (hero, comunidad, equipo, código de conducta, etc.)

### Sobre las fotos de álbumes

Por ahora, agregar una foto en `/admin/dashboard/galeria` pide una **URL de
imagen** (por simplicidad del starter). Para subir archivos directo desde el
panel sin usar una URL externa, el siguiente paso natural es integrar
**Vercel Blob** o **Cloudinary** (ambos con plan gratuito) en el formulario
de "Agregar foto" — se puede añadir sin cambiar el resto del esquema.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Crear tu base de datos gratis en Neon

1. Crea una cuenta en https://neon.tech
2. Crea un proyecto nuevo (Postgres)
3. Copia la "connection string" que te dan

## 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Pega tu `DATABASE_URL` de Neon, y genera un `NEXTAUTH_SECRET` con:

```bash
openssl rand -base64 32
```

## 4. Crear las tablas y datos iniciales

```bash
npx prisma migrate dev --name init
npm run seed
```

Esto crea el usuario admin inicial:
- correo: `admin@pythonguatemala.org`
- contraseña: `cambia-esta-clave` (¡cámbiala en `prisma/seed.ts` antes de usar en producción!)

## 5. Correr en local

```bash
npm run dev
```

- Sitio público: http://localhost:3000
- Login admin: http://localhost:3000/admin/login

## 6. Migrar tu diseño actual

Tu `index.html` + `styles.css` + `main.js` de la versión estática se migran así:
- El CSS casi tal cual va a `app/globals.css` (o módulos CSS por sección).
- Cada `<section>` (hero, comunidad, eventos, galería, equipo, etc.) se
  vuelve un componente en `app/components/`.
- Los datos que antes estaban escritos a mano en el HTML (fecha del evento,
  fotos de galería) ahora vienen de la base de datos vía Prisma — mira
  `app/page.tsx` como ejemplo.
- El formulario de ponente (el modal que ya tenías) apunta su `fetch` a
  `/api/speakers` en vez de a Formspree, mandando también `eventSlug`
  (ej. `"xpday-2026"`).

## 7. Desplegar

1. Sube este proyecto a un repositorio de GitHub.
2. Entra a https://vercel.com, importa el repo.
3. Agrega las mismas variables de entorno (`DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL` con tu dominio real) en la configuración del proyecto.
4. Vercel despliega automáticamente en cada `git push`.

## Próximos pasos sugeridos

- Agregar envío de correo de confirmación (Resend o Nodemailer) dentro de
  `app/api/speakers/route.ts`.
- Agregar páginas de administración para crear/editar eventos y subir fotos
  de galería (CRUD sobre `Event` y `GalleryImage`).
- Restringir por `role` en el dashboard si más adelante quieres roles
  distintos (admin vs editor).
