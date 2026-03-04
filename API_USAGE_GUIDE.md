# Enterprise API Usage Guide

## Quick Start

### Base URL
```
https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi
```

### Authentication
Include API key in request body:
```json
"_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
```

### Request Format
```json
{
  "_path": "/endpoint",
  "_method": "GET|POST|PUT|DELETE",
  "_api_key": "your_key",
  "...other_fields...": "..."
}
```

**Important:** Always make HTTP POST requests to the function URL, even for GET operations.

---

## Available Endpoints

### 1. List Orders
```json
{
  "_path": "/orders",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```
**Response:**
```json
{
  "orders": [
    {
      "id": "69a778e8c2c91101a75f6a5d",
      "custom_order_id": "2026-03-04-001",
      "status": "Submitted",
      "property_address": "123 Main St, Miami, FL 33101",
      "county": "Miami-Dade",
      "state": "FL",
      "deed_type": "Quitclaim Deed between Individuals",
      "grantor_name": "John Doe",
      "total_price": 0,
      "payment_status": "paid",
      "created_date": "2026-03-04T00:12:24.410000",
      "updated_date": "2026-03-04T00:12:24.410000"
    }
  ],
  "total": 1
}
```

---

### 2. Get Specific Order
```json
{
  "_path": "/orders/69a778e8c2c91101a75f6a5d",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```
**Response:** Single order object (same structure as list above)

---

### 3. Create Order
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261",
  "property_address": "123 Main St, Miami, FL 33101",
  "grantor_name": "John Doe",
  "grantee_name": "Jane Doe",
  "deed_type": "Quitclaim Deed between Individuals",
  "county": "Miami-Dade",
  "state": "FL",
  "contact_email": "test@example.com",
  "additional_instructions": "Test order"
}
```

**Required Fields:**
- `property_address` - Property location
- `grantor_name` - Grantor name
- `grantee_name` - Grantee name
- `deed_type` - Type of deed
- `county` - County name
- `state` - State code (e.g., "FL")
- `contact_email` - Email for contact

**Optional Fields:**
- `additional_instructions` - Any special notes

**Response (201 Created):**
```json
{
  "success": true,
  "order": {
    "id": "69a77a61b916671f505b54db",
    "custom_order_id": "2026-03-04-002",
    "status": "Submitted",
    "property_address": "123 Main St, Miami, FL 33101",
    "created_date": "2026-03-04T00:18:41.766303Z",
    "pricing": {
      "service_fee": 0,
      "recording_fee": 0,
      "total": 0,
      "currency": "USD"
    },
    "payment_status": "paid"
  }
}
```

---

### 4. Get Pricing
```json
{
  "_path": "/pricing/FL/Miami-Dade",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```
**Note:** Currently returns 404 - pricing data for Miami-Dade not yet populated.

**Response Format (when data exists):**
```json
{
  "state": "FL",
  "county": "Miami-Dade",
  "service_fee": 50,
  "recording_fee": 100,
  "total": 150,
  "currency": "USD"
}
```

---

### 5. Register Webhook
```json
{
  "_path": "/webhooks/register",
  "_method": "POST",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261",
  "url": "https://your-endpoint.com/webhook"
}
```

**Required Fields:**
- `url` - Webhook endpoint URL

**Response (201 Created):**
```json
{
  "success": true,
  "webhook": {
    "id": "69a77a62bfe2ac71a8191707",
    "url": "https://your-endpoint.com/webhook",
    "description": "",
    "is_active": true,
    "created_date": "2026-03-04T00:18:42.673745Z"
  }
}
```

---

## Using Query Parameters

For endpoints that support query parameters, include them in the `_path`:

### Example: Get Orders with Filters
```json
{
  "_path": "/orders?status=Submitted&limit=10",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```

### Example: Order History
```json
{
  "_path": "/orders/history?status=Submitted&limit=10",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```

---

## Error Responses

### 404 Not Found
```json
{
  "error": "Endpoint not found."
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid API key"
}
```

### 400 Bad Request
```json
{
  "error": "Missing required fields: [field1, field2]"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error.",
  "details": "Detailed error information"
}
```

---

## Testing the API

### Using curl
```bash
curl -X POST https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi \
  -H "Content-Type: application/json" \
  -d '{
    "_path": "/orders",
    "_method": "GET",
    "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
  }'
```

### Using Node.js
```bash
node test-api.js
```

### Using Python
```bash
pip3 install requests
python3 test-api.py
```

---

## Webhook Support

Webhooks are automatically triggered when orders are created or updated. The webhook will receive POST requests with event data.

### Webhook Event Format
```json
{
  "event": "order.created",
  "order_id": "69a77a61b916671f505b54db",
  "timestamp": "2026-03-04T00:18:41.766303Z",
  "data": {
    "id": "69a77a61b916671f505b54db",
    "custom_order_id": "2026-03-04-002",
    "status": "Submitted",
    "property_address": "123 Main St, Miami, FL 33101"
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - Endpoint or resource not found |
| 500 | Server Error - Internal error |

---

## Rate Limiting

Currently no rate limiting is enforced. Please use the API responsibly.

---

## Support

For issues or questions, refer to the test results in:
- `TEST_RESULTS_FINAL.md` - Detailed test status
- `API_UPDATE.md` - Backend update information
- `CURRENT_TEST_STATUS.md` - Current endpoint status
