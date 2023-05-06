import { Request } from 'express';
import { IJwtPayload } from '../types';
import jwt, { Algorithm } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || '3+@71]i-nk6Al4kZ7666kM?ka8+G&mms';
const ALGORITHM = process.env.JWT_ALGORITHM as Algorithm || 'HS256' as Algorithm;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// eslint-disable-next-line
// @ts-ignore
export function authMiddleware(req: Request): (IJwtPayload | undefined) {
    let token = req.headers.authorization || '';
    if (token.startsWith('Bearer ')) {
        token = token?.split(' ')?.pop()?.trim() || '';
    }


    if (!token || token === '') {
        return undefined;
    }

    try {
        const decoded: IJwtPayload = jwt.verify(token, SECRET, { maxAge: EXPIRES_IN, algorithms: [ALGORITHM] }) as IJwtPayload;
        return decoded;
    } catch {
        console.log('Invalid token');//NOSONAR
        return undefined;
    }
}

export function signToken(payload: IJwtPayload): string {
    return jwt.sign(payload, SECRET, { algorithm: ALGORITHM, expiresIn: EXPIRES_IN });
}
