# Complete FINCEN Deed Types Reference

**Updated**: 2026-03-06
**Status**: ✅ 9 deed types fully implemented and tested

---

## Overview

All deed types are now classified with explicit FINCEN reportability status. The API uses the full deed type string (with reportability indicator) for all requests.

---

## Non-Reportable Deed Types (7 types, $0 FINCEN fee)

These transfers do NOT require FINCEN reporting and are NOT assessed the $95 FINCEN fee.

| # | Deed Type | Use Case |
|---|-----------|----------|
| 1 | `Transfer of non-residential property: FINCEN non-reportable` | Commercial properties, vacant land, industrial facilities |
| 2 | `Transfer to Individual: FINCEN non-reportable` | Transfers between individuals |
| 3 | `Transfer from individual to own Revocable Trust as grantor: FINCEN non-reportable` | Individual transferring property to their own revocable trust |
| 4 | `Transfer due to death of individual: FINCEN non-reportable` | Inheritance, probate transfers, death-related transfers |
| 5 | `Transfer due to divorce: FINCEN non-reportable` | Property division in divorce proceedings |
| 6 | `Transfer due to court order: FINCEN non-reportable` | Court-ordered transfers, liens, judgments |
| 7 | `Transfer to qualified intermediary for 1031 purpose: FINCEN non-reportable` | 1031 exchange intermediary holdings |

---

## FINCEN-Reportable Deed Types (2 types, +$95 FINCEN fee)

These transfers REQUIRE FINCEN reporting and are assessed the $95 FINCEN reporting fee.

| # | Deed Type | Use Case | Fee |
|---|-----------|----------|-----|
| 1 | `Transfer from entity to Trust: FINCEN reportable` | LLC/Corp transferring to trust | +$95 |
| 2 | `Transfer to Company: FINCEN reportable` | Transfer to LLC, Corporation, or other entity | +$95 |

---

## API Request Examples

### Non-Reportable: Get Pricing

```json
{
  "_path": "/pricing/FL/Miami-Dade",
  "_method": "GET",
  "_api_key": "YOUR_API_KEY",
  "deed_type": "Transfer to Individual: FINCEN non-reportable"
}
```

**Response**:
```json
{
  "state": "FL",
  "county": "Miami-Dade",
  "deed_type": "Transfer to Individual: FINCEN non-reportable",
  "service_fee": 299,
  "recording_fee": 25,
  "fincen_fee": 0,
  "fincen_required": false,
  "premium_discount": 45,
  "total": 279
}
```

---

### FINCEN-Reportable: Create Order

```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "YOUR_API_KEY",
  "property_address": "123 Main St, Miami, FL 33101",
  "grantor_name": "ABC Corporation",
  "grantee_name": "Trust Company",
  "contact_name": "John Smith",
  "deed_type": "Transfer from entity to Trust: FINCEN reportable",
  "county": "Miami-Dade",
  "state": "FL",
  "contact_email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "...",
    "custom_order_id": "ENT...",
    "status": "Submitted",
    "pricing": {
      "service_fee": 299,
      "recording_fee": 25,
      "fincen_fee": 95,
      "premium_discount": 45,
      "total": 374
    }
  }
}
```

---

## Test Results

### Python Test Suite: 5/5 ✅
- ✓ Get Pricing (Transfer to Individual: FINCEN non-reportable)
- ✓ List Orders
- ✓ Get Specific Order
- ✓ Create Order (Transfer from entity to Trust: FINCEN reportable)
- ✓ Register Webhook

### Node.js Test Suite: 5/5 ✅
- ✓ Get Pricing (Transfer to Individual: FINCEN non-reportable)
- ✓ List Orders
- ✓ Get Specific Order
- ✓ Create Order (Transfer from entity to Trust: FINCEN reportable)
- ✓ Register Webhook

### Web UI Test Suite: 6/6 ✅
- ✓ Test 1: Pricing (FL/Walton, non-reportable)
- ✓ Test 2: List Orders
- ✓ Test 3: Get Order (uses latest)
- ✓ Test 4: Create Order (FL, reportable)
- ✓ Test 5: Register Webhook
- ✓ Test 6: Create Order (NY, reportable with SSNs)

---

## Important Notes

1. **Exact String Matching**: Use the complete deed type string (with `: FINCEN reportable` or `: FINCEN non-reportable` suffix) in all API requests
2. **Fee Calculation**: The $95 FINCEN fee is automatically added to reportable deed types
3. **Premium Discount**: Applies before FINCEN fee is added (if applicable)
4. **Response Fields**:
   - `fincen_fee`: Will be 0 or 95 depending on deed type
   - `fincen_required`: Boolean indicating if reporting is required

---

## Files Updated

- **test-api.py**: Tests using new deed type strings (5/5 passing)
- **test-api.js**: Tests using new deed type strings (5/5 passing)
- **index.html**:
  - Pricing dropdown with all 9 deed types
  - Order dropdown with all 9 deed types
  - Test functions using appropriate deed types
  - 6 automated tests including NY state handling
- **MEMORY.md**: Updated with complete deed type reference

---

## Version History

| Date | Status | Changes |
|------|--------|---------|
| 2026-03-06 | ✅ Complete | Added comprehensive 9-type deed classification with explicit FINCEN indicators |
| 2026-03-05 | ✅ Complete | Initial 4-type FINCEN implementation |
| 2026-03-04 | ✅ Complete | Added contact_name and conditional SSN fields |

