import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { verifyAdmin, verifyToken } from '../middlewares/jwt.middlewares.js'
import { verifyCsrf } from '../middlewares/csrf.middlewares.js'

const router = Router()

// /api/v1/users
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/refresh', UserController.refresh)
router.post('/logout', UserController.logout)
router.get('/profile', verifyToken, UserController.profile)

// Admin
router.get('/', verifyToken, verifyAdmin, UserController.findAll)
router.put('/update-role-vet/:uid', verifyToken, verifyAdmin, verifyCsrf, UserController.updateRoleVet)
router.put('/update-role-user/:uid', verifyToken, verifyAdmin, verifyCsrf, UserController.updateRoleUser)

export default router
