import crypto from 'crypto';

/**
 * Generates a secure, random hexadecimal token.
 * Useful for one-time links, email verification codes, or API keys.
 */
export const generateRandomToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generates a 6-digit numeric OTP (One Time Password).
 */
export const generateNumericOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};