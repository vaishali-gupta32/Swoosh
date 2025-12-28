import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_12345';

const RegisterSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6)
});

export class AuthController {

    static async register(req: Request, res: Response) {
        try {
            const { username, password } = RegisterSchema.parse(req.body);

            // Check if user exists (handled by DB constraint usually, but good to check)
            const existing = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            if (existing.rows.length > 0) {
                res.status(400).json({ error: 'Username already taken' });
                return;
            }

            const hash = await bcrypt.hash(password, 10);

            const result = await db.query(
                'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
                [username, hash]
            );

            const userId = result.rows[0].id;

            // Auto login after register? Or just return success.
            // Let's return success.
            res.status(201).json({ message: 'User registered successfully', userId });

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: (error as any).errors });
            } else {
                console.error('Register Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password required' });
                return;
            }

            const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = result.rows[0];

            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24h
            });

            res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });

        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async me(req: any, res: Response) {
        // req.user is set by middleware
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        res.json({ user: req.user });
    }

    static logout(req: Request, res: Response) {
        res.clearCookie('token');
        res.json({ message: 'Logged out' });
    }
}
