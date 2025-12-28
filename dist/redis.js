"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisSubscriber = exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const config_1 = require("./config");
const store_1 = require("./services/store");
const USE_MEMORY = true; // process.env.USE_MEMORY === 'true';
// Mock Client
const mockRedis = {
    connect: async () => console.log('Mock Redis Connected'),
    get: async (key) => {
        if (key.startsWith('short:')) {
            return store_1.InMemoryStore.shortCodes.get(key.replace('short:', '')) || null;
        }
        return null;
    },
    set: async (key, val, opts) => {
        // No-op for cache in memory mode, as DB is already memory
        return 'OK';
    },
    incr: async (key) => {
        const val = (store_1.InMemoryStore.rateLimits.get(key) || 0) + 1;
        store_1.InMemoryStore.rateLimits.set(key, val);
        return val;
    },
    expire: async (key, ttl) => {
        // Simple expiration simulation: setTimeout to delete?
        // For now, ignore expiration in memory mode to keep it simple
        return true;
    },
    xAdd: async (key, id, data) => {
        store_1.InMemoryStore.stream.push({ id: Date.now().toString(), message: data });
        return '1-0';
    },
    xGroupCreate: async () => true,
    xReadGroup: async () => [], // Worker won't process streams in memory mode properly unless we poll
    xAck: async () => true,
    duplicate: () => mockRedis,
    on: () => { },
    quit: async () => { }
};
exports.redisClient = USE_MEMORY ? mockRedis : (0, redis_1.createClient)({
    url: config_1.config.REDIS_URL
});
if (!USE_MEMORY) {
    exports.redisClient.on('error', (err) => console.log('Redis Client Error', err));
}
exports.redisSubscriber = USE_MEMORY ? mockRedis : exports.redisClient.duplicate();
if (!USE_MEMORY) {
    exports.redisSubscriber.on('error', (err) => console.log('Redis Subscriber Error', err));
}
async function connectRedis() {
    if (USE_MEMORY) {
        console.log('Using In-Memory Store (Redis Mocked)');
        return;
    }
    await exports.redisClient.connect();
    await exports.redisSubscriber.connect();
    console.log('Redis connected');
}
