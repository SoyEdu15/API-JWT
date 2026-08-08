import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'
import { fail, ok } from '../utils/response.js'
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators.js'
import { generateCsrfToken } from '../middlewares/csrf.middlewares.js'
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    CSRF_COOKIE,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
    csrfCookieOptions,
} from '../config/cookies.js'

const signAccessToken = (user) =>
    jwt.sign(
        { email: user.email, role_id: user.role_id, uid: user.uid },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    )

const signRefreshToken = (user) =>
    jwt.sign({ uid: user.uid }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL })

// Deja al usuario con sesion iniciada: cookie de access token (httpOnly),
// cookie de refresh token (httpOnly) y cookie CSRF (legible por JS).
const startSession = (res, user) => {
    res.cookie(ACCESS_TOKEN_COOKIE, signAccessToken(user), accessTokenCookieOptions)
    res.cookie(REFRESH_TOKEN_COOKIE, signRefreshToken(user), refreshTokenCookieOptions)
    res.cookie(CSRF_COOKIE, generateCsrfToken(), csrfCookieOptions)
}

// clearCookie solo necesita las opciones de coincidencia (path, httpOnly,
// secure, sameSite), no maxAge.
const withoutMaxAge = ({ maxAge, ...rest }) => rest

const clearSession = (res) => {
    res.clearCookie(ACCESS_TOKEN_COOKIE, withoutMaxAge(accessTokenCookieOptions))
    res.clearCookie(REFRESH_TOKEN_COOKIE, withoutMaxAge(refreshTokenCookieOptions))
    res.clearCookie(CSRF_COOKIE, withoutMaxAge(csrfCookieOptions))
}

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
            return fail(res, 'Password must be at least 8 characters long and include a letter and a number', 400)
        }

        const existing = await UserModel.findOneByEmail(email)
        if (existing) {
            return fail(res, 'Email already exists', 409)
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = await UserModel.create({ email, password: hashedPassword, username })
        startSession(res, newUser)

        return ok(res, { role_id: newUser.role_id, username: newUser.username }, 201)
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

        startSession(res, user)

        return ok(res, { role_id: user.role_id, username: user.username })
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// POST /api/v1/users/refresh
const refresh = async (req, res) => {
    try {
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE]
        if (!token) {
            return fail(res, 'Refresh token not provided', 401)
        }

        let payload
        try {
            payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        } catch (error) {
            return fail(res, 'Invalid or expired refresh token', 401)
        }

        const user = await UserModel.findOneByUid(payload.uid)
        if (!user) {
            return fail(res, 'User not found', 401)
        }

        // Rota ambos tokens en cada refresh para limitar la ventana de uso
        // de un refresh token robado.
        startSession(res, user)

        return ok(res, { role_id: user.role_id, username: user.username })
    } catch (error) {
        console.error(error)
        return fail(res, 'Internal server error', 500)
    }
}

// POST /api/v1/users/logout
const logout = async (req, res) => {
    clearSession(res)
    return ok(res, null)
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
    refresh,
    logout,
    profile,
    findAll,
    updateRoleVet,
    updateRoleUser
}
