import { Router } from 'express'
import { PetController } from '../controllers/pet.controller.js'
import { verifyToken, verifyVet } from '../middlewares/jwt.middlewares.js'

const router = Router()

// /api/v1/pets
router.get('/', verifyToken, PetController.findAll)
router.get('/:id', verifyToken, PetController.findOne)
router.post('/', verifyToken, verifyVet, PetController.create)
router.put('/:id', verifyToken, verifyVet, PetController.update)
router.delete('/:id', verifyToken, verifyVet, PetController.remove)

export default router
