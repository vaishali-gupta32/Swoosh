import { Router } from 'express';
import { UrlController } from './controllers/urlController';
import { rateLimiter } from './middleware/rateLimiter';

import { AuthController } from './controllers/authController';
import { authenticate } from './middleware/auth';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Auth
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);
router.post('/api/auth/logout', AuthController.logout);
router.get('/api/auth/me', authenticate, AuthController.me);

// Shorten URL (10 req/min/IP)
router.post('/api/shorten', rateLimiter(10, 'shorten'), authenticate, UrlController.shorten);

// Redirect (100 req/min/IP)
router.get('/:code', rateLimiter(100, 'redirect'), UrlController.redirect);

export default router;
