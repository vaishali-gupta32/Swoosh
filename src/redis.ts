import { createClient } from 'redis';
import { config } from './config';
import { InMemoryStore } from './services/store';

const USE_MEMORY = true; // process.env.USE_MEMORY === 'true';

// Mock Client
const mockRedis = {
    connect: async () => console.log('Mock Redis Connected'),
    get: async (key: string) => {
        if (key.startsWith('short:')) {
            return InMemoryStore.shortCodes.get(key.replace('short:', '')) || null;
        }
        return null;
    },
    set: async (key: string, val: string, opts?: any) => {
        // No-op for cache in memory mode, as DB is already memory
        return 'OK';
    },
    incr: async (key: string) => {
        const val = (InMemoryStore.rateLimits.get(key) || 0) + 1;
        InMemoryStore.rateLimits.set(key, val);
        return val;
    },
    expire: async (key: string, ttl: number) => {
        // Simple expiration simulation: setTimeout to delete?
        // For now, ignore expiration in memory mode to keep it simple
        return true;
    },
    xAdd: async (key: string, id: string, data: any) => {
        InMemoryStore.stream.push({ id: Date.now().toString(), message: data });
        return '1-0';
    },
    xGroupCreate: async () => true,
    xReadGroup: async () => [], // Worker won't process streams in memory mode properly unless we poll
    xAck: async () => true,
    duplicate: () => mockRedis,
    on: () => { },
    quit: async () => { }
};

export const redisClient = USE_MEMORY ? (mockRedis as any) : createClient({
    url: config.REDIS_URL
});

if (!USE_MEMORY) {
    redisClient.on('error', (err: any) => console.log('Redis Client Error', err));
}

export const redisSubscriber = USE_MEMORY ? mockRedis : redisClient.duplicate();

if (!USE_MEMORY) {
    redisSubscriber.on('error', (err: any) => console.log('Redis Subscriber Error', err));
}

export async function connectRedis() {
    if (USE_MEMORY) {
        console.log('Using In-Memory Store (Redis Mocked)');
        return;
    }
    await redisClient.connect();
    await redisSubscriber.connect();
    console.log('Redis connected');
}
