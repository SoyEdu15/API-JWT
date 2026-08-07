import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'
import { fail, ok } from '../utils/response.js'
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators.js'

const signToken = (user) =>
    jwt.sign(
        { email: user.email, role_id: user.role_id, uid: user.uid },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )

// POST /api/v1/users/register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return fail(res, 'Missing required fields: username, email, password', 400)
        }
        if (!isValidUsername(username)) {
            return fail(res, 'Username must be at least 3 characters long', 400)
        }
        if (!isValidEmail(email)) {
            return fail(res, 'Invalid email format', 400)
        }
        if (!isValidPassword(password)) {
            return fail(res, 'Password must be at least 6 characters long', 400)
        }

        const existing = await UserModel.findOneByEmail(email)
        if (existing) {
            return fail(res, 'Email already exists', 409)
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = await UserModel.create({ email, password: hashedPassword, username })
        const token = signToken(newUser)

        return ok(res, { token, role_id: newUser.role_id, username: newUser.username }, 201)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// POST /api/v1/users/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return fail(res, 'Missing required fields: email, password', 400)
        }

        const user = await UserModel.findOneByEmail(email)
        if (!user) {
            return fail(res, 'Invalid credentials', 401)
        }

        const isMatch = await bcryptjs.compare(password, user.password)
        if (!isMatch) {
            return fail(res, 'Invalid credentials', 401)
        }

        const token = signToken(user)

        return ok(res, { token, role_id: user.role_id, username: user.username })
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// GET /api/v1/users/profile
const profile = async (req, res) => {
    try {
        const user = await UserModel.findOneByUid(req.uid)
        if (!user) {
            return fail(res, 'User not found', 404)
        }
        return ok(res, user)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// GET /api/v1/users
const findAll = async (req, res) => {
    try {
        const users = await UserModel.findAll()
        return ok(res, users)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// PUT /api/v1/users/update-role-vet/:uid
const updateRoleVet = async (req, res) => {
    try {
        const { uid } = req.params

        const user = await UserModel.findOneByUid(uid)
        if (!user) {
            return fail(res, 'User not found', 404)
        }

        const updatedUser = await UserModel.updateRoleVet(uid)
        return ok(res, updatedUser)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// PUT /api/v1/users/update-role-user/:uid
const updateRoleUser = async (req, res) => {
    try {
        const { uid } = req.params

        const user = await UserModel.findOneByUid(uid)
        if (!user) {
            return fail(res, 'User not found', 404)
        }

        const updatedUser = await UserModel.updateRoleUser(uid)
        return ok(res, updatedUser)
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

export const UserController = {
    register,
    login,
    profile,
    findAll,
    updateRoleVet,
    updateRoleUser
}
