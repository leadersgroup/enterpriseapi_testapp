# API Investigation Findings

## Current Status

The Base44 backend functions for the Enterprise API **appear to not be deployed yet** at the expected endpoints.

## What We Discovered

### Working Endpoints
- ✅ The frontend application IS deployed at `https://50-deedscom-enterprise-db0653f4.base44.app`
- ✅ Authentication header format: `Authorization: Bearer {API_KEY}`
- ✅ Accept header is needed: `Accept: application/json`

### API Endpoints
- ❌ `/api/functions/enterpriseApi/*` - Returns "Backend function not found"
- ❌ `/api/functions/*` - Returns "Backend function not found"
- ❌ Individual function paths like `/api/functions/pricing` - Returns "Backend function not found"

### Error Responses
When using proper authentication headers with `Accept: application/json`, the API returns:

```json
{
  "error_type": "HTTPException",
  "message": "Backend function 'enterpriseApi/pricing/FL/Miami-Dade' not found or not deployed",
  "detail": "Backend function 'enterpriseApi/pricing/FL/Miami-Dade' not found or not deployed",
  "traceback": "",
  "request_id": null
}
```

### Without Accept Header
When the `Accept: application/json` header is missing, the frontend's SPA routing catches all requests and returns HTML (200 status) for any path, making it appear like the endpoints exist.

## Required Headers

```
Authorization: Bearer fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261
Content-Type: application/json
Accept: application/json
```

## What Needs to Happen

The Base44 backend functions need to be created and deployed:

1. **Get Pricing Function**
   - Path: `/api/functions/pricing` (or similar)
   - Method: GET
   - Parameters: `state`, `county` (query or path)
   - Returns: Pricing information as JSON

2. **List Orders Function**
   - Path: `/api/functions/orders` (or similar)
   - Method: GET
   - Returns: Array of orders

3. **Get Order Function**
   - Path: `/api/functions/orders/:id` (or similar)
   - Method: GET
   - Returns: Single order details

4. **Create Order Function**
   - Path: `/api/functions/orders` (or similar)
   - Method: POST
   - Body: Order details (property_address, grantor_name, etc.)
   - Returns: Created order with ID

5. **Register Webhook Function**
   - Path: `/api/functions/webhooks` (or similar)
   - Method: POST
   - Body: Webhook URL
   - Returns: Webhook registration confirmation

## Next Steps

1. **Deploy the backend functions** on Base44
2. **Verify function names** - they might be:
   - `pricing`, `orders`, `createOrder`, `registerWebhook`
   - Or snake_case: `get_pricing`, `list_orders`, `create_order`, `register_webhook`
   - Or camelCase variations

3. **Test with updated URLs** once deployed

4. **Run the test scripts** with the correct endpoint paths

## Test Scripts Status

The test scripts are ready to use once the backend functions are deployed:
- `test-api.js` - Node.js automated testing
- `test-api.py` - Python automated testing
- `test-api-interactive.js` - Interactive endpoint tester

Just update the `BASE_URL` path once you know the correct function endpoints.

## Troubleshooting Checklist

- [ ] Verify backend functions are deployed on Base44
- [ ] Confirm the correct function name/path for each endpoint
- [ ] Test with `Accept: application/json` header
- [ ] Verify `Authorization: Bearer {token}` header is included
- [ ] Check if functions use query params vs. path params
- [ ] Verify request/response payload structure matches API spec
