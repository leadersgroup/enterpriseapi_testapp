# Pricing Endpoint - County Names Reference

## IMPORTANT: Do NOT Use 'default' as County Name

**'default' is RESERVED for fallback logic only!**

When a specific county pricing doesn't exist in the database, the system should fall back to the default pricing. Do NOT use 'default' as an actual county name in requests.

---

## Correct Usage

### ❌ WRONG - Using 'default' as county name
```json
{
  "_path": "/pricing/FL/default",
  "_method": "GET",
  "_api_key": "..."
}
```

### ✅ CORRECT - Using real Florida county names
```json
{
  "_path": "/pricing/FL/Lee",
  "_method": "GET",
  "_api_key": "..."
}
```

---

## Florida County Names

Use actual county names in requests:

| County | Usage |
|--------|-------|
| Lee | ✓ Use in requests |
| Miami-Dade | ✓ Use in requests |
| Broward | ✓ Use in requests |
| Hillsborough | ✓ Use in requests |
| Orange | ✓ Use in requests |
| Duval | ✓ Use in requests |
| Pinellas | ✓ Use in requests |
| Polk | ✓ Use in requests |

---

## Pricing Fallback Behavior

### Current Behavior (No Fallback Yet)
```
GET /pricing/FL/Lee
↓
County 'Lee' not found in database
↓
Return: 404 "No pricing found for Lee, FL"
```

### Expected Behavior (Once Fallback Implemented)
```
GET /pricing/FL/Lee
↓
County 'Lee' not found in database
↓
Fall back to default FL pricing
↓
Return: 200 OK with default pricing
{
  "state": "FL",
  "county": "default",
  "service_fee": 299,
  "recording_fee": 25,
  "total": 324
}
```

---

## Test Suite

The test suite correctly uses real county names:

**Node.js Test:**
```javascript
const pricingResponse = await makeRequest('GET', '/pricing/FL/Lee');
```

**Python Test:**
```python
api_path = "/pricing/FL/Miami-Dade"
```

✅ Both use actual counties, not 'default'

---

## Key Points to Remember

1. ✅ Always use real county names (Lee, Miami-Dade, etc.)
2. ❌ Never use 'default' as a county name in requests
3. 'default' is only for internal fallback logic
4. Once fallback is implemented, any county will return pricing
5. Premium users will get discounted pricing automatically

---

**Last Updated:** 2026-03-04
**Status:** Important - Remember this distinction
