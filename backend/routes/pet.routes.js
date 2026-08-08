import { Router } from 'express'
import { PetController } from '../controllers/pet.controller.js'
import { verifyToken, verifyVet } from '../middlewares/jwt.middlewares.js'
import { verifyCsrf } from '../middlewares/csrf.middlewares.js'

const router = Router()

// /api/v1/pets
router.get('/', verifyToken, PetController.findAll)
router.get('/:id', verifyToken, PetController.findOne)
router.post('/', verifyToken, verifyVet, verifyCsrf, PetController.create)
router.put('/:id', verifyToken, verifyVet, verifyCsrf, PetController.update)
router.delete('/:id', verifyToken, verifyVet, verifyCsrf, PetController.remove)

export default router
