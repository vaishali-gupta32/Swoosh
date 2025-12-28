import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().default('postgres://user:password@localhost:5432/urlshortener'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    BASE_URL: z.string().default('https://swoosh-link.loca.lt'),
    NODE_ENV: z.string().default('development'),
});

export const config = envSchema.parse(process.env);
