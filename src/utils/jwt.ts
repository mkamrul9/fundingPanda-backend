import jwt, { JwtPayload, SignOptions, Secret } from 'jsonwebtoken';

export const signToken = (
    payload: Record<string, unknown> | string,
    secret: Secret,
    expiresIn: string
) => {
    // Accept string or number for expiresIn to match runtime usage and available typings
    const options = { expiresIn } as SignOptions & { expiresIn?: string | number };
    return jwt.sign(payload as string | JwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
};