import { test, before, mock } from 'node:test'
import assert from 'node:assert/strict'
import { newDb } from 'pg-mem'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.JWT_SECRET = 'test_secret'
process.env.NODE_ENV = 'test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- Configura una base de datos Postgres en memoria (pg-mem) ---
const mem = newDb({ autoCreateForeignKeyIndices: true })
mem.public.registerFunction({
    name: 'now',
    implementation: () => new Date(),
})

const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8')
// Quita los INSERT de ejemplo comentados/no necesarios para el test de pets,
// pero conserva la insercion de pets de prueba (util para paginacion).
mem.public.none(schema)

const { Pool } = mem.adapters.createPg()
const fakePool = new Pool()

// Sustituye el modulo de conexion real por el pool en memoria antes de
// que cualquier modelo lo importe.
mock.module('../database/conection.database.js', {
    namedExports: { db: fakePool },
})

const { default: app } = await import('../app.js')
const { default: request } = await import('supertest')

let adminToken
let userToken
let createdUid

before(async () => {
    // Crea un usuario admin directamente en la base en memoria para probar
    // rutas protegidas sin depender de otro test.
    const bcryptjs = (await import('bcryptjs')).default
    const hashed = await bcryptjs.hash('Admin123!', 10)
    await fakePool.query(
        `INSERT INTO users (username, email, password, role_id) VALUES ($1,$2,$3,1)`,
        ['admin', 'admin@test.com', hashed]
    )
})

test('GET /api/v1/health responde ok', async () => {
    const res = await request(app).get('/api/v1/health')
    assert.equal(res.status, 200)
    assert.equal(res.body.ok, true)
})

test('POST /api/v1/users/register crea un usuario y devuelve token', async () => {
    const res = await request(app).post('/api/v1/users/register').send({
        username: 'eduard',
        email: 'eduard@test.com',
        password: 'secret123',
    })
    assert.equal(res.status, 201)
    assert.equal(res.body.ok, true)
    assert.ok(res.body.msg.token)
    assert.equal(res.body.msg.role_id, 3)
    userToken = res.body.msg.token
})

test('POST /api/v1/users/register rechaza email duplicado', async () => {
    const res = await request(app).post('/api/v1/users/register').send({
        username: 'eduard2',
        email: 'eduard@test.com',
        password: 'secret123',
    })
    assert.equal(res.status, 409)
    assert.equal(res.body.ok, false)
})

test('POST /api/v1/users/register valida campos', async () => {
    const res = await request(app).post('/api/v1/users/register').send({
        username: 'ab',
        email: 'not-an-email',
        password: '123',
    })
    assert.equal(res.status, 400)
})

test('POST /api/v1/users/login falla con credenciales invalidas', async () => {
    const res = await request(app).post('/api/v1/users/login').send({
        email: 'eduard@test.com',
        password: 'wrongpass',
    })
    assert.equal(res.status, 401)
})

test('POST /api/v1/users/login funciona con credenciales validas', async () => {
    const res = await request(app).post('/api/v1/users/login').send({
        email: 'admin@test.com',
        password: 'Admin123!',
    })
    assert.equal(res.status, 200)
    assert.ok(res.body.msg.token)
    assert.equal(res.body.msg.role_id, 1)
    adminToken = res.body.msg.token
})

test('GET /api/v1/users/profile requiere token', async () => {
    const res = await request(app).get('/api/v1/users/profile')
    assert.equal(res.status, 401)
})

test('GET /api/v1/users/profile devuelve datos sin password', async () => {
    const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.msg.email, 'eduard@test.com')
    assert.equal('password' in res.body.msg, false)
})

test('GET /api/v1/users es solo para admin', async () => {
    const forbidden = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`)
    assert.equal(forbidden.status, 403)

    const allowed = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
    assert.equal(allowed.status, 200)
    assert.ok(Array.isArray(allowed.body.msg))
    assert.equal(allowed.body.msg.some((u) => 'password' in u), false)
    createdUid = allowed.body.msg.find((u) => u.email === 'eduard@test.com').uid
})

test('PUT /api/v1/users/update-role-vet/:uid promueve a vet', async () => {
    const res = await request(app)
        .put(`/api/v1/users/update-role-vet/${createdUid}`)
        .set('Authorization', `Bearer ${adminToken}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.msg.role_id, 2)
})

test('GET /api/v1/pets pagina resultados', async () => {
    const res = await request(app)
        .get('/api/v1/pets?limit=2&page=1')
        .set('Authorization', `Bearer ${adminToken}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.msg.length, 2)
    assert.equal(res.body.pagination.limit, 2)
    assert.ok(res.body.pagination.nextPage)
})

test('POST /api/v1/pets requiere rol vet o admin', async () => {
    const res = await request(app)
        .post('/api/v1/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Bobby', species: 'Perro', breed: 'Poodle', age: 1 })
    assert.equal(res.status, 201)
    assert.equal(res.body.msg.name, 'Bobby')
})

test('DELETE /api/v1/pets/:id elimina la mascota', async () => {
    const list = await request(app)
        .get('/api/v1/pets?limit=100&page=1')
        .set('Authorization', `Bearer ${adminToken}`)
    const target = list.body.msg.find((p) => p.name === 'Bobby')

    const res = await request(app)
        .delete(`/api/v1/pets/${target.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
    assert.equal(res.status, 200)
})

test('Ruta inexistente devuelve 404 con formato consistente', async () => {
    const res = await request(app).get('/api/v1/no-existe')
    assert.equal(res.status, 404)
    assert.equal(res.body.ok, false)
})
