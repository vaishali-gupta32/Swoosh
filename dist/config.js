"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    DATABASE_URL: zod_1.z.string().default('postgres://user:password@localhost:5432/urlshortener'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    BASE_URL: zod_1.z.string().default('https://swoosh-link.loca.lt'),
    NODE_ENV: zod_1.z.string().default('development'),
});
exports.config = envSchema.parse(process.env);
