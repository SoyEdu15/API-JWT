import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { validateEnv } from './config/env.js'
import userRouter from './routes/user.route.js'
import petRouter from './routes/pet.routes.js'

if (process.env.NODE_ENV !== 'test') {
    validateEnv()
}

const app = express()

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Necesario para que express-rate-limit lea la IP real (X-Forwarded-For)
// cuando el server corre detras de un proxy/load balancer en produccion.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
}

app.use(helmet())
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
}

// Limita intentos de login/registro para mitigar ataques de fuerza bruta
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, msg: 'Too many attempts, please try again later' }
})

app.use('/api/v1/users/register', authLimiter)
app.use('/api/v1/users/login', authLimiter)

app.get('/api/v1/health', (req, res) => res.json({ ok: true, msg: 'API is up' }))

app.use('/api/v1/users', userRouter)
app.use('/api/v1/pets', petRouter)

app.use((req, res) => {
    res.status(404).json({ ok: false, msg: 'Route not found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ ok: false, msg: 'Internal server error' })
})

export default app
