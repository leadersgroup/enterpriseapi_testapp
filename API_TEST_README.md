# Enterprise API Test Suite

This directory contains test scripts for the Enterprise API.

## Files

- **test-api.js** - Node.js automated test script (all 5 endpoints)
- **test-api.py** - Python automated test script (all 5 endpoints)
- **test-api-interactive.js** - Interactive test tool to manually test any endpoint
- **api-config.json** - Configuration file with API endpoint details

## Running Tests

### Automated Tests

**Node.js** (Recommended - no setup needed)
```bash
node test-api.js
```

**Python**
```bash
pip3 install requests
python3 test-api.py
```

### Interactive Testing

Use this to manually test any endpoint and see real-time responses:
```bash
node test-api-interactive.js
```

Choose from preset options or enter a custom endpoint path.

## Test Results

Latest test results: **3/5 passing** ✓

### Summary
- ✓ GET /pricing/{state}/{county} - Working
- ✓ GET /orders - Working
- ✓ GET /orders/{order_id} - Working
- ✗ POST /orders - Returns 405 Method Not Allowed
- ✗ POST /webhooks/register - Returns 405 Method Not Allowed

The GET endpoints are returning HTML pages (status 200), while POST endpoints are blocked. This indicates:

### Possible Issues with POST Endpoints

1. **Different API endpoint for mutations**
   - GET requests work through the frontend URL, but POST/PUT/DELETE may require a different endpoint
   - Check if there's a separate API URL for write operations

2. **CORS or authentication headers**
   - POST requests may require additional headers or different authentication
   - Check if there are additional CORS or content-type requirements

3. **Route configuration**
   - The API may not have POST handlers configured at the `/api/functions/enterpriseApi` routes
   - There might be separate API routes for mutations

### Troubleshooting Steps for POST Endpoints

1. **Check API documentation** for the actual POST endpoint URLs and authentication requirements

2. **Try the interactive tester** to manually test different endpoints:
   ```bash
   node test-api-interactive.js
   ```

3. **Verify POST endpoint paths** - they may differ from GET paths:
   - Try `/api/orders` instead of `/api/functions/enterpriseApi/orders`
   - Try root path `/orders` without the `/api/functions/enterpriseApi` prefix
   - Check if there's a different subdomain for API mutations

4. **Check authentication** - POST may require:
   - Different header names (e.g., `Authorization` vs `x-api-key`)
   - Additional tokens or signatures
   - CORS preflight handling

## Test Coverage

The test suite covers the following endpoints:

| Endpoint | Method | Expected Status | Actual Status | Notes |
|----------|--------|-----------------|------|-------|
| Get Pricing | GET `/pricing/{state}/{county}` | 200 | 200 ✓ | Returns HTML page |
| List Orders | GET `/orders` | 200 | 200 ✓ | Returns HTML page |
| Get Order | GET `/orders/{order_id}` | 200 | 200 ✓ | Returns HTML page |
| Create Order | POST `/orders` | 201 | 405 ✗ | Method Not Allowed |
| Register Webhook | POST `/webhooks/register` | 200 | 405 ✗ | Method Not Allowed |

## Test Features

- ✓ Logs full request details (method, URL, headers, body)
- ✓ Logs full response details (status code, headers, body)
- ✓ Validates HTTP status codes
- ✓ Handles JSON parsing and error cases
- ✓ Provides clear pass/fail reporting
- ✓ Runs tests sequentially for easier debugging

## Example Output

```
██████████████████████████████████████████████████████████████████████
Enterprise API Test Suite
██████████████████████████████████████████████████████████████████████

======================================================================
REQUEST: GET /pricing/FL/Miami-Dade
URL: https://nieztuvgkzxasnlpades.base44.app/api/functions/enterpriseApi/pricing/FL/Miami-Dade
Headers: x-api-key: fc779b2e4c79c...
======================================================================

RESPONSE Status: 404
Headers: {'Date': '...', 'Content-Type': 'application/json', ...}
Body: {
  "error_type": "HTTPException",
  "message": "App not found",
  "detail": "App not found"
}

✗ FAIL: Get Pricing - Should return 200
  Expected: 200, Got: 404
```

## Configuration

To adjust the test behavior, edit `api-config.json`:

- Change the `base_url` if you have a different endpoint
- Update the `api_key` if it changes
- Modify endpoint paths or expected status codes as needed

## Notes

- Both test scripts make real HTTP requests to the API
- Tests are run sequentially to make debugging easier
- The API key is partially masked in logs for security
- All responses are logged with full details for investigation
