// Falla rapido si el proceso arranca con secretos ausentes o de ejemplo,
// en vez de dejar que el server corra "seguro en apariencia".
const INSECURE_VALUES = new Set([
    'cambia_esta_clave_super_secreta',
    'cambia_esta_clave_de_refresh_tambien',
])
const MIN_SECRET_LENGTH = 16

const assertSecret = (name) => {
    const value = process.env[name]
    if (!value || value.length < MIN_SECRET_LENGTH || INSECURE_VALUES.has(value)) {
        throw new Error(
            `Missing or insecure ${name}: set a random string of at least ${MIN_SECRET_LENGTH} characters in your .env`
        )
    }
}

export const validateEnv = () => {
    assertSecret('JWT_SECRET')
    assertSecret('JWT_REFRESH_SECRET')
}
