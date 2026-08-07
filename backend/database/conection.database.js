import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL

// Creamos el pool de conexiones
export const db = new Pool({
    connectionString,
    allowExitOnIdle: true,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

const connectToDatabase = async () => {
    try {
        await db.query('SELECT NOW()')
        console.log('Database connected')
    } catch (error) {
        console.error('Error connecting to the database:', error.message)
    }
}

connectToDatabase()

const closePool = async () => {
    console.log('Closing database connection')
    await db.end()
    process.exit(0)
}

process.on('SIGINT', closePool)
process.on('SIGTERM', closePool)
