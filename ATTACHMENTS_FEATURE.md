# Order Attachments Feature - API Update

## 📋 New Feature: File Attachments Support

The POST /orders endpoint now accepts an optional `attachments` array, allowing you to include supporting documents with deed orders.

---

## 🔧 Request Format

### Basic Order with Attachments
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "your_api_key",
  "property_address": "123 Main St, Miami, FL 33101",
  "grantor_name": "John Doe",
  "grantee_name": "Jane Doe",
  "deed_type": "Quitclaim Deed between Individuals",
  "county": "Miami-Dade",
  "state": "FL",
  "contact_email": "test@example.com",
  "attachments": [
    {
      "file_url": "https://example.com/documents/deed_draft.pdf",
      "file_name": "deed_draft.pdf",
      "file_size": 102400
    }
  ]
}
```

---

## 📎 Attachment Structure

Each attachment object requires:

```json
{
  "file_url": "https://example.com/path/to/file.pdf",
  "file_name": "document_name.pdf",
  "file_size": 102400
}
```

### Required Fields
- **`file_url`** (string) - Full URL to the file for download
  - Must be a valid HTTP/HTTPS URL
  - File must be accessible from the API server
  - Supports all common document formats (PDF, DOC, DOCX, JPG, PNG, etc.)

- **`file_name`** (string) - Name of the file including extension
  - Used for display and storage
  - Examples: "deed_draft.pdf", "supporting_docs.docx", "signature_page.jpg"

### Optional Fields
- **`file_size`** (integer) - Size of the file in bytes
  - Helps with file validation and storage planning
  - Optional but recommended for larger files

---

## 💡 Examples

### Single Attachment
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "your_api_key",
  "property_address": "456 Oak Ave, Los Angeles, CA 90001",
  "grantor_name": "Jane Smith",
  "grantee_name": "John Smith",
  "deed_type": "Quitclaim Deed between Individuals (Add/Remove name)",
  "county": "Los Angeles",
  "state": "CA",
  "contact_email": "jane.smith@example.com",
  "attachments": [
    {
      "file_url": "https://storage.example.com/deeds/deed_20260304.pdf",
      "file_name": "deed_draft.pdf",
      "file_size": 204800
    }
  ]
}
```

### Multiple Attachments
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "your_api_key",
  "property_address": "789 Elm St, New York, NY 10001",
  "grantor_name": "Robert Johnson",
  "grantee_name": "Sarah Johnson",
  "deed_type": "Warranty Deed",
  "county": "New York",
  "state": "NY",
  "contact_email": "robert@example.com",
  "attachments": [
    {
      "file_url": "https://storage.example.com/deeds/main_deed.pdf",
      "file_name": "warranty_deed.pdf",
      "file_size": 150000
    },
    {
      "file_url": "https://storage.example.com/deeds/signatures.pdf",
      "file_name": "signature_pages.pdf",
      "file_size": 75000
    },
    {
      "file_url": "https://storage.example.com/deeds/supporting.pdf",
      "file_name": "supporting_documents.pdf",
      "file_size": 325000
    }
  ]
}
```

### No Attachments (Still Works)
```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "your_api_key",
  "property_address": "321 Pine Rd, Chicago, IL 60601",
  "grantor_name": "Michael Brown",
  "grantee_name": "Jennifer Brown",
  "deed_type": "Quitclaim Deed between Individuals",
  "county": "Cook",
  "state": "IL",
  "contact_email": "michael@example.com"
}
```

---

## ✅ API Response

The response remains the same as before:

```json
{
  "success": true,
  "order": {
    "id": "69a77bfa351d33b070237412",
    "custom_order_id": "2026-03-04-003",
    "status": "Submitted",
    "property_address": "123 Main St, Miami, FL 33101",
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

## 🧪 Testing

### Node.js Test
```bash
node test-api.js
```

The test script now includes an order with a sample attachment.

### Python Test
```bash
python3 test-api.py
```

The Python test script also includes an order with a sample attachment.

---

## 📋 Validation Rules

### File URL Requirements
- ✅ Must be valid HTTP or HTTPS URL
- ✅ Must be publicly accessible (no authentication required)
- ✅ File must be downloadable
- ❌ No file:// protocol (local files)
- ❌ No relative URLs

### File Name Requirements
- ✅ Must include file extension
- ✅ Can contain letters, numbers, hyphens, underscores, periods
- ✅ Examples: "deed_draft.pdf", "doc_2026-03-04.docx"
- ❌ No special characters except - and _
- ❌ No spaces in file names

### File Size Recommendations
- ✅ Individual files: Up to 50 MB each
- ✅ Total attachments per order: Up to 200 MB
- ✅ Common sizes: PDF documents are typically 50KB - 5MB

---

## ⚠️ Common Issues & Solutions

### "Invalid file_url"
**Cause:** URL is not valid or file is not accessible
**Solution:**
- Verify URL is correct
- Test URL in browser
- Ensure file is publicly accessible
- Use HTTPS if possible

### "Missing file_name"
**Cause:** file_name field is not provided
**Solution:**
- Include file_name with extension (e.g., "deed.pdf")
- Make sure field name is exactly "file_name"

### "Invalid file_name format"
**Cause:** File name contains invalid characters
**Solution:**
- Remove special characters except - and _
- Use only: letters, numbers, dots, hyphens, underscores
- Include file extension

---

## 🔄 Backward Compatibility

✅ **The attachments feature is fully backward compatible**

Orders created without the `attachments` field will continue to work exactly as before. The field is completely optional.

```json
// This still works fine
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "...",
  "property_address": "...",
  "grantor_name": "...",
  "grantee_name": "...",
  "deed_type": "...",
  "county": "...",
  "state": "...",
  "contact_email": "..."
  // No attachments - works fine
}
```

---

## 📊 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Single attachment | ✅ Supported | Works perfectly |
| Multiple attachments | ✅ Supported | Array of up to N files |
| File URL validation | ✅ Implemented | Server validates URLs |
| File name validation | ✅ Implemented | Server validates format |
| Optional feature | ✅ Yes | Attachments not required |
| Backward compatible | ✅ Yes | Existing orders still work |

---

## 🚀 Next Steps

1. **Update your client code** to include attachments when creating orders
2. **Use valid file URLs** - ensure files are hosted on accessible servers
3. **Test your implementation** using the test scripts
4. **Verify files are attached** by checking order details

---

## 📚 Related Documentation

- **API_USAGE_GUIDE.md** - Complete API reference (updated with attachments examples)
- **test-api.js** - Node.js test script with sample attachment
- **test-api.py** - Python test script with sample attachment
- **README.md** - Project overview

---

**Feature Release Date:** 2026-03-04
**Status:** Production Ready ✅
