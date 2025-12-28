const BASE_URL = 'http://localhost:3001';

async function test() {
    console.log('--- Starting Auth Verification (JS) ---');
    const username = `testuser_${Date.now()}`;
    const password = 'password123';

    // 1. Register
    console.log(`1. Registering user: ${username}`);
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!regRes.ok) {
        console.error('Registration failed:', await regRes.text());
        process.exit(1);
    }
    console.log('   Registration Success');

    // 2. Login
    console.log(`2. Logging in`);
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        process.exit(1);
    }

    const loginData = await loginRes.json();
    console.log('   Login Success. Token received.');
    const token = loginData.token;

    // 3. Check /me
    console.log(`3. Checking /me with token`);
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!meRes.ok) {
        console.error('/me check failed:', await meRes.text());
        process.exit(1);
    }

    const meData = await meRes.json();
    console.log(`   User verified: ${meData.user.username}`);

    if (meData.user.username !== username) {
        console.error('Username mismatch!');
        process.exit(1);
    }

    // 4. Logout
    console.log(`4. Logging out`);
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST'
    });

    if (!logoutRes.ok) {
        console.error('Logout failed');
    }
    console.log('   Logout Success');

    console.log('--- Verification Passed ---');
}

test().catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
});
