# LeanRiv

Gestor personal de enlaces cortos con modo oscuro, pensado para uso privado bajo el dominio `leanriv.com`.

## 🧠 Qué resuelve

- Guarda alias cortos (`/aiwebs`) que redirigen a URLs largas.
- Dashboard minimalista para crear, buscar y eliminar enlaces en segundos.
- Redirecciones instantáneas al ingresar `https://leanriv.com/<alias>`.
- Autenticación cerrada con un único usuario configurado por variables de entorno.

## ⚙️ Requisitos

- Node.js 20 o superior.
- Base de datos PostgreSQL (Railway es la opción recomendada).

## 🚀 Puesta en marcha local

1. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Editá `.env` con tus credenciales reales:

   ```dotenv
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ADMIN_EMAIL=leanriv@example.com
   ADMIN_PASSWORD=claveSegura123
   SESSION_SECRET=una_clave_aleatoria_segura
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Generar cliente de Prisma**

   ```bash
   npx prisma generate
   ```

4. **Aplicar migraciones**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Iniciar el servidor**

   ```bash
   npm run dev
   ```

   La app quedará disponible en [http://localhost:3000](http://localhost:3000).

## 🛠 Scripts disponibles

| Comando          | Descripción                                           |
| ---------------- | ----------------------------------------------------- |
| `npm run dev`    | Entorno de desarrollo con recarga en caliente.        |
| `npm run build`  | Compila la aplicación para producción.                |
| `npm run start`  | Sirve la build de producción.                         |
| `npm run lint`   | Ejecuta ESLint sobre todo el proyecto.                |

## 💾 Modelo de datos

```prisma
model Link {
  id        Int      @id @default(autoincrement())
  alias     String   @unique
  url       String
  createdAt DateTime @default(now())
}
```

## 🔐 Autenticación

- Credenciales fijas (`ADMIN_EMAIL` + `ADMIN_PASSWORD`).
- Sesiones firmadas con JWT (librería `jose`) y cookies HTTP-only.
- Middleware que protege `/dashboard` y `/api/links`, redirigiendo a `/login`.

## 🌐 Endpoints principales

- `POST /api/auth` → Inicia sesión y setea cookie.
- `DELETE /api/auth` → Cierra sesión.
- `GET /api/links` → Devuelve todos los enlaces (requiere sesión).
- `POST /api/links` → Crea un enlace (requiere sesión).
- `DELETE /api/links/:id` → Elimina un enlace (requiere sesión).
- `GET /:alias` → Redirige a la URL original o devuelve 404.

## 🧪 Flow de usuario

1. Ingresá en `/login` con las credenciales configuradas.
2. Utilizá el buscador con debounce para filtrar por alias/URL.
3. Creá nuevos enlaces desde el modal `Nuevo link`.
4. Copiá o eliminá enlaces desde la tabla.
5. Salí de la sesión desde el botón “Salir”.

## ☁️ Deploy en Railway

1. Creá un proyecto en Railway y añadí un servicio de PostgreSQL.
2. Copiá la `DATABASE_URL` y colócala en tu `.env`.
3. Ejecutá las migraciones en Railway:

   ```bash
   npx prisma migrate deploy
   ```

4. Deployá la app:

   ```bash
   git push railway main
   ```

## 🧩 Stack

- Next.js 16 (App Router + TypeScript).
- Tailwind CSS 4 con tema oscuro custom.
- Prisma ORM + PostgreSQL.
- `jose` para firmas JWT.
- `react-hot-toast` para feedback instantáneo.
- Íconos de `lucide-react`.

## 📁 Estructura relevante

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

---

Con LeanRiv tenés un repositorio organizado para gestionar tus propios enlaces bajo tu dominio personal, con la velocidad y estética de un dashboard moderno. ¡Listo para usar o extender! 🚀
