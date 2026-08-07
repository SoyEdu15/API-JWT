# API-JWT — Backend

API REST en Node.js/Express/PostgreSQL con autenticación JWT y autorización por roles.

Ver la documentación completa (arquitectura, endpoints, roles, correcciones aplicadas)
en el [README principal del proyecto](../README.md).

## Comandos

```bash
npm install
cp .env.example .env
npm run dev     # servidor de desarrollo (requiere PostgreSQL real, ver DATABASE_URL)
npm run demo    # servidor con base de datos en memoria, sin instalar Postgres
npm test        # suite de tests automatizados (pg-mem, sin Postgres real)
```
