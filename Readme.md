
# API JWT

**API JWT** es una aplicación basada en Node.js que implementa autenticación y autorización utilizando JSON Web Tokens (JWT). Este proyecto está diseñado para aprender y demostrar el uso de JWT en un entorno de desarrollo.

## 🚀 Características

- Autenticación con JWT.
- Registro de usuarios.
- Endpoints protegidos con middleware de autorización.
- Implementación simple y escalable.

## 🛠️ Tecnologías Utilizadas

- **Node.js**
- **Express**
- **JSON Web Token (JWT)**
- **bcrypt** (para hashear contraseñas)

## 📦 Instalación

Sigue estos pasos para clonar y configurar el proyecto:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/SoyEdu15/API-JWT.git
   cd API-JWT
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   PORT=3000
   JWT_SECRET=tu_clave_secreta
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

## 📋 Documentación de la API

### Endpoints Disponibles

#### 1. **Registro de Usuario**
- **URL:** `/api/register`
- **Método:** `POST`
- **Descripción:** Crea un nuevo usuario.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "username": "tu_usuario",
    "password": "tu_contraseña"
  }
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "message": "Usuario registrado exitosamente"
  }
  ```

#### 2. **Inicio de Sesión**
- **URL:** `/api/login`
- **Método:** `POST`
- **Descripción:** Genera un token JWT para el usuario.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "username": "tu_usuario",
    "password": "tu_contraseña"
  }
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "token": "jwt_token_generado"
  }
  ```
## 📖 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **npm** (administrador de paquetes de Node.js)

## 🤝 Contribuciones

¡Contribuciones son bienvenidas! Si encuentras algún problema, crea un _issue_ o envía un _pull request_.
<div align="center">
    
  # Authors

  - [@Eduard Murillo](https://github.com/SoyEdu15)
  </div>
## 📜 Licencia

Este proyecto está bajo la Licencia MIT.
