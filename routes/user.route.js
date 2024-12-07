import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { verifyAdmin, verifyToken } from "../middlewares/jwt.middlewares.js";

const router = Router()

// api/v1/users

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/profile', verifyToken, UserController.profile)

// Admin
router.get('/', verifyToken, verifyAdmin, UserController.findAll)
router.put('/update-role-vet/:uid', verifyToken, verifyAdmin, UserController.updateRoleVet)
router.put('/update-role-users/:uid', verifyToken, verifyAdmin, UserController.updateRoleUser)

export default router;