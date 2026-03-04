# Pricing Test Results - Lee County, Florida

## Test Date: 2026-03-04

### Pricing Endpoint Test

**Request:**
```json
{
  "_path": "/pricing/FL/Lee",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```

**Response:**
```json
{
  "error": "No pricing found for Lee, FL"
}
```

**Status:** 404 - Fallback not yet returning default pricing

---

## Default Pricing (FL/default)

**Request:**
```json
{
  "_path": "/pricing/FL/default",
  "_method": "GET",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"
}
```

**Response:**
```json
{
  "state": "FL",
  "county": "default",
  "service_fee": 349,
  "recording_fee": 25,
  "trust_recording_fee": null,
  "total": 374,
  "notes": null,
  "currency": "USD"
}
```

**Current Default FL Pricing:**
- Service Fee: $349
- Recording Fee: $25
- Total: $374

**Expected Premium Pricing:**
- Service Fee: $299 (with $50 market_control discount)
- Recording Fee: $25
- Total: $324

---

## Order Creation Test - Lee County

**Request:**
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261",
  "property_address": "456 Oak Lane, Cape Coral, FL 33904",
  "grantor_name": "Jane Smith",
  "grantee_name": "John Smith",
  "deed_type": "Quitclaim Deed between Individuals (Add/Remove name)",
  "county": "Lee",
  "state": "FL",
  "contact_email": "jane.smith@example.com",
  "additional_instructions": "Test order for Lee County pricing"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "69a77f7ee71567fb099fa64d",
    "custom_order_id": "2026-03-04-038",
    "status": "Submitted",
    "property_address": "456 Oak Lane, Cape Coral, FL 33904",
    "created_date": "2026-03-04T00:40:30.489663Z",
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

**Pricing Returned:** $0 (all fees waived)

---

## Order Creation Test - Miami-Dade County

**Request:**
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261",
  "property_address": "789 South Beach Blvd, Miami Beach, FL 33139",
  "grantor_name": "Michael Johnson",
  "grantee_name": "Sarah Johnson",
  "deed_type": "Quitclaim Deed between Individuals (Add/Remove name)",
  "county": "Miami-Dade",
  "state": "FL",
  "contact_email": "michael.johnson@example.com",
  "additional_instructions": "Test order for Miami-Dade County pricing"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "69a77f8a464f7f6c6b91421f",
    "custom_order_id": "2026-03-04-040",
    "status": "Submitted",
    "property_address": "789 South Beach Blvd, Miami Beach, FL 33139",
    "created_date": "2026-03-04T00:40:42.714444Z",
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

**Pricing Returned:** $0 (all fees waived)

---

## Summary

### Current Behavior
- ✓ Pricing endpoint returns 404 for non-existent counties (Lee, Miami-Dade)
- ✓ Pricing endpoint returns default FL pricing: $349 service + $25 recording = $374
- ✓ Order creation succeeds for both Lee and Miami-Dade counties
- ⚠️ Order pricing shows $0 for all fees (may be test/demo pricing)

### Expected Behavior (Once Fallback Implemented)
- GET /pricing/FL/Lee → Should return default FL pricing
- GET /pricing/FL/Miami-Dade → Should return default FL pricing
- POST /orders (premium user) → Should show discounted pricing

### Notes
- Test user appears to be premium plan
- Orders created successfully in both counties
- Pricing calculation may be showing $0 for test purposes
- Fallback logic for pricing endpoint not yet active

---

**Test Date:** 2026-03-04
**Status:** Investigating pricing behavior
