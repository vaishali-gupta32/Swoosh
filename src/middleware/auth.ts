import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_12345';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        username: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Not authenticated, but simple pass through? 
        // If the route strictly requires auth, it should check 'req.user' or use a stricter middleware.
        // For now, let's just populate req.user if valid, and let controller decide.
        // BUT if I want to enforce it, I should have ensureAuth.
        // Let's make this populate if possible, else nothing.
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (e) {
        // Invalid token
        next();
    }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return
    }
    next();
};
