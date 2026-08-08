import crypto from 'node:crypto'
import { fail } from '../utils/response.js'
import { CSRF_COOKIE, CSRF_HEADER } from '../config/cookies.js'

export const generateCsrfToken = () => crypto.randomBytes(24).toString('hex')

// Patron double-submit: el cookie CSRF no es httpOnly, asi que solo un script
// que corre en nuestro propio origen puede leerlo y reenviarlo en el header.
// Un sitio atacante puede hacer que el navegador adjunte el cookie de sesion,
// pero no puede leer su valor ni el del cookie CSRF para copiarlo al header.
export const verifyCsrf = (req, res, next) => {
    const cookieToken = req.cookies?.[CSRF_COOKIE]
    const headerToken = req.headers[CSRF_HEADER]

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return fail(res, 'Invalid or missing CSRF token', 403)
    }
    next()
}
