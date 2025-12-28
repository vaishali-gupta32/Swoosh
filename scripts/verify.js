const http = require('http');

function post(data) {
    const postData = JSON.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/shorten',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('BODY: ' + body);
            try {
                const json = JSON.parse(body);
                if (json.shortCode) {
                    get(json.shortCode);
                }
            } catch (e) { console.error('Failed to parse response'); }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

function get(code) {
    http.get(`http://localhost:3000/${code}`, (res) => {
        console.log(`REDIRECT STATUS: ${res.statusCode}`);
        console.log(`LOCATION: ${res.headers.location}`);
        // Consuming response to free memory
        res.resume();
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

console.log('Verifying Shortener...');
post({ url: 'https://www.google.com' });
