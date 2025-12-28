import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
    const dbConfig = {
        user: 'postgres', // Default postgres user
        password: '', // Try empty password
        host: 'localhost',
        port: 5432,
    };

    // 1. Connect to default 'postgres' database to create the new DB
    console.log('Connecting to default postgres database...');
    const rootClient = new Client({ ...dbConfig, database: 'postgres' });

    try {
        await rootClient.connect();

        // Check if database exists
        const res = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'urlshortener'");
        if (res.rowCount === 0) {
            console.log('Creating database "urlshortener"...');
            await rootClient.query('CREATE DATABASE urlshortener');
        } else {
            console.log('Database "urlshortener" already exists.');
        }
    } catch (err: any) {
        if (err.code === '28P01') {
            console.error('Authentication failed. Please check your Postgres credentials.');
            console.error('Update .env or src/config.ts if you have a custom password.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Could not connect to PostgreSQL at localhost:5432.');
            console.error('Please ensure the PostgreSQL service is running on your machine.');
        } else {
            console.error('Error creating database:', err);
        }
        process.exit(1);
    } finally {
        await rootClient.end();
    }

    // 2. Connect to the new database and run schema
    console.log('Applying schema to "urlshortener"...');
    const appClient = new Client({ ...dbConfig, database: 'urlshortener' });

    try {
        await appClient.connect();
        const schemaPath = path.join(__dirname, '../src/db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await appClient.query(schemaSql);
        console.log('Schema applied successfully.');
    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    } finally {
        await appClient.end();
    }
}

initDB();
