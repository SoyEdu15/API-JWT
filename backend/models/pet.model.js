import { db } from '../database/conection.database.js'

const count = async () => {
    const query = {
        text: 'SELECT COUNT(*) FROM pets'
    }
    const { rows } = await db.query(query)
    return parseInt(rows[0].count, 10)
}

const findAll = async ({ limit = 5, page = 1 }) => {
    const offset = (page - 1) * limit

    const query = {
        text: `
        SELECT * FROM pets
        ORDER BY id ASC
        LIMIT $1
        OFFSET $2
        `,
        values: [limit, offset]
    }
    const { rows } = await db.query(query)
    return rows
}

const findById = async (id) => {
    const query = {
        text: 'SELECT * FROM pets WHERE id = $1',
        values: [id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const create = async ({ name, species, breed, age, owner_name, image_url, created_by }) => {
    const query = {
        text: `
        INSERT INTO pets (name, species, breed, age, owner_name, image_url, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        values: [name, species, breed ?? null, age ?? null, owner_name ?? null, image_url ?? null, created_by ?? null]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const update = async (id, { name, species, breed, age, owner_name, image_url }) => {
    const query = {
        text: `
        UPDATE pets
        SET name = COALESCE($2, name),
            species = COALESCE($3, species),
            breed = COALESCE($4, breed),
            age = COALESCE($5, age),
            owner_name = COALESCE($6, owner_name),
            image_url = COALESCE($7, image_url)
        WHERE id = $1
        RETURNING *
        `,
        values: [id, name ?? null, species ?? null, breed ?? null, age ?? null, owner_name ?? null, image_url ?? null]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const remove = async (id) => {
    const query = {
        text: 'DELETE FROM pets WHERE id = $1 RETURNING id',
        values: [id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

export const PetModel = {
    findAll,
    findById,
    count,
    create,
    update,
    remove
}
