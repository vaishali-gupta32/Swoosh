"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const redis_1 = require("../redis");
const RATE_LIMIT_WINDOW = 60; // 1 minute
const rateLimiter = (limit, type) => {
    return async (req, res, next) => {
        try {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const key = `rate_limit:${type}:${ip}`;
            const currentParams = await redis_1.redisClient.incr(key);
            if (currentParams === 1) {
                await redis_1.redisClient.expire(key, RATE_LIMIT_WINDOW);
            }
            if (currentParams > limit) {
                res.status(429).json({ error: 'Too many requests, please try again later.' });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Rate Limiter Error:', error);
            // Fail open to avoid blocking legitimate traffic on redis failure
            next();
        }
    };
};
exports.rateLimiter = rateLimiter;
