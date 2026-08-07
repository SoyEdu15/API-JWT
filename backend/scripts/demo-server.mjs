/**
 * Servidor de demostracion: levanta la API completa usando pg-mem
 * (una base de datos Postgres en memoria) en lugar de una instancia real
 * de PostgreSQL. Util para probar rapidamente el backend o el frontend
 * sin tener que instalar y configurar una base de datos.
 *
 * NO USAR EN PRODUCCION. Los datos se pierden al reiniciar el proceso.
 */
import { mock } from 'node:test'
import { newDb } from 'pg-mem'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4000

process.env.JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_no_usar_en_produccion'
process.env.NODE_ENV = 'development'

const mem = newDb()
const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8')
mem.public.none(schema)
const { Pool } = mem.adapters.createPg()
const fakePool = new Pool()

mock.module('../database/conection.database.js', {
  namedExports: { db: fakePool },
})

const { default: app } = await import('../app.js')
app.listen(PORT, () =>
  console.log(`Servidor demo (DB en memoria) andando en http://localhost:${PORT}`)
)
