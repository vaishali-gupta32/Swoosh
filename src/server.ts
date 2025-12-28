import express from 'express';
import { config } from './config';
import { connectRedis } from './redis';
import router from './routes';

import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

import path from 'path';

// Routes
const staticPath = path.join(__dirname, '../public');
console.log(`Serving static files from: ${staticPath}`);

app.use(express.static(staticPath));

// Explicit fallback for root to ensure index.html is served
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.use('/', router);

// Config
const PORT = parseInt(config.PORT, 10);

async function startServer() {
    try {
        await connectRedis();
    } catch (e) {
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
