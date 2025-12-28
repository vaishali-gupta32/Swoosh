"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_12345';
const authenticate = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        // Not authenticated, but simple pass through? 
        // If the route strictly requires auth, it should check 'req.user' or use a stricter middleware.
        // For now, let's just populate req.user if valid, and let controller decide.
        // BUT if I want to enforce it, I should have ensureAuth.
        // Let's make this populate if possible, else nothing.
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (e) {
        // Invalid token
        next();
    }
};
exports.authenticate = authenticate;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
