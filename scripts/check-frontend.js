const http = require('http');

console.log('Checking GET / ...');
http.get('http://localhost:3000/', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (data.includes('<!DOCTYPE html>')) {
            console.log('SUCCESS: HTML Received');
            console.log(data.substring(0, 100));
        } else {
            console.log('FAILURE: Response is not HTML');
            console.log(data.substring(0, 100));
        }
    });
}).on('error', err => console.error(err));
