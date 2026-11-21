import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Open Data Explorer Automated REST API Test Suite...');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name} ->`, err.response?.data || err.message);
      failed++;
    }
  };

  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // 1. Health check
  await test('GET /health (Server Health Check)', async () => {
    const res = await client.get('/health');
    if (res.data.status !== 'ONLINE') throw new Error('Status not online');
  });

  // 2. Countries: Get list
  await test('GET /countries (Get paginated countries & cache)', async () => {
    const res = await client.get('/countries?page=1&limit=5');
    if (!res.data.success || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error('Countries list empty or unsuccessful');
    }
  });

  // 3. Countries: Search
  await test('GET /countries/search?q=india (Search Country)', async () => {
    const res = await client.get('/countries/search?q=india');
    if (!res.data.success || res.data.data.length === 0) {
      throw new Error('India search returned no results');
    }
  });

  // 4. Countries: Details by code
  await test('GET /countries/IN (Country Details by CCA2 code)', async () => {
    const res = await client.get('/countries/IN');
    if (!res.data.success || res.data.data.cca2 !== 'IN') {
      throw new Error('India details retrieval failed');
    }
  });

  // 5. Countries: Region Filter
  await test('GET /countries/region/Asia (Filter by Region)', async () => {
    const res = await client.get('/countries/region/Asia');
    if (!res.data.success || res.data.data.length === 0) {
      throw new Error('Asia region filter failed');
    }
  });

  // 6. Countries: Compare
  await test('GET /countries/compare?first=IN&second=US (Side-by-side Compare)', async () => {
    const res = await client.get('/countries/compare?first=IN&second=US');
    if (!res.data.success || !res.data.data.metrics) {
      throw new Error('Country comparison calculation failed');
    }
  });

  // 7. Weather: Search City
  await test('GET /weather/search?city=Hyderabad (Search City)', async () => {
    const res = await client.get('/weather/search?city=Hyderabad');
    if (!res.data.success || res.data.data.length === 0) {
      throw new Error('City geocoding search failed');
    }
  });

  // 8. Weather: 7-day Forecast
  await test('GET /weather/forecast?city=Hyderabad (Weather Forecast)', async () => {
    const res = await client.get('/weather/forecast?city=Hyderabad');
    if (!res.data.success || !res.data.data.current || res.data.data.daily.length < 5) {
      throw new Error('Weather forecast retrieval failed');
    }
  });

  // 9. Currency: Currencies list
  await test('GET /currency/currencies (List Currencies)', async () => {
    const res = await client.get('/currency/currencies');
    if (!res.data.success || Object.keys(res.data.data).length === 0) {
      throw new Error('Currencies list failed');
    }
  });

  // 10. Currency: Rates
  await test('GET /currency/rates?base=USD (Exchange Rates)', async () => {
    const res = await client.get('/currency/rates?base=USD');
    if (!res.data.success || !res.data.data.rates) {
      throw new Error('Rates retrieval failed');
    }
  });

  // 11. Currency: Convert
  await test('GET /currency/convert?from=USD&to=EUR&amount=100 (Convert)', async () => {
    const res = await client.get('/currency/convert?from=USD&to=EUR&amount=100');
    if (!res.data.success || typeof res.data.data.result !== 'number') {
      throw new Error('Currency conversion calculation failed');
    }
  });

  // 12. Auth: Register
  const testUserEmail = `test_${Date.now()}@example.com`;
  await test('POST /auth/register (User Registration)', async () => {
    const res = await client.post('/auth/register', {
      username: `testuser_${Date.now()}`,
      email: testUserEmail,
      password: 'Password@123',
    });
    if (!res.data.success) throw new Error('Registration failed');
  });

  // 13. Auth: Login as Admin
  let adminCookie = '';
  await test('POST /auth/login (Admin Login & Session Cookie)', async () => {
    const res = await client.post('/auth/login', {
      email: 'admin@opendata.com',
      password: 'Admin@123',
    });
    if (!res.data.success || res.data.data.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
      adminCookie = setCookie[0];
      client.defaults.headers.common['Cookie'] = adminCookie;
    }
  });

  // 14. Auth: Profile
  await test('GET /auth/profile (Authenticated Profile)', async () => {
    const res = await client.get('/auth/profile');
    if (!res.data.success || res.data.data.email !== 'admin@opendata.com') {
      throw new Error('Profile retrieval failed');
    }
  });

  // 15. Saved Items: Create
  let savedId = '';
  await test('POST /saved (Save Favourite Item)', async () => {
    const res = await client.post('/saved', {
      itemType: 'country',
      itemId: 'IND',
      title: 'India',
      subtitle: 'Asia - Capital: New Delhi',
      data: { population: 1400000000 },
    });
    if (!res.data.success) throw new Error('Save item failed');
    savedId = res.data.data._id;
  });

  // 16. Saved Items: Retrieve
  await test('GET /saved (Retrieve Favourites)', async () => {
    const res = await client.get('/saved');
    if (!res.data.success || res.data.data.length === 0) {
      throw new Error('Retrieve saved items failed');
    }
  });

  // 17. Saved Items: Delete
  await test('DELETE /saved/:id (Remove Favourite Item)', async () => {
    const res = await client.delete(`/saved/${savedId}`);
    if (!res.data.success) throw new Error('Delete saved item failed');
  });

  // 18. Admin: System Stats
  await test('GET /admin/stats (Admin Dashboard System Stats)', async () => {
    const res = await client.get('/admin/stats');
    if (!res.data.success || !res.data.data.users) {
      throw new Error('Admin stats retrieval failed');
    }
  });

  // 19. Admin: User list
  await test('GET /admin/users (Admin User Management)', async () => {
    const res = await client.get('/admin/users');
    if (!res.data.success || !Array.isArray(res.data.data)) {
      throw new Error('Admin user list failed');
    }
  });

  // 20. Auth: Logout
  await test('POST /auth/logout (Logout)', async () => {
    const res = await client.post('/auth/logout');
    if (!res.data.success) throw new Error('Logout failed');
  });

  console.log('\n========================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
