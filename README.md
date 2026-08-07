# 🐾 API-JWT — Clínica Veterinaria (Full Stack)

Proyecto full-stack de autenticación y autorización basada en roles, construido como
demostración de habilidades backend (Node.js/Express/PostgreSQL) y frontend (React).
Simula el sistema interno de una clínica veterinaria con tres roles: **administrador**,
**veterinario** y **cliente**.

> Proyecto original de backend ampliado y corregido, con un frontend en React construido
> desde cero para consumir la API.

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

Dos aplicaciones independientes que se comunican por HTTP/JSON. El backend no sirve HTML;
es una API pura consumida por el frontend (o por Postman/cURL).

## 🚀 Características

- 🔒 **Autenticación con JWT** y contraseñas hasheadas con bcrypt.
- 🔑 **Autorización por roles** (admin / vet / user) vía middlewares reutilizables.
- 🐶 **CRUD completo de mascotas** con paginación, restringido a vet/admin para escritura.
- 👥 **Panel de administración**: promover/degradar usuarios entre cliente y veterinario.
- 🛡️ **Seguridad**: Helmet, CORS configurado, rate limiting en login/registro, y las
  contraseñas nunca se exponen en ninguna respuesta de la API.
- ✅ **Tests automatizados** del backend (14 casos) usando `pg-mem` (Postgres en memoria),
  sin necesidad de una base de datos real para correrlos.
- 🎨 **Frontend responsive** con rutas protegidas por rol, manejo de sesión persistente y
  feedback de errores.

## 🩺 Correcciones y mejoras realizadas sobre el backend original

Al auditar el repositorio original se encontraron y corrigieron varios problemas:

1. **Fuga de contraseñas**: `/profile` y el listado de usuarios (`GET /users`) devolvían
   el hash de la contraseña en la respuesta JSON. Se corrigió para excluirlo siempre.
2. **`package.json` corrupto**: contenía un `name` y una dependencia (`"1": "file:"`)
   inválidos, y el script `start` tenía un typo (`ndoe` en vez de `node`).
3. **Ruta rota**: `GET /pets` intentaba servir `public/pets.html`, un archivo que no
   existía en el repositorio (crasheaba con 404 sin manejar). Se eliminó el frontend
   estático en favor de la nueva SPA en React.
4. **Sin CORS**: no había forma de que un frontend en otro origen consumiera la API.
5. **Respuestas inconsistentes**: unos endpoints devolvían `{ error }` y otros
   `{ ok, msg }`. Se unificó todo bajo `{ ok, msg }`.
6. **Sin validación de entrada**: registro aceptaba cualquier email/username/password.
   Se añadió validación de formato de email, largo mínimo de username y contraseña.
7. **Sin protección contra fuerza bruta**: se añadió rate limiting en login/registro.
8. **Faltaban cabeceras de seguridad**: se añadió Helmet.
9. **`pets` solo tenía lectura**: se añadió CRUD completo (crear, editar, eliminar)
   restringido a veterinarios/administradores.
10. **Sin esquema de base de datos ni `.env.example`**: se añadieron `schema.sql` y
    `.env.example` para que el proyecto sea reproducible.
11. **Sin tests**: se añadió una suite de 14 tests de integración sobre la API completa.

## 🧑‍💻 Roles del sistema

| role_id | Rol | Permisos |
|---|---|---|
| 1 | Administrador | Todo lo anterior + gestionar roles de usuarios |
| 2 | Veterinario | Ver, crear, editar y eliminar mascotas |
| 3 | Cliente (por defecto al registrarse) | Ver su perfil y el listado de mascotas |

---

## ⚙️ Puesta en marcha

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completa DATABASE_URL y JWT_SECRET
# Crea las tablas y datos de ejemplo:
psql "$DATABASE_URL" -f schema.sql
npm run dev             # http://localhost:3000
```

¿No tienes PostgreSQL instalado? Puedes levantar uno rápido con Docker (ajusta el puerto
si ya tienes un PostgreSQL local escuchando en 5432):

```bash
docker run -d --name api-jwt-postgres \
  -e POSTGRES_USER=api_jwt_user -e POSTGRES_PASSWORD=api_jwt_pass -e POSTGRES_DB=api_jwt_db \
  -p 5433:5432 postgres:16-alpine
psql "postgresql://api_jwt_user:api_jwt_pass@localhost:5433/api_jwt_db" -f schema.sql
```

¿No tienes PostgreSQL a mano ni Docker? Puedes levantar la API con una base de datos en
memoria para probarla al instante (los datos no persisten):

```bash
npm run demo             # http://localhost:4000
```

Correr los tests automatizados (tampoco requieren PostgreSQL real):

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

Para probar el flujo completo rápidamente: levanta `npm run demo` en el backend y
`npm run dev` en el frontend, y regístrate desde la interfaz.

> Para tener un usuario administrador, regístrate normalmente y luego actualiza su
> `role_id` a `1` directamente en la base de datos (no hay ruta pública para crear
> administradores, por diseño).

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
