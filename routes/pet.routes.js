import { Router } from "express";
import { PetController } from "../controllers/pet.controller.js";
import { verifyToken, verifyVet } from "../middlewares/jwt.middlewares.js";

const router = Router()

// /api/v1/pets
router.get('/', verifyToken, verifyVet, PetController.findAll)

export default router;