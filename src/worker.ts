import { redisClient } from './redis';
import { db } from './db';
import os from 'os';

const STREAM_KEY = 'stream:analytics';
const GROUP_NAME = 'analytics_group';
const CONSUMER_NAME = `worker:${os.hostname()}:${process.pid}`;

async function setupConsumerGroup() {
    try {
        await redisClient.xGroupCreate(STREAM_KEY, GROUP_NAME, '$', { MKSTREAM: true });
        console.log(`Created consumer group ${GROUP_NAME}`);
    } catch (error: any) {
        if (error.message.includes('BUSYGROUP')) {
            // Group already exists, ignore
        } else {
            console.error('Error creating consumer group:', error);
        }
    }
}

async function processMessages(messages: any[]) {
    if (messages.length === 0) return;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Batch Insert
        const queryText = `
      INSERT INTO analytics (short_code, ip_address, user_agent, referer, timestamp)
      VALUES ($1, $2, $3, $4, $5)
    `;

        for (const message of messages) {
            const id = message.id;
            const data = message.message;

            await client.query(queryText, [
                data.shortCode,
                data.ip,
                data.userAgent,
                data.referer,
                data.timestamp
            ]);

            await redisClient.xAck(STREAM_KEY, GROUP_NAME, id);
        }

        await client.query('COMMIT');
        console.log(`Processed ${messages.length} events`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing batch:', error);
    } finally {
        client.release();
    }
}

async function startWorker() {
    await redisClient.connect();
    console.log('Worker connected to Redis');

    await setupConsumerGroup();

    while (true) {
        try {
            // Read new messages
            const response = await redisClient.xReadGroup(
                GROUP_NAME,
                CONSUMER_NAME,
                [{ key: STREAM_KEY, id: '>' }],
                { COUNT: 10, BLOCK: 5000 }
            );

            if (response && (response as any).length > 0) {
                const streamData = (response as any)[0];
                // transform to flat array of { id, message }
                const messages = streamData.messages;
                await processMessages(messages);
            }
        } catch (error) {
            console.error('Worker loop error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

startWorker();
