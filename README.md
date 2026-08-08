# 🐾 API-JWT — Clínica Veterinaria (Full Stack)

Este proyecto simula el sistema interno de una clínica veterinaria, con autenticación
y autorización basada en roles: **administrador**, **veterinario** y **cliente**. Lo
armé como práctica de backend con Node.js/Express/PostgreSQL, y le sumé un frontend
en React desde cero para consumirlo.

Partí de un backend que había hecho antes, le corregí varios problemas de seguridad
y de diseño, y lo amplié con funcionalidad que le faltaba (CRUD completo de mascotas,
tests, etc.). El frontend lo construí después, ya pensado para consumir la API tal
como quedó.

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## 📐 Arquitectura

```
API-JWT/
├── backend/     API REST (Node.js + Express + PostgreSQL + JWT)
└── frontend/    SPA (React + Vite + Tailwind CSS)
```

Son dos aplicaciones independientes que se comunican por HTTP/JSON. El backend no
sirve HTML, es una API pura que puede consumirse desde el frontend, Postman o cURL.

## 🚀 Características

- 🔒 Autenticación con JWT y contraseñas hasheadas con bcrypt.
- 🔑 Autorización por roles (admin / vet / user) vía middlewares reutilizables.
- 🐶 CRUD completo de mascotas con paginación, restringido a vet/admin para escritura.
- 👥 Panel de administración para promover o degradar usuarios entre cliente y veterinario.
- 🛡️ Helmet, CORS configurado, rate limiting en login/registro, y las contraseñas
  nunca se exponen en ninguna respuesta de la API.
- ✅ Suite de tests automatizados del backend (14 casos) usando `pg-mem`
  (PostgreSQL en memoria), sin necesidad de una base de datos real para correrlos.
- 🎨 Frontend responsive con rutas protegidas por rol, sesión persistente y manejo
  de errores.

## 🩺 Sobre las correcciones al backend original

El backend base tenía varios problemas que fui corrigiendo en el camino:

1. `/profile` y `GET /users` devolvían el hash de la contraseña en la respuesta JSON.
2. El `package.json` tenía un `name` inválido, una dependencia rota (`"1": "file:"`)
   y un typo en el script `start` (`ndoe` en vez de `node`).
3. `GET /pets` intentaba servir un `public/pets.html` que no existía, así que
   crasheaba. Terminé quitando ese frontend estático a favor de la nueva SPA en React.
4. No había CORS configurado, así que ningún frontend en otro origen podía consumir
   la API.
5. Las respuestas eran inconsistentes: unos endpoints devolvían `{ error }` y otros
   `{ ok, msg }`. Unifiqué todo bajo `{ ok, msg }`.
6. No había validación de entrada en el registro. Agregué validación de formato de
   email, y de largo mínimo para username y contraseña.
7. No había protección contra fuerza bruta, así que agregué rate limiting en login
   y registro.
8. Faltaban cabeceras de seguridad básicas, así que sumé Helmet.
9. `pets` solo tenía lectura. Agregué el CRUD completo (crear, editar, eliminar),
   restringido a veterinarios y administradores.
10. No había esquema de base de datos ni `.env.example`, así que agregué `schema.sql`
    y un `.env.example` para que cualquiera pueda levantarlo sin adivinar nada.
11. No había tests, así que armé una suite de 14 tests de integración sobre la API
    completa.

## 🧑‍💻 Roles del sistema

| role_id | Rol | Permisos |
|---|---|---|
| 1 | Administrador | Todo lo anterior + gestionar roles de usuarios |
| 2 | Veterinario | Ver, crear, editar y eliminar mascotas |
| 3 | Cliente (por defecto al registrarse) | Ver su perfil y el listado de mascotas |

---

## ⚙️ Cómo instalarla

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completa DATABASE_URL y JWT_SECRET
# Crea las tablas y datos de ejemplo:
psql "$DATABASE_URL" -f schema.sql
npm run dev             # http://localhost:3000
```

Si no tienes PostgreSQL instalado, puedes levantar uno rápido con Docker (cambia el
puerto si ya tienes un PostgreSQL local escuchando en 5432):

```bash
docker run -d --name api-jwt-postgres \
  -e POSTGRES_USER=api_jwt_user -e POSTGRES_PASSWORD=api_jwt_pass -e POSTGRES_DB=api_jwt_db \
  -p 5433:5432 postgres:16-alpine
psql "postgresql://api_jwt_user:api_jwt_pass@localhost:5433/api_jwt_db" -f schema.sql
```

Y si no quieres instalar nada, hay un modo demo con base de datos en memoria para
probar la API al instante (los datos no persisten):

```bash
npm run demo             # http://localhost:4000
```

Para correr los tests automatizados (tampoco necesitan PostgreSQL real):

```bash
npm test
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # ajusta VITE_API_URL si tu backend no corre en :3000
npm run dev              # http://localhost:5173
```

Para probar todo rápido: levanta `npm run demo` en el backend y `npm run dev` en el
frontend, y regístrate desde la interfaz.

> Para tener un usuario administrador, regístrate normalmente y luego actualiza su
> `role_id` a `1` directamente en la base de datos (no hay ruta pública para crear
> administradores, a propósito).

---

## 📋 Documentación de la API

Base URL: `/api/v1`

### Autenticación (`/users`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/users/register` | Público | Registra un usuario (rol cliente por defecto) |
| POST | `/users/login` | Público | Inicia sesión y devuelve un token JWT |
| GET | `/users/profile` | Autenticado | Datos del usuario actual (sin password) |
| GET | `/users` | Admin | Lista todos los usuarios (sin password) |
| PUT | `/users/update-role-vet/:uid` | Admin | Promueve un usuario a veterinario |
| PUT | `/users/update-role-user/:uid` | Admin | Degrada un usuario a cliente |

### Mascotas (`/pets`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/pets?limit=&page=` | Autenticado | Lista paginada de mascotas |
| GET | `/pets/:id` | Autenticado | Detalle de una mascota |
| POST | `/pets` | Vet/Admin | Crea una mascota |
| PUT | `/pets/:id` | Vet/Admin | Actualiza una mascota |
| DELETE | `/pets/:id` | Vet/Admin | Elimina una mascota |

Todas las rutas autenticadas requieren el header `Authorization: Bearer <token>`.

Formato de respuesta estándar:

```json
{ "ok": true, "msg": { } }
{ "ok": false, "msg": "descripción del error" }
```

---

## 🛠️ Stack técnico

**Backend**: Node.js, Express, PostgreSQL (`pg`), JWT, bcryptjs, Helmet, CORS,
express-rate-limit, Morgan.

**Frontend**: React 19, Vite, React Router, Axios, Tailwind CSS.

**Testing**: Node.js test runner nativo + `pg-mem` (PostgreSQL en memoria) + Supertest.

---

## 💬 Autor

**Eduard Murillo** — [github.com/SoyEdu15](https://github.com/SoyEdu15)
