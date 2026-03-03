#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const BASE_URL = 'https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi';
const API_KEY = 'fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261';

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
    console.log(`URL: ${BASE_URL}${path}`);
    if (body) {
      console.log(`Body: ${JSON.stringify(body, null, 2)}`);
    }
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
          console.log(`Body (first 500 chars): ${data.substring(0, 500)}`);
        }

        resolve({
          status: res.statusCode,
          body: data,
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

async function testEndpoint() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  console.log('\n' + '█'.repeat(70));
  console.log('Enterprise API Interactive Tester');
  console.log('█'.repeat(70));
  console.log('\nQuick test options:');
  console.log('1. Test GET /pricing/FL/Miami-Dade');
  console.log('2. Test GET /orders');
  console.log('3. Test GET /orders/{id}');
  console.log('4. Test POST /orders (custom)');
  console.log('5. Test custom endpoint');

  const choice = await question('\nSelect option (1-5) or enter custom path: ');

  let method = 'GET';
  let path = '';
  let body = null;

  switch (choice) {
    case '1':
      path = '/pricing/FL/Miami-Dade';
      break;
    case '2':
      path = '/orders';
      break;
    case '3':
      path = '/orders/' + (await question('Enter order ID: '));
      break;
    case '4':
      method = 'POST';
      path = '/orders';
      body = {
        property_address: '123 Main St, Miami, FL 33101',
        grantor_name: 'John Doe',
        deed_type: 'Quitclaim Deed between Individuals (Add/Remove name)',
        county: 'Miami-Dade',
        state: 'FL',
        additional_instructions: 'Test order',
      };
      console.log('Using default order payload');
      break;
    case '5':
      method = (await question('Method (GET/POST/PUT/DELETE): ')).toUpperCase();
      path = await question('Path (e.g., /orders, /pricing/FL/Miami-Dade): ');
      if (method !== 'GET' && method !== 'DELETE') {
        const bodyInput = await question('JSON body (or press Enter for none): ');
        if (bodyInput) {
          try {
            body = JSON.parse(bodyInput);
          } catch (e) {
            console.error('Invalid JSON');
            rl.close();
            process.exit(1);
          }
        }
      }
      break;
    default:
      path = choice;
      break;
  }

  try {
    await makeRequest(method, path, body);
    console.log('\n✓ Request completed');
  } catch (error) {
    console.error('\n✗ Error:', error.message);
  }

  rl.close();
}

testEndpoint().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
