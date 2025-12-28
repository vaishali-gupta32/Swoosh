"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.db = void 0;
const pg_1 = require("pg");
const config_1 = require("../config");
const store_1 = require("../services/store");
const USE_MEMORY = true; // process.env.USE_MEMORY === 'true';
let pool;
if (!USE_MEMORY) {
    exports.pool = pool = new pg_1.Pool({
        connectionString: config_1.config.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
    });
}
exports.db = {
    query: async (text, params = []) => {
        if (USE_MEMORY) {
            // Mock SQL Logic
            if (text.includes('INSERT INTO urls')) {
                const id = store_1.InMemoryStore.idCounter++;
                const originalUrl = params[0];
                // Only return ID if requested
                return { rows: [{ id }] };
            }
            if (text.includes('UPDATE urls SET short_code')) {
                const shortCode = params[0];
                const id = params[1];
                const record = store_1.InMemoryStore.urls.get(id); // Wait, we didn't save it in INSERT?
                // Fix: In INSERT we need to save the ID -> URL mapping temporarily? 
                // Actually, we can just save it now if we had the original URL.
                // But the INSERT query above didn't save to map because I missed it in previous thought.
                // Let's fix the INSERT logic:
            }
        }
        return pool.query(text, params);
    },
    connect: async () => {
        if (USE_MEMORY)
            return {
                query: exports.db.query,
                release: () => { },
                on: () => { }
            };
        return pool.connect();
    }
};
// Re-implement query logic properly
exports.db.query = async (text, params = []) => {
    if (USE_MEMORY) {
        if (text.includes('INSERT INTO urls')) {
            const id = store_1.InMemoryStore.idCounter++;
            const originalUrl = params[0];
            store_1.InMemoryStore.urls.set(id, { id, original_url: originalUrl });
            return { rows: [{ id }] };
        }
        if (text.includes('UPDATE urls SET short_code')) {
            const shortCode = params[0];
            const id = params[1];
            const record = store_1.InMemoryStore.urls.get(id);
            if (record) {
                record.short_code = shortCode;
                store_1.InMemoryStore.shortCodes.set(shortCode, record.original_url);
            }
            return { rowCount: 1 };
        }
        if (text.includes('SELECT original_url FROM urls')) {
            const shortCode = params[0];
            const originalUrl = store_1.InMemoryStore.shortCodes.get(shortCode);
            return { rows: originalUrl ? [{ original_url: originalUrl }] : [] };
        }
        if (text.includes('INSERT INTO analytics')) {
            store_1.InMemoryStore.analytics.push({
                short_code: params[0],
                ip_address: params[1],
                user_agent: params[2],
                referer: params[3],
                timestamp: params[4]
            });
            return { rowCount: 1 };
        }
        // --- Mock User Queries ---
        if (text.includes('INSERT INTO users')) {
            const username = params[0];
            const password = params[1];
            if (store_1.InMemoryStore.userByUsername.has(username)) {
                throw new Error('User already exists'); // Emulate DB constraint
            }
            const id = store_1.InMemoryStore.userIdCounter++;
            const newUser = { id, username, password_hash: password, created_at: new Date() };
            store_1.InMemoryStore.users.set(id, newUser);
            store_1.InMemoryStore.userByUsername.set(username, newUser);
            return { rows: [{ id }] };
        }
        if (text.includes('SELECT * FROM users WHERE username')) {
            const username = params[0];
            const user = store_1.InMemoryStore.userByUsername.get(username);
            return { rows: user ? [user] : [] };
        }
        if (text.includes('SELECT * FROM users WHERE id')) {
            const id = parseInt(params[0]);
            const user = store_1.InMemoryStore.users.get(id);
            return { rows: user ? [user] : [] };
        }
        return { rows: [] };
    }
    return pool.query(text, params);
};
