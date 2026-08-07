const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email);

export const isValidPassword = (password) =>
    typeof password === 'string' && password.length >= 6;

export const isValidUsername = (username) =>
    typeof username === 'string' && username.trim().length >= 3;
