const BASE_URL = 'http://localhost:3001';

async function test() {
    console.log('--- Testing Shortener Response ---');
    try {
        const res = await fetch(`${BASE_URL}/api/shorten`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com' })
        });

        const data = await res.json();
        console.log('Shortened URL:', data.shortUrl);

        if (data.shortUrl.startsWith('https://swoosh-link.loca.lt')) {
            console.log('SUCCESS: API returning public domain.');
        } else {
            console.error('FAILURE: API returning:', data.shortUrl);
            process.exit(1);
        }
    } catch (e) {
        console.error('Error connecting to server. Is it running?', e);
    }
}

test();
