"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const redis_1 = require("../redis");
const STREAM_KEY = 'stream:analytics';
class AnalyticsService {
    static async logClick(event) {
        try {
            await redis_1.redisClient.xAdd(STREAM_KEY, '*', {
                shortCode: event.shortCode,
                ip: event.ip,
                userAgent: event.userAgent,
                referer: event.referer,
                timestamp: event.timestamp
            });
        }
        catch (error) {
            console.error('Failed to log click event:', error);
            // Fail open: don't block redirect if analytics fails
        }
    }
}
exports.AnalyticsService = AnalyticsService;
