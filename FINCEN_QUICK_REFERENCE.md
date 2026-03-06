# FinCEN Quick Reference Guide

## Deed Types Comparison

| Deed Type | FinCEN Fee | Reportable | Use Case |
|-----------|-----------|-----------|----------|
| `Transfer to Individual` | $0 | ❌ No | Standard transfers to individuals (not reportable) |
| `Transfer to Trust` | $0 | ❌ No | Transfers to trusts - non-reportable variant |
| `Transfer to Trust - FinCEN` | **+$95** | ✅ Yes | Transfers to trusts (requires FinCEN reporting) |
| `Transfer to Company - FinCEN` | **+$95** | ✅ Yes | Transfers to companies (requires FinCEN reporting) |

---

## API Pricing Response

When you request pricing, the response now includes FinCEN data:

```json
{
  "state": "FL",
  "county": "Walton",
  "deed_type": "Transfer to Trust - FinCEN",
  "service_fee": 299,
  "recording_fee": 35,
  "fincen_fee": 95,           // ← New: FinCEN reporting fee
  "fincen_required": true,    // ← New: Whether FinCEN reporting is required
  "premium_discount": 45,
  "total": 429                // ← Includes FinCEN fee if applicable
}
```

---

## Order Response Example

### Non-Reportable (Transfer to Individual)
```json
{
  "pricing": {
    "service_fee": 299,
    "recording_fee": 25,
    "fincen_fee": 0,
    "total": 324           // No FinCEN fee added
  }
}
```

### Reportable (Transfer to Trust - FinCEN)
```json
{
  "pricing": {
    "service_fee": 299,
    "recording_fee": 25,
    "fincen_fee": 95,      // FinCEN fee automatically added
    "total": 419           // Includes $95 FinCEN fee
  }
}
```

---

## Testing Checklist

- [ ] Get pricing with `Transfer to Individual` → fincen_fee should be 0
- [ ] Get pricing with `Transfer to Trust - FinCEN` → fincen_fee should be 95
- [ ] Create order with `Transfer to Company - FinCEN` → total includes $95
- [ ] Create order with `Transfer to Individual - FinCEN` → fincen_required is true but no extra fee
- [ ] Verify premium discount still applies to FinCEN orders
- [ ] Test with different states (FL, NY, etc.)
- [ ] Test with different counties

---

## Curl Examples

### Get Pricing (Non-Reportable)
```bash
curl -X POST https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi \
  -H "Content-Type: application/json" \
  -d '{
    "_path": "/pricing/FL/Walton",
    "_method": "GET",
    "_api_key": "YOUR_API_KEY",
    "deed_type": "Transfer to Individual"
  }'
```

### Get Pricing (Reportable)
```bash
curl -X POST https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi \
  -H "Content-Type: application/json" \
  -d '{
    "_path": "/pricing/FL/Walton",
    "_method": "GET",
    "_api_key": "YOUR_API_KEY",
    "deed_type": "Transfer to Trust - FinCEN"
  }'
```

### Create Order (Reportable)
```bash
curl -X POST https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi \
  -H "Content-Type: application/json" \
  -d '{
    "_path": "/orders",
    "_method": "POST",
    "_api_key": "YOUR_API_KEY",
    "property_address": "123 Main St, Miami, FL 33101",
    "grantor_name": "John Doe",
    "grantee_name": "Jane Doe",
    "contact_name": "John Doe",
    "deed_type": "Transfer to Company - FinCEN",
    "county": "Miami-Dade",
    "state": "FL",
    "contact_email": "test@example.com"
  }'
```

---

## Fee Summary

### Typical Pricing Breakdown

**FL/Walton County - Transfer to Individual**
- Service Fee: $299
- Recording Fee: $35
- Premium Discount: -$45
- **Total: $289**

**FL/Walton County - Transfer to Trust - FinCEN**
- Service Fee: $299
- Recording Fee: $35
- FinCEN Fee: **+$95** ← New
- Premium Discount: -$45
- **Total: $384**

---

## Important Notes

1. **FinCEN Fee is Automatic**: You don't need to calculate it manually - the server adds it based on deed type

2. **Premium Discount Applies First**: Discounts are calculated before FinCEN fee is added

3. **Deed Type Must Match**: Use exact deed type values for API calls

4. **Response Fields Are New**: Make sure your client code handles the new `fincen_fee` and `fincen_required` fields

5. **Backward Compatible**: Existing code using non-FinCEN deed types continues to work unchanged

---

## Error Handling

If you use an invalid deed type:
```json
{
  "error": "Invalid deed type",
  "valid_types": [
    "Transfer to Individual",
    "Transfer to Trust - FinCEN",
    "Transfer to Company - FinCEN",
    "Transfer to Individual - FinCEN"
  ]
}
```

---

## Next Phase: Full FinCEN Reporting

After FinCEN fee integration, the next phase includes:
- ✅ Automatic FinCEN fee calculation (completed 2026-03-05)
- ⏳ FinCEN report submission endpoints
- ⏳ Beneficial owner data collection
- ⏳ PEP/OFAC screening
- ⏳ Filing deadline tracking

See `FinCEN_REPORTING_PROMPT.md` for full implementation details.

---

**Last Updated**: 2026-03-05
**Status**: ✅ Complete and tested
