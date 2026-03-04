#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi';
const API_KEY = 'fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261';

// Utility function to make HTTPS requests
// Base44 functions take the path as a request body parameter, not URL path
function makeRequest(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL);

    // Construct the request body with path and method
    const requestBody = {
      path: apiPath,
      method: method,
      ...(body || {}),
    };

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST', // Base44 functions always receive POST
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    console.log(`\n${'='.repeat(70)}`);
    console.log(`REQUEST: ${method} ${apiPath}`);
    console.log(`Base44 Function URL: ${BASE_URL}`);
    console.log(`Headers: Authorization: Bearer ${API_KEY.substring(0, 20)}...`);
    console.log(`Body:`);
    console.log(`${JSON.stringify(requestBody, null, 2)}`);
    console.log('='.repeat(70));

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\nRESPONSE Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`Body: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`Body: ${data}`);
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          parsedBody: tryParseJSON(data),
        });
      });
    });

    req.on('error', reject);

    // Write the request body with path and method
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function checkStatus(response, expectedStatus, testName) {
  const pass = response.status === expectedStatus;
  const status = pass ? '✓ PASS' : '✗ FAIL';
  console.log(`\n${status}: ${testName}`);
  console.log(`  Expected: ${expectedStatus}, Got: ${response.status}`);
  return pass;
}

async function runTests() {
  const results = [];

  console.log('\n' + '█'.repeat(70));
  console.log('Enterprise API Test Suite');
  console.log('█'.repeat(70));

  // Test 1: Get Pricing
  try {
    const pricingResponse = await makeRequest('GET', '/pricing/FL/Miami-Dade');
    results.push({
      name: 'Get Pricing (FL/Miami-Dade)',
      pass: checkStatus(pricingResponse, 200, 'Get Pricing - Should return 200'),
    });
  } catch (error) {
    console.error('✗ FAIL: Get Pricing - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'Get Pricing (FL/Miami-Dade)', pass: false });
  }

  // Test 2: List Orders
  try {
    const ordersResponse = await makeRequest('GET', '/orders');
    results.push({
      name: 'List Orders',
      pass: checkStatus(ordersResponse, 200, 'List Orders - Should return 200'),
    });
  } catch (error) {
    console.error('✗ FAIL: List Orders - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'List Orders', pass: false });
  }

  // Test 3: Get Specific Order (using a test ID)
  try {
    const orderResponse = await makeRequest('GET', '/orders/order123');
    results.push({
      name: 'Get Specific Order',
      pass: checkStatus(orderResponse, 200, 'Get Specific Order - Should return 200'),
    });
  } catch (error) {
    console.error('✗ FAIL: Get Specific Order - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'Get Specific Order', pass: false });
  }

  // Test 4: Create Order
  const createOrderPayload = {
    property_address: '123 Main St, Miami, FL 33101',
    grantor_name: 'John Doe',
    deed_type: 'Quitclaim Deed between Individuals (Add/Remove name)',
    county: 'Miami-Dade',
    state: 'FL',
    additional_instructions: 'Test order',
  };

  try {
    const createResponse = await makeRequest('POST', '/orders', createOrderPayload);
    const isExpectedStatus = createResponse.status === 201 || createResponse.status === 200;
    results.push({
      name: 'Create Order',
      pass: checkStatus(createResponse, 201, 'Create Order - Should return 201'),
    });
  } catch (error) {
    console.error('✗ FAIL: Create Order - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'Create Order', pass: false });
  }

  // Test 5: Register Webhook
  const webhookPayload = {
    url: 'https://your-endpoint.com/webhook',
  };

  try {
    const webhookResponse = await makeRequest('POST', '/webhooks/register', webhookPayload);
    const isExpectedStatus = webhookResponse.status === 200 || webhookResponse.status === 201;
    results.push({
      name: 'Register Webhook',
      pass: checkStatus(webhookResponse, 200, 'Register Webhook - Should return 200 or 201'),
    });
  } catch (error) {
    console.error('✗ FAIL: Register Webhook - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'Register Webhook', pass: false });
  }

  // Summary
  console.log('\n' + '█'.repeat(70));
  console.log('TEST SUMMARY');
  console.log('█'.repeat(70));
  results.forEach((result) => {
    const status = result.pass ? '✓' : '✗';
    console.log(`${status} ${result.name}`);
  });

  const passCount = results.filter((r) => r.pass).length;
  const totalCount = results.length;
  console.log(`\nTotal: ${passCount}/${totalCount} passed`);
  console.log('█'.repeat(70) + '\n');

  process.exit(passCount === totalCount ? 0 : 1);
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
