import { redisClient } from '../redis';

const STREAM_KEY = 'stream:analytics';

export interface ClickEvent {
    shortCode: string;
    ip: string;
    userAgent: string;
    referer: string;
    timestamp: string;
}

export class AnalyticsService {
    static async logClick(event: ClickEvent): Promise<void> {
        try {
            await redisClient.xAdd(STREAM_KEY, '*', {
                shortCode: event.shortCode,
                ip: event.ip,
                userAgent: event.userAgent,
                referer: event.referer,
                timestamp: event.timestamp
            });
        } catch (error) {
            console.error('Failed to log click event:', error);
            // Fail open: don't block redirect if analytics fails
        }
    }
}
