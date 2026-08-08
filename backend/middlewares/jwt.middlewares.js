import jwt from 'jsonwebtoken'
import { ROLES } from '../constants/roles.js'
import { fail } from '../utils/response.js'
import { ACCESS_TOKEN_COOKIE } from '../config/cookies.js'

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE]

    if (!token) {
        return fail(res, 'Token not provided', 401)
    }

    try {
        const { email, role_id, uid } = jwt.verify(token, process.env.JWT_SECRET)
        req.email = email
        req.role_id = role_id
        req.uid = uid
        next()
    } catch (error) {
        return fail(res, 'Invalid or expired token', 401)
    }
}

export const verifyAdmin = (req, res, next) => {
    if (req.role_id === ROLES.ADMIN) {
        return next()
    }
    return fail(res, 'Unauthorized: admin role required', 403)
}

export const verifyVet = (req, res, next) => {
    if (req.role_id === ROLES.VET || req.role_id === ROLES.ADMIN) {
        return next()
    }
    return fail(res, 'Unauthorized: vet role required', 403)
}
