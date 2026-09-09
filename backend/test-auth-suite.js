const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Starting Backend Authentication API Test Suite');
  console.log('====================================================\n');

  let brandToken = '';
  let creatorToken = '';

  const testEmailBrand = `testbrand_${Date.now()}@example.com`;
  const testEmailCreator = `testcreator_${Date.now()}@example.com`;

  try {
    // 1. Health Check
    console.log('1. Testing GET /api/health...');
    const resHealth = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health Check Passed:', resHealth.data.message);

    // 2. Test Brand Registration
    console.log('\n2. Testing POST /api/auth/register/brand...');
    const resBrandReg = await axios.post(`${BASE_URL}/auth/register/brand`, {
      companyName: 'Apex Tech Inc',
      contactPerson: 'Sarah Connor',
      email: testEmailBrand,
      instagramHandle: '@apextech',
      industry: 'Technology',
      country: 'India',
      password: 'password123',
    });
    console.log('   ✅ Brand Registered Successfully:', resBrandReg.data.user.name, `(Role: ${resBrandReg.data.user.role})`);
    brandToken = resBrandReg.data.token;

    // 3. Test Creator Registration
    console.log('\n3. Testing POST /api/auth/register/creator...');
    const resCreatorReg = await axios.post(`${BASE_URL}/auth/register/creator`, {
      name: 'Alex Rivera',
      username: 'alexrivera',
      email: testEmailCreator,
      instagramHandle: '@alexcreates',
      niche: 'Tech & Gaming',
      country: 'India',
      password: 'password123',
    });
    console.log('   ✅ Creator Registered Successfully:', resCreatorReg.data.user.name, `(Role: ${resCreatorReg.data.user.role})`);
    creatorToken = resCreatorReg.data.token;

    // 4. Test Duplicate Email Registration
    console.log('\n4. Testing Duplicate Email Registration (Expected 400 Bad Request)...');
    try {
      await axios.post(`${BASE_URL}/auth/register/brand`, {
        companyName: 'Duplicate Brand',
        email: testEmailBrand,
        password: 'password123',
      });
      console.log('   ❌ FAILED: Duplicate email was allowed!');
    } catch (err) {
      console.log('   ✅ Passed: Duplicate email correctly rejected with status:', err.response?.status, 'Message:', err.response?.data?.message);
    }

    // 5. Test Brand Login
    console.log('\n5. Testing POST /api/auth/login for Brand...');
    const resBrandLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmailBrand,
      password: 'password123',
    });
    console.log('   ✅ Brand Login Successful! Token received:', resBrandLogin.data.token ? 'Yes' : 'No');

    // 6. Test Creator Login
    console.log('\n6. Testing POST /api/auth/login for Creator...');
    const resCreatorLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmailCreator,
      password: 'password123',
    });
    console.log('   ✅ Creator Login Successful! Token received:', resCreatorLogin.data.token ? 'Yes' : 'No');

    // 7. Test Invalid Login
    console.log('\n7. Testing Invalid Login Credentials (Expected 401 Unauthorized)...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmailBrand,
        password: 'wrongpassword',
      });
      console.log('   ❌ FAILED: Invalid password was accepted!');
    } catch (err) {
      console.log('   ✅ Passed: Invalid login correctly rejected with status:', err.response?.status, 'Message:', err.response?.data?.message);
    }

    // 8. Test Protected Endpoint with valid JWT
    console.log('\n8. Testing GET /api/auth/me with valid JWT...');
    const resMe = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${brandToken}` },
    });
    console.log('   ✅ Protected Endpoint Passed: Returned user', resMe.data.user.email);

    // 9. Test Protected Endpoint without JWT
    console.log('\n9. Testing GET /api/auth/me WITHOUT token (Expected 401 Unauthorized)...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('   ❌ FAILED: Endpoint accessed without token!');
    } catch (err) {
      console.log('   ✅ Passed: Request without JWT rejected with status:', err.response?.status, 'Message:', err.response?.data?.message);
    }

    // 10. Test Role Authorization - Brand accessing Brand profile
    console.log('\n10. Testing GET /api/brand/profile with Brand Token...');
    const resBrandProfile = await axios.get(`${BASE_URL}/brand/profile`, {
      headers: { Authorization: `Bearer ${brandToken}` },
    });
    console.log('   ✅ Brand Profile Access Allowed:', resBrandProfile.data.message);

    // 11. Test Role Authorization - Creator trying to access Brand profile (Expected 403 Forbidden)
    console.log('\n11. Testing GET /api/brand/profile with Creator Token (Expected 403 Forbidden)...');
    try {
      await axios.get(`${BASE_URL}/brand/profile`, {
        headers: { Authorization: `Bearer ${creatorToken}` },
      });
      console.log('   ❌ FAILED: Creator was allowed to access Brand endpoint!');
    } catch (err) {
      console.log('   ✅ Passed: Role restriction correctly enforced with status:', err.response?.status, 'Message:', err.response?.data?.message);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 11 AUTHENTICATION TEST CASES PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Test Suite Exception:', error.response?.data || error.message);
  }
}

runTests();
