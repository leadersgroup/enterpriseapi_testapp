# ✅ API Tests - Partially Working!

## Test Results: 2/5 Passing ✓

### ✅ Working Endpoints

1. **POST /orders** - Create Order ✓
   - Status: 201 CREATED
   - Successfully creates orders with all required fields

2. **POST /webhooks/register** - Register Webhook ✓
   - Status: 201 CREATED
   - Successfully registers webhooks

### ❌ Issues with GET Endpoints

3. **GET /pricing/{state}/{county}** - ✗ Endpoint not found
4. **GET /orders** - ✗ Missing required fields (expects POST payload)
5. **GET /orders/{order_id}** - ✗ Endpoint not found

## Connection Details ✅

**API Endpoint:**
```
https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi
```

**Authentication:**
```
Authorization: Bearer fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261
```

**Request Format:**
```json
{
  "_path": "/orders",
  "_method": "POST",
  "property_address": "...",
  "grantor_name": "...",
  "grantee_name": "...",
  "deed_type": "...",
  "county": "...",
  "state": "...",
  "contact_email": "...",
  "additional_instructions": "..."
}
```

## Required Fields for Create Order

- `property_address` - Property address
- `grantor_name` - Grantor name
- `grantee_name` - **REQUIRED** (was missing from original spec)
- `deed_type` - Type of deed
- `county` - County
- `state` - State code
- `contact_email` - **REQUIRED** (was missing from original spec)
- `additional_instructions` - Optional instructions

## Test Script Status

✅ **test-api.js** - Working
```bash
node test-api.js
```

Output: 2/5 passed

✅ **test-api.py** - Working
```bash
python3 test-api.py
```

## Available Endpoints (from API)

The API returns this list of available endpoints:

```
GET /pricing/{state}/{county}
GET /orders
GET /orders/history
GET /orders/{order_id}
POST /orders
PUT /orders/{order_id}/status  [admin only]
POST /webhooks/register
DELETE /webhooks/{webhook_id}
```

## Next Steps

### For GET Endpoints
The API shows these endpoints are available but returns "Endpoint not found" when called. Possible causes:
1. GET endpoints might require different request structure
2. Query parameters might need special handling
3. API routing might need adjustment

### For Working Endpoints
The POST endpoints work perfectly! Successfully tested:
- ✅ Order creation with full payload
- ✅ Webhook registration

## Successfully Created Objects

### Order
```json
{
  "id": "69a778e8c2c91101a75f6a5d",
  "custom_order_id": "2026-03-04-001",
  "status": "Submitted",
  "created_date": "2026-03-04T00:12:24Z"
}
```

### Webhook
```json
{
  "id": "69a778e98b3e11e9fd868e96",
  "url": "https://your-endpoint.com/webhook",
  "is_active": true,
  "created_date": "2026-03-04T00:12:25Z"
}
```

## Commands

Run automated tests:
```bash
node test-api.js
```

Run Python tests:
```bash
pip3 install requests
python3 test-api.py
```

Run interactive tester:
```bash
node test-api-interactive.js
```

---

**Note:** The API is live and responding! The POST endpoints work fully. GET endpoints need investigation for proper routing.
