"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const urlController_1 = require("./controllers/urlController");
const rateLimiter_1 = require("./middleware/rateLimiter");
const authController_1 = require("./controllers/authController");
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
// Health Check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Auth
router.post('/api/auth/register', authController_1.AuthController.register);
router.post('/api/auth/login', authController_1.AuthController.login);
router.post('/api/auth/logout', authController_1.AuthController.logout);
router.get('/api/auth/me', auth_1.authenticate, authController_1.AuthController.me);
// Shorten URL (10 req/min/IP)
router.post('/api/shorten', (0, rateLimiter_1.rateLimiter)(10, 'shorten'), auth_1.authenticate, urlController_1.UrlController.shorten);
// Redirect (100 req/min/IP)
router.get('/:code', (0, rateLimiter_1.rateLimiter)(100, 'redirect'), urlController_1.UrlController.redirect);
exports.default = router;
