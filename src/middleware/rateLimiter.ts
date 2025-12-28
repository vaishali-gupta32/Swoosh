import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../redis';

const RATE_LIMIT_WINDOW = 60; // 1 minute

export const rateLimiter = (limit: number, type: 'shorten' | 'redirect') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const key = `rate_limit:${type}:${ip}`;

            const currentParams = await redisClient.incr(key);

            if (currentParams === 1) {
                await redisClient.expire(key, RATE_LIMIT_WINDOW);
            }

            if (currentParams > limit) {
                res.status(429).json({ error: 'Too many requests, please try again later.' });
                return;
            }

            next();
        } catch (error) {
            console.error('Rate Limiter Error:', error);
            // Fail open to avoid blocking legitimate traffic on redis failure
            next();
        }
    };
};
