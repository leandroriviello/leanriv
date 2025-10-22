# LeanRiv

LeanRiv es un panel privado para crear y administrar redirecciones cortas bajo tu propio dominio.

## Características principales

- Autenticación con credenciales fijas definidas en variables de entorno.
- Dashboard en modo oscuro con búsqueda en tiempo real (debounce) sobre alias y URL.
- Creación, listado y eliminación de links almacenados en PostgreSQL vía Prisma.
- Redirección inmediata desde `/<alias>` al destino configurado.
- UI moderna con Tailwind CSS, iconos de lucide-react y toasts de feedback.

## Requisitos previos

- Node.js 20+
- Base de datos PostgreSQL (por ejemplo, Railway)

## Configuración

1. Copiá el archivo de ejemplo y completá tus datos reales:

   ```bash
   cp .env.example .env
   ```

2. Editá `.env` con tus credenciales y URL de la base de datos.

   ```dotenv
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ADMIN_EMAIL=leanriv@example.com
   ADMIN_PASSWORD=claveSegura123
   SESSION_SECRET=una_clave_aleatoria_segura
   ```

3. Instalá dependencias y generá el cliente de Prisma:

   ```bash
   npm install
   npx prisma generate
   ```

4. Aplicá las migraciones (crearás la tabla `Link`):

   ```bash
   npx prisma migrate dev --name init
   ```

## Scripts útiles

| Comando | Descripción |
| ------- | ----------- |
| `npm run dev` | Inicia el entorno de desarrollo en `http://localhost:3000`. |
| `npm run build` | Genera la versión optimizada para producción. |
| `npm run start` | Sirve la build de producción. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |

## Deploy en Railway

1. Creá un proyecto en Railway con una base de datos PostgreSQL.
2. Copiá la `DATABASE_URL` brindada por Railway en tu `.env`.
3. Ejecutá las migraciones en el servidor:

   ```bash
   npx prisma migrate deploy
   ```

4. Deployá desde tu repositorio:

   ```bash
   git push railway main
   ```

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4 (modo oscuro por defecto)
- Prisma ORM + PostgreSQL
- jose para sesiones con JWT
- react-hot-toast para notificaciones

## Estructura relevante

```
app/
  login/
  dashboard/
  [alias]/
  api/
components/
lib/
prisma/
```

¡Listo! Con esto ya podés gestionar tus enlaces personales bajo tu dominio.
