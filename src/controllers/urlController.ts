import { Request, Response } from 'express';
import { UrlService } from '../services/urlService';
import { AnalyticsService } from '../services/analytics';
import { z } from 'zod';
import { config } from '../config';

export class UrlController {

    static async shorten(req: Request, res: Response) {
        try {
            const schema = z.object({
                url: z.string().url()
            });

            const { url } = schema.parse(req.body);

            // Use configured BASE_URL (public domain)
            const baseUrl = config.BASE_URL;

            const shortCode = await UrlService.shorten(url);

            res.status(201).json({
                shortCode,
                shortUrl: `${baseUrl}/${shortCode}`
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Invalid URL format' });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    static async redirect(req: Request, res: Response) {
        try {
            const { code } = req.params;
            const longUrl = await UrlService.getOriginalUrl(code);

            if (!longUrl) {
                res.status(404).json({ error: 'URL not found' });
                return;
            }

            // Async Analytics (Fire and Forget)
            AnalyticsService.logClick({
                shortCode: code,
                ip: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                referer: req.get('Referer') || 'direct',
                timestamp: new Date().toISOString()
            });

            res.redirect(302, longUrl);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
