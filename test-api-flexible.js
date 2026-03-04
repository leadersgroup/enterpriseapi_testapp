#!/usr/bin/env node

/**
 * Flexible API Test Suite for Enterprise API
 *
 * This script tests REST API endpoints with full request/response logging.
 * Easily configure endpoints below and run tests.
 */

const https = require('https');

// ============================================================================
// CONFIGURATION - Update these with your actual endpoints
// ============================================================================

const BASE_URL = 'https://50-deedscom-enterprise-db0653f4.base44.app/api/functions';
const API_KEY = 'fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261';

// Define your endpoints here
const TEST_ENDPOINTS = [
  {
    name: 'Get Pricing (FL/Miami-Dade)',
    method: 'GET',
    path: '/pricing?state=FL&county=Miami-Dade',
    expectedStatus: 200,
  },
  {
    name: 'List Orders',
    method: 'GET',
    path: '/orders',
    expectedStatus: 200,
  },
  {
    name: 'Get Specific Order',
    method: 'GET',
    path: '/orders?order_id=test-order-123',
    expectedStatus: 200,
  },
  {
    name: 'Create Order',
    method: 'POST',
    path: '/orders',
    expectedStatus: 201,
    body: {
      property_address: '123 Main St, Miami, FL 33101',
      grantor_name: 'John Doe',
      deed_type: 'Quitclaim Deed between Individuals (Add/Remove name)',
      county: 'Miami-Dade',
      state: 'FL',
      additional_instructions: 'Test order',
    },
  },
  {
    name: 'Register Webhook',
    method: 'POST',
    path: '/webhooks/register',
    expectedStatus: 200,
    body: {
      url: 'https://your-endpoint.com/webhook',
    },
  },
];

// ============================================================================
// REQUEST HANDLER
// ============================================================================

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    };

    console.log(`\n${'='.repeat(70)}`);
    console.log(`REQUEST: ${method} ${path}`);
    console.log(`Full URL: ${BASE_URL}${path}`);
    console.log(`Headers:`);
    console.log(`  x-api-key: ${API_KEY.substring(0, 20)}...`);
    console.log(`  Content-Type: application/json`);
    if (body) {
      console.log(`Body:`);
      console.log(`${JSON.stringify(body, null, 2)}`);
    }
    console.log('='.repeat(70));

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\nRESPONSE Status: ${res.statusCode}`);
        console.log(`Headers: Content-Type: ${res.headers['content-type']}`);

        try {
          const parsed = JSON.parse(data);
          console.log(`Body (JSON):`);
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          if (data.length > 500) {
            console.log(`Body (HTML/non-JSON, first 500 chars):`);
            console.log(data.substring(0, 500) + '...');
          } else {
            console.log(`Body:`);
            console.log(data);
          }
        }

        resolve({
          status: res.statusCode,
          body: data,
          parsedBody: tryParseJSON(data),
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
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

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runTests() {
  const results = [];

  console.log('\n' + '█'.repeat(70));
  console.log('Enterprise API Test Suite');
  console.log('█'.repeat(70));
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const endpoint of TEST_ENDPOINTS) {
    try {
      const response = await makeRequest(endpoint.method, endpoint.path, endpoint.body);
      const pass = checkStatus(response, endpoint.expectedStatus, `${endpoint.name} - Should return ${endpoint.expectedStatus}`);
      results.push({
        name: endpoint.name,
        pass,
      });
    } catch (error) {
      console.error(`✗ FAIL: ${endpoint.name} - Request failed`);
      console.error(`Error: ${error.message}`);
      results.push({ name: endpoint.name, pass: false });
    }
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

  return passCount === totalCount ? 0 : 1;
}

// Run tests
runTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
