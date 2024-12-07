
import 'dotenv/config';
import pg from 'pg';

console.log('Starting database connection');
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;



// Creamos el pool 
export const db = new Pool({
    connectionString,
    allowExitOnIdle: true,
    max: 20, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000, 
});

// Función para verificar la conexión
const connectToDatabase = async () => {
    try {
        console.log('Connecting to database');
        await db.query('SELECT NOW()'); // Consulta de prueba
        console.log("Database connected");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
};

connectToDatabase();

// Evento para cerrar el pool de conexiones cuando el proceso termina
process.on('exit', () => {
    console.log('Closing database connection');
    db.end();
});

