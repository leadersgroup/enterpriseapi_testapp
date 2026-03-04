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

## API Status: ✅ LIVE (Partially Working)

The Base44 backend is deployed and responding!

### Test Results: 2/5 Passing ✓

**✅ Working Endpoints:**
- POST /orders - Creates orders successfully (Status 201)
- POST /webhooks/register - Registers webhooks successfully (Status 201)

**❌ Not Working:**
- GET /pricing/{state}/{county} - Returns "Endpoint not found"
- GET /orders - Returns validation error
- GET /orders/{order_id} - Returns "Endpoint not found"

See [WORKING_API_TESTS.md](WORKING_API_TESTS.md) and [GET_ENDPOINTS_INVESTIGATION.md](GET_ENDPOINTS_INVESTIGATION.md) for details.

### What's Missing
The following Base44 backend functions need to be deployed:

### Backend Functions to Deploy

1. **Pricing Function** - Get pricing for a location
   - Suggested path: `/api/functions/pricing` or `/api/functions/get-pricing`
   - Method: GET
   - Params: `state`, `county`

2. **List Orders Function** - Get all orders
   - Suggested path: `/api/functions/orders` or `/api/functions/list-orders`
   - Method: GET

3. **Get Order Function** - Get a specific order
   - Suggested path: `/api/functions/orders` or `/api/functions/get-order`
   - Method: GET
   - Params: `id` or order_id

4. **Create Order Function** - Create a new order
   - Suggested path: `/api/functions/orders` or `/api/functions/create-order`
   - Method: POST
   - Body: Order details

5. **Register Webhook Function** - Register a webhook
   - Suggested path: `/api/functions/webhooks` or `/api/functions/register-webhook`
   - Method: POST
   - Body: `{ url: "..." }`

### Once Backend is Deployed

1. **Update BASE_URL** in test scripts if function paths differ from suggestions
2. **Run automated tests**:
   ```bash
   node test-api.js
   node test-api-flexible.js
   ```
3. **Use interactive tester** for manual testing:
   ```bash
   node test-api-interactive.js
   ```
4. **Required Headers** (already configured in test scripts):
   ```
   x-api-key: fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261
   Content-Type: application/json
   ```

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
