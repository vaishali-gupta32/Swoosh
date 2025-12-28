import { db } from '../db';
import { redisClient } from '../redis';
import { encode } from './base62';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

export class UrlService {
    static async shorten(originalUrl: string, host?: string): Promise<string> {
        // 1. Insert to get ID
        const result = await db.query(
            'INSERT INTO urls (original_url) VALUES ($1) RETURNING id',
            [originalUrl]
        );
        const id = result.rows[0].id;

        // 2. Encode
        const shortCode = encode(id);

        // 3. Update with shortCode
        await db.query(
            'UPDATE urls SET short_code = $1 WHERE id = $2',
            [shortCode, id]
        );

        // 4. Cache Warm-up (Cache-Aside Pattern - Write)
        await redisClient.set(`short:${shortCode}`, originalUrl, {
            EX: CACHE_TTL
        });

        return shortCode;
    }

    static async getOriginalUrl(shortCode: string): Promise<string | null> {
        // 1. Check Cache
        const cachedUrl = await redisClient.get(`short:${shortCode}`);
        if (cachedUrl) return cachedUrl;

        // 2. Check DB
        const result = await db.query(
            'SELECT original_url FROM urls WHERE short_code = $1 AND is_active = true',
            [shortCode]
        );

        if (result.rows.length === 0) return null;

        const originalUrl = result.rows[0].original_url;

        // 3. Set Cache (Read Repair)
        await redisClient.set(`short:${shortCode}`, originalUrl, {
            EX: CACHE_TTL
        });

        return originalUrl;
    }
}
