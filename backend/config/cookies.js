const isProd = process.env.NODE_ENV === 'production'

export const ACCESS_TOKEN_COOKIE = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'
export const CSRF_COOKIE = 'csrf_token'
export const CSRF_HEADER = 'x-csrf-token'

export const ACCESS_TOKEN_TTL = '15m'
export const REFRESH_TOKEN_TTL = '7d'
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
}

export const accessTokenCookieOptions = { ...base, maxAge: ACCESS_TOKEN_MAX_AGE_MS }
export const refreshTokenCookieOptions = { ...base, maxAge: REFRESH_TOKEN_MAX_AGE_MS }

// Legible por JS a proposito: el frontend lo copia a un header (patron
// double-submit) para probar que la peticion viene del propio sitio.
export const csrfCookieOptions = { ...base, httpOnly: false, maxAge: REFRESH_TOKEN_MAX_AGE_MS }
