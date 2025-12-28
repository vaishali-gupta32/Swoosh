"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlController = void 0;
const urlService_1 = require("../services/urlService");
const analytics_1 = require("../services/analytics");
const zod_1 = require("zod");
const config_1 = require("../config");
class UrlController {
    static async shorten(req, res) {
        try {
            const schema = zod_1.z.object({
                url: zod_1.z.string().url()
            });
            const { url } = schema.parse(req.body);
            // Use configured BASE_URL (public domain)
            const baseUrl = config_1.config.BASE_URL;
            const shortCode = await urlService_1.UrlService.shorten(url);
            res.status(201).json({
                shortCode,
                shortUrl: `${baseUrl}/${shortCode}`
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: 'Invalid URL format' });
            }
            else {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    static async redirect(req, res) {
        try {
            const { code } = req.params;
            const longUrl = await urlService_1.UrlService.getOriginalUrl(code);
            if (!longUrl) {
                res.status(404).json({ error: 'URL not found' });
                return;
            }
            // Async Analytics (Fire and Forget)
            analytics_1.AnalyticsService.logClick({
                shortCode: code,
                ip: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                referer: req.get('Referer') || 'direct',
                timestamp: new Date().toISOString()
            });
            res.redirect(302, longUrl);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.UrlController = UrlController;
