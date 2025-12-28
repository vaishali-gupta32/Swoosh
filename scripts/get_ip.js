const https = require('https');

https.get('https://loca.lt/mytunnelpassword', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const password = data.trim();
    console.log('================================================');
    console.log('   TRUE TUNNEL PASSWORD:  ' + password);
    console.log('================================================');
    console.log('1. Copy this EXACT password.');
    console.log('2. Paste it into the website box.');
    console.log('================================================');
  });
}).on('error', (err) => {
  console.log('Could not fetch IP. Error: ' + err.message);
});
