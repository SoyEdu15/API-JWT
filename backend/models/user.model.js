import { db } from '../database/conection.database.js'

const create = async ({ email, password, username }) => {
    const query = {
        text: `
        INSERT INTO users (email, password, username)
        VALUES ($1, $2, $3)
        RETURNING uid, email, username, role_id
        `,
        values: [email, password, username]
    }

    const { rows } = await db.query(query)
    return rows[0]
}

// Incluye el password: uso interno para verificar credenciales de login.
const findOneByEmail = async (email) => {
    const query = {
        text: `
        SELECT * FROM users
        WHERE email = $1
        `,
        values: [email]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

// No incluye el password: seguro para exponer al cliente.
const findAll = async () => {
    const query = {
        text: `
        SELECT uid, username, email, role_id, created_at FROM users
        ORDER BY uid ASC
        `
    }
    const { rows } = await db.query(query)
    return rows
}

// No incluye el password: seguro para exponer al cliente.
const findOneByUid = async (uid) => {
    const query = {
        text: `
        SELECT uid, username, email, role_id, created_at FROM users
        WHERE uid = $1
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const updateRoleVet = async (uid) => {
    const query = {
        text: `
        UPDATE users
        SET role_id = 2
        WHERE uid = $1
        RETURNING uid, username, email, role_id
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const updateRoleUser = async (uid) => {
    const query = {
        text: `
        UPDATE users
        SET role_id = 3
        WHERE uid = $1
        RETURNING uid, username, email, role_id
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

export const UserModel = {
    create,
    findOneByEmail,
    findAll,
    findOneByUid,
    updateRoleVet,
    updateRoleUser
}
