const API_URL = 'http://localhost:3000/api/webhooks';
const API_SECRET = 'crm_secure_key_12345';

async function testWebhook(endpoint, payload, useSecret = true) {
    console.log(`\nTesting ${endpoint}...`);
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (useSecret) headers['x-api-secret'] = API_SECRET;

        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log('Response:', data);
        return res.status;
    } catch (err) {
        console.error('Error:', err.message);
        return 500;
    }
}

async function runTests() {
    // 1. Test Without Secret (Should fail 401)
    console.log('--- Test 1: Security Check (Expect 401) ---');
    await testWebhook('instagram', { full_name: 'Hacker' }, false);

    // 2. Test Instagram Webhook
    console.log('--- Test 2: Instagram Webhook (Expect 200) ---');
    await testWebhook('instagram', {
        full_name: 'Test Instagram Lead',
        user_phone: '5511999991111',
        user_email: 'insta@test.com',
        dm_message: 'Testing integration'
    });

    // 3. Test Landing Page Webhook
    console.log('--- Test 3: Landing Page Webhook (Expect 200) ---');
    await testWebhook('landing-page', {
        name: 'Test Landing Lead',
        email: 'landing@test.com',
        phone: '5511999992222',
        origin_url: 'https://mysite.com/offer'
    });
}

runTests();
