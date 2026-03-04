# Backend Fix Required for GET Endpoints

## Root Cause Identified 🔍

The Base44 function receives **all requests as POST** from the SDK, but the GET endpoint handlers are checking `req.method === 'GET'`, which will never be true.

### The Problem

In the Base44 enterpriseApi function:

```javascript
// WRONG - This never matches because Base44 sends everything as POST
if (req.method === 'GET' && path === '/pricing/:state/:county') {
  // ... handle pricing
}
```

Every request arrives with `req.method === 'POST'`, regardless of the intended HTTP method.

### The Solution

Read the `_method` parameter from the request body to determine the intended HTTP verb:

```javascript
// Get the intended method from the request body
const _method = requestBody._method || req.method;

// NOW this works correctly
if (_method === 'GET' && path === '/pricing/:state/:county') {
  // ... handle pricing
}
```

### Implementation Steps

1. **Parse the request body early:**
   ```javascript
   const requestBody = JSON.parse(body);
   const _method = requestBody._method || req.method;  // Default to POST if not specified
   const _path = requestBody._path || req.path;
   ```

2. **Replace all route checks to use `_method`:**
   ```javascript
   // OLD
   if (req.method === 'GET' && path === '/orders')

   // NEW
   if (_method === 'GET' && path === '/orders')
   ```

3. **Apply to all GET handlers:**
   - `GET /pricing/{state}/{county}`
   - `GET /orders`
   - `GET /orders/{order_id}`
   - `GET /orders/history`
   - `DELETE /webhooks/{webhook_id}`
   - `PUT /orders/{order_id}/status`

### Current Test Results

✅ **POST endpoints work** (they correctly receive POST):
- POST /orders → 201 ✅
- POST /webhooks/register → 201 ✅

❌ **GET endpoints fail** (they expect method === 'GET'):
- GET /pricing/{state}/{county} → 404 ❌
- GET /orders → 404 ❌
- GET /orders/{order_id} → 404 ❌
- GET /orders/history → 404 ❌

### Affected Routes

All routes in the Base44 function need to be updated to use `_method` instead of `req.method`:

```
GET /pricing/{state}/{county}
GET /orders
GET /orders/history
GET /orders/{order_id}
POST /orders              ✅ Works (naturally POST)
PUT /orders/{order_id}/status
POST /webhooks/register   ✅ Works (naturally POST)
DELETE /webhooks/{webhook_id}
```

### How Base44 Functions Work

The SDK (test scripts) sends requests like this:

```bash
POST https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi
{
  "_path": "/orders",
  "_method": "GET"
}
```

But the function receives:
```javascript
req.method === 'POST'     // Always POST from Base44
body._path === '/orders'   // The intended path
body._method === 'GET'     // The intended HTTP method
```

### Quick Fix Checklist

- [ ] Read `_method` from request body in enterpriseApi function
- [ ] Replace all `req.method ===` checks with `_method ===` checks
- [ ] Test GET /pricing/{state}/{county}
- [ ] Test GET /orders
- [ ] Test GET /orders/{order_id}
- [ ] Test GET /orders/history
- [ ] Test PUT /orders/{order_id}/status
- [ ] Test DELETE /webhooks/{webhook_id}

### Test Command (after fix)

```bash
node test-api.js
```

Expected: All 5 tests should pass ✅

---

**Note:** Once this fix is applied, run the test script again and all endpoints should work correctly.

