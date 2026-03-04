#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi';
const API_KEY = '0a5ae0c87fe64466b37092a7d42acd77e1da29e8c50e607991da5b0b8d5a6718';

// Utility function to make HTTPS requests
// Base44 functions take the path as a request body parameter, not URL path
function makeRequest(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL);

    // Construct the request body with _path, _method, and _api_key (Base44 format)
    const requestBody = {
      _path: apiPath,
      _method: method,
      _api_key: API_KEY,
      ...(body || {}),
    };

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST', // Base44 functions always receive POST
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log(`\n${'='.repeat(70)}`);
    console.log(`REQUEST: ${method} ${apiPath}`);
    console.log(`Base44 Function URL: ${BASE_URL}`);
    console.log(`Headers: Content-Type: application/json`);
    console.log(`Body (with _api_key):`);
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
  let orderId = null;

  console.log('\n' + '█'.repeat(70));
  console.log('Enterprise API Test Suite');
  console.log('█'.repeat(70));

  // Test 1: Get Pricing (FL/Walton - has specific pricing)
  try {
    const pricingResponse = await makeRequest('GET', '/pricing/FL/Walton');
    // Returns Walton County specific pricing
    results.push({
      name: 'Get Pricing (FL/Walton)',
      pass: checkStatus(pricingResponse, 200, 'Get Pricing - Should return 200 with Walton County pricing'),
    });
  } catch (error) {
    console.error('✗ FAIL: Get Pricing - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'Get Pricing (FL/Walton)', pass: false });
  }

  // Test 2: List Orders
  try {
    const ordersResponse = await makeRequest('GET', '/orders');
    const passed = checkStatus(ordersResponse, 200, 'List Orders - Should return 200');
    results.push({
      name: 'List Orders',
      pass: passed,
    });
    // Capture an order ID for the next test
    if (ordersResponse.parsedBody && ordersResponse.parsedBody.orders && ordersResponse.parsedBody.orders.length > 0) {
      orderId = ordersResponse.parsedBody.orders[0].id;
    }
  } catch (error) {
    console.error('✗ FAIL: List Orders - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'List Orders', pass: false });
  }

  // Test 3: Get Specific Order (using the first order ID from the list)
  try {
    const path = orderId ? `/orders/${orderId}` : '/orders/invalid-id';
    const orderResponse = await makeRequest('GET', path);
    results.push({
      name: 'Get Specific Order',
      pass: checkStatus(orderResponse, 200, 'Get Specific Order - Should return 200'),
    });
  } catch (error) {
    console.error('✗ FAIL: Get Specific Order - Request failed');
    console.error(`Error: ${error.message}`);
    results.push({ name: 'Get Specific Order', pass: false });
  }

  // Test 4: Create Order (Server determines pricing based on user plan)
  const createOrderPayload = {
    property_address: '123 Main St, Miami, FL 33101',
    grantor_name: 'John Doe',
    grantee_name: 'Jane Doe',
    deed_type: 'Transfer between Individual & Trust',
    county: 'Miami-Dade',
    state: 'FL',
    contact_email: 'test@example.com',
    additional_instructions: 'Test order',
    attachments: [
      {
        file_url: 'https://example.com/documents/deed_draft.pdf',
        file_name: 'deed_draft.pdf',
        file_size: 102400,
      },
    ],
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
      pass: checkStatus(webhookResponse, 201, 'Register Webhook - Should return 201'),
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
