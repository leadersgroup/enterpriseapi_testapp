# FINCEN Quick Reference Guide

## Deed Types Comparison

| Deed Type | FINCEN Fee | Reportable | Use Case |
|-----------|-----------|-----------|----------|
| `Transfer to Individual` | $0 | ❌ No | Standard transfers to individuals (not reportable) |
| `Transfer to Individual - FINCEN` | $0 | ❌ No | Named variant (not reportable) |
| `Transfer to Trust - FINCEN` | **+$95** | ✅ Yes | Transfers to trusts (requires FINCEN reporting) |
| `Transfer to Company - FINCEN` | **+$95** | ✅ Yes | Transfers to companies (requires FINCEN reporting) |

---

## API Pricing Response

When you request pricing, the response now includes FINCEN data:

```json
{
  "state": "FL",
  "county": "Walton",
  "deed_type": "Transfer to Trust - FINCEN",
  "service_fee": 299,
  "recording_fee": 35,
  "fincen_fee": 95,           // ← New: FINCEN reporting fee
  "fincen_required": true,    // ← New: Whether FINCEN reporting is required
  "premium_discount": 45,
  "total": 429                // ← Includes FINCEN fee if applicable
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
    "total": 324           // No FINCEN fee added
  }
}
```

### Reportable (Transfer to Trust - FINCEN)
```json
{
  "pricing": {
    "service_fee": 299,
    "recording_fee": 25,
    "fincen_fee": 95,      // FINCEN fee automatically added
    "total": 419           // Includes $95 FINCEN fee
  }
}
```

---

## Testing Checklist

- [ ] Get pricing with `Transfer to Individual` → fincen_fee should be 0
- [ ] Get pricing with `Transfer to Trust - FINCEN` → fincen_fee should be 95
- [ ] Create order with `Transfer to Company - FINCEN` → total includes $95
- [ ] Create order with `Transfer to Individual - FINCEN` → fincen_required is true but no extra fee
- [ ] Verify premium discount still applies to FINCEN orders
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
    "deed_type": "Transfer to Trust - FINCEN"
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
    "deed_type": "Transfer to Company - FINCEN",
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

**FL/Walton County - Transfer to Trust - FINCEN**
- Service Fee: $299
- Recording Fee: $35
- FINCEN Fee: **+$95** ← New
- Premium Discount: -$45
- **Total: $384**

---

## Important Notes

1. **FINCEN Fee is Automatic**: You don't need to calculate it manually - the server adds it based on deed type

2. **Premium Discount Applies First**: Discounts are calculated before FINCEN fee is added

3. **Deed Type Must Match**: Use exact deed type values for API calls

4. **Response Fields Are New**: Make sure your client code handles the new `fincen_fee` and `fincen_required` fields

5. **Backward Compatible**: Existing code using non-FINCEN deed types continues to work unchanged

---

## Error Handling

If you use an invalid deed type:
```json
{
  "error": "Invalid deed type",
  "valid_types": [
    "Transfer to Individual",
    "Transfer to Trust - FINCEN",
    "Transfer to Company - FINCEN",
    "Transfer to Individual - FINCEN"
  ]
}
```

---

## Next Phase: Full FinCEN Reporting

After FINCEN fee integration, the next phase includes:
- ✅ Automatic FINCEN fee calculation (completed 2026-03-05)
- ⏳ FinCEN report submission endpoints
- ⏳ Beneficial owner data collection
- ⏳ PEP/OFAC screening
- ⏳ Filing deadline tracking

See `FINCEN_REPORTING_PROMPT.md` for full implementation details.

---

**Last Updated**: 2026-03-05
**Status**: ✅ Complete and tested
