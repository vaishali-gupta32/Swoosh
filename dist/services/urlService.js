"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const db_1 = require("../db");
const redis_1 = require("../redis");
const base62_1 = require("./base62");
const CACHE_TTL = 24 * 60 * 60; // 24 hours
class UrlService {
    static async shorten(originalUrl, host) {
        // 1. Insert to get ID
        const result = await db_1.db.query('INSERT INTO urls (original_url) VALUES ($1) RETURNING id', [originalUrl]);
        const id = result.rows[0].id;
        // 2. Encode
        const shortCode = (0, base62_1.encode)(id);
        // 3. Update with shortCode
        await db_1.db.query('UPDATE urls SET short_code = $1 WHERE id = $2', [shortCode, id]);
        // 4. Cache Warm-up (Cache-Aside Pattern - Write)
        await redis_1.redisClient.set(`short:${shortCode}`, originalUrl, {
            EX: CACHE_TTL
        });
        return shortCode;
    }
    static async getOriginalUrl(shortCode) {
        // 1. Check Cache
        const cachedUrl = await redis_1.redisClient.get(`short:${shortCode}`);
        if (cachedUrl)
            return cachedUrl;
        // 2. Check DB
        const result = await db_1.db.query('SELECT original_url FROM urls WHERE short_code = $1 AND is_active = true', [shortCode]);
        if (result.rows.length === 0)
            return null;
        const originalUrl = result.rows[0].original_url;
        // 3. Set Cache (Read Repair)
        await redis_1.redisClient.set(`short:${shortCode}`, originalUrl, {
            EX: CACHE_TTL
        });
        return originalUrl;
    }
}
exports.UrlService = UrlService;
