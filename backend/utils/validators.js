const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Al menos 8 caracteres, con una letra y un numero.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email);

export const isValidPassword = (password) =>
    typeof password === 'string' && PASSWORD_REGEX.test(password);

export const isValidUsername = (username) =>
    typeof username === 'string' && username.trim().length >= 3;
