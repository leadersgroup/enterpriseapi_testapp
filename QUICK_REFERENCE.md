# Quick Reference - Order Attachments

## Attachment Object Structure

```json
{
  "file_url": "https://example.com/document.pdf",
  "file_name": "document.pdf",
  "file_size": 102400
}
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `file_url` | ✅ Yes | string | HTTP/HTTPS URL to file |
| `file_name` | ✅ Yes | string | Filename with extension |
| `file_size` | ❌ No | integer | Size in bytes |

---

## POST /orders with Attachments

```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "your_api_key",
  "property_address": "123 Main St, Miami, FL",
  "grantor_name": "John Doe",
  "grantee_name": "Jane Doe",
  "deed_type": "Quitclaim Deed between Individuals",
  "county": "Miami-Dade",
  "state": "FL",
  "contact_email": "jane@example.com",
  "attachments": [
    {
      "file_url": "https://example.com/deed.pdf",
      "file_name": "deed_draft.pdf",
      "file_size": 102400
    }
  ]
}
```

---

## File URL Examples

### ✅ Valid
- `https://storage.example.com/deeds/deed.pdf`
- `https://cdn.company.com/documents/file.docx`
- `https://api.service.com/v1/download/12345`

### ❌ Invalid
- `file:///Users/documents/deed.pdf` - Local file
- `/documents/deed.pdf` - Relative URL
- `deed.pdf` - Not a full URL
- `http://example.com/file?secure=true` - May require auth

---

## File Name Examples

### ✅ Valid
- `deed_draft.pdf`
- `supporting_docs.docx`
- `signature-page-2026-03-04.jpg`
- `document_v2.pdf`

### ❌ Invalid
- `deed draft.pdf` - Contains space
- `deed @copy.pdf` - Special character
- `file` - No extension
- `deed#final.pdf` - Invalid character

---

## Multiple Attachments

```json
"attachments": [
  {
    "file_url": "https://example.com/deed.pdf",
    "file_name": "deed.pdf",
    "file_size": 102400
  },
  {
    "file_url": "https://example.com/signatures.pdf",
    "file_name": "signatures.pdf",
    "file_size": 75000
  },
  {
    "file_url": "https://example.com/supporting.pdf",
    "file_name": "supporting_docs.pdf",
    "file_size": 256000
  }
]
```

---

## Order Without Attachments (Still Works)

```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "your_api_key",
  "property_address": "456 Oak Ave, Los Angeles, CA",
  "grantor_name": "John Smith",
  "grantee_name": "Jane Smith",
  "deed_type": "Quitclaim Deed",
  "county": "Los Angeles",
  "state": "CA",
  "contact_email": "john@example.com"
  // No attachments - optional
}
```

---

## API Response (Same As Before)

```json
{
  "success": true,
  "order": {
    "id": "69a77bfa351d33b070237412",
    "custom_order_id": "2026-03-04-003",
    "status": "Submitted",
    "property_address": "123 Main St, Miami, FL",
    "created_date": "2026-03-04T00:25:23.123456Z",
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

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid file_url` | URL not accessible | Verify URL works in browser |
| `Missing file_name` | Field not included | Add `"file_name": "name.ext"` |
| `Invalid format` | Bad filename | Remove spaces/special chars |
| `404 Not Found` | File URL broken | Test URL directly |

---

## Testing

```bash
# Run tests with attachments
node test-api.js
python3 test-api.py

# Expected output
Total: 4/5 passed
```

---

## Key Points

✅ Attachments are **optional**
✅ Multiple attachments **supported**
✅ Fully **backward compatible**
✅ Works with all **order types**
✅ Files must be **publicly accessible**
✅ All **file types supported** (PDF, DOC, DOCX, JPG, PNG, etc.)

---

## More Info

- **ATTACHMENTS_FEATURE.md** - Complete documentation
- **API_USAGE_GUIDE.md** - Full API reference
- **README.md** - Project overview
