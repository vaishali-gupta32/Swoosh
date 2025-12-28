"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const redis_1 = require("./redis");
const routes_1 = __importDefault(require("./routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const path_1 = __importDefault(require("path"));
// Routes
const staticPath = path_1.default.join(__dirname, '../public');
console.log(`Serving static files from: ${staticPath}`);
app.use(express_1.default.static(staticPath));
// Explicit fallback for root to ensure index.html is served
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(staticPath, 'index.html'));
});
app.use('/', routes_1.default);
// Config
const PORT = parseInt(config_1.config.PORT, 10);
async function startServer() {
    try {
        await (0, redis_1.connectRedis)();
    }
    catch (e) {
        console.warn('Redis connection failed (Ignored due to potential In-Memory mode)', e);
    }
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
    // Graceful Shutdown
    const shutdown = async () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Keep running if possible, or restart logic (for now just log so user sees it)
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
startServer();
