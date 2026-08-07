import { PetModel } from '../models/pet.model.js'
import { fail, ok } from '../utils/response.js'

// GET /api/v1/pets
const findAll = async (req, res) => {
    try {
        let { limit = 5, page = 1 } = req.query
        limit = +limit
        page = +page

        if (!Number.isInteger(limit) || !Number.isInteger(page) || page < 1 || limit < 1 || limit > 100) {
            return fail(res, 'Invalid pagination queries', 400)
        }

        const count = await PetModel.count()
        const pets = await PetModel.findAll({ limit, page })

        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/pets`
        const baseUrlWithQueries = `${baseUrl}?limit=${limit}`

        const totalPages = Math.max(Math.ceil(count / limit), 1)
        const nextPage = page + 1 > totalPages ? null : `${baseUrlWithQueries}&page=${page + 1}`
        const prevPage = page - 1 < 1 ? null : `${baseUrlWithQueries}&page=${page - 1}`

        return res.json({
            ok: true,
            pagination: {
                count,
                totalPages,
                nextPage,
                prevPage,
                currentPage: page,
                limit
            },
            msg: pets
        })
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// GET /api/v1/pets/:id
const findOne = async (req, res) => {
    try {
        const { id } = req.params
        const pet = await PetModel.findById(id)
        if (!pet) {
            return fail(res, 'Pet not found', 404)
        }
        return ok(res, pet)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// POST /api/v1/pets
const create = async (req, res) => {
    try {
        const { name, species, breed, age, owner_name, image_url } = req.body

        if (!name || !species) {
            return fail(res, 'Missing required fields: name, species', 400)
        }

        const pet = await PetModel.create({
            name,
            species,
            breed,
            age,
            owner_name,
            image_url,
            created_by: req.uid
        })

        return ok(res, pet, 201)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// PUT /api/v1/pets/:id
const update = async (req, res) => {
    try {
        const { id } = req.params
        const existing = await PetModel.findById(id)
        if (!existing) {
            return fail(res, 'Pet not found', 404)
        }

        const pet = await PetModel.update(id, req.body)
        return ok(res, pet)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// DELETE /api/v1/pets/:id
const remove = async (req, res) => {
    try {
        const { id } = req.params
        const existing = await PetModel.findById(id)
        if (!existing) {
            return fail(res, 'Pet not found', 404)
        }

        await PetModel.remove(id)
        return ok(res, { id: Number(id) })
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

export const PetController = {
    findAll,
    findOne,
    create,
    update,
    remove
}
