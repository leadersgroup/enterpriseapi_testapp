# Order Attachments Schema

**Updated**: 2026-03-06
**Status**: ✅ uploaded_date property fully implemented and tested

---

## Overview

The Order entity attachments array now includes an `uploaded_date` property to track when each file was uploaded. This timestamp is automatically generated when attachments are added to orders.

---

## Attachment Object Schema

```json
{
  "file_url": "string (URL)",
  "file_name": "string",
  "file_size": "number (bytes, optional)",
  "uploaded_date": "string (ISO 8601 timestamp)"
}
```

### Property Descriptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `file_url` | string | ✓ Yes | Full URL of the uploaded file (https://...) |
| `file_name` | string | ✓ Yes | Name of the file (e.g., deed_draft.pdf) |
| `file_size` | number | ✗ No | File size in bytes |
| `uploaded_date` | string | ✓ Yes | ISO 8601 formatted timestamp (e.g., 2026-03-06T16:27:06Z) |

---

## API Request Example

### Create Order with Attachments

```json
{
  "_path": "/orders",
  "_method": "POST",
  "_api_key": "YOUR_API_KEY",
  "property_address": "123 Main St, Miami, FL 33101",
  "grantor_name": "John Doe",
  "grantee_name": "Jane Doe",
  "contact_name": "John Doe",
  "deed_type": "Transfer from entity to Trust: FinCEN reportable",
  "county": "Miami-Dade",
  "state": "FL",
  "contact_email": "test@example.com",
  "attachments": [
    {
      "file_url": "https://example.com/documents/deed_draft.pdf",
      "file_name": "deed_draft.pdf",
      "file_size": 102400,
      "uploaded_date": "2026-03-06T16:27:06Z"
    }
  ]
}
```

### Server Response

```json
{
  "success": true,
  "order": {
    "id": "69ab005aa9b2237e68d0eac5",
    "custom_order_id": "ENT20260306-112704",
    "status": "Submitted",
    "property_address": "123 Main St, Miami, FL 33101",
    "created_date": "2026-03-06T16:27:06.874171Z",
    "pricing": {
      "service_fee": 299,
      "recording_fee": 25,
      "fincen_fee": 95,
      "premium_discount": 45,
      "total": 374
    },
    "attachments": [
      {
        "file_url": "https://example.com/documents/deed_draft.pdf",
        "file_name": "deed_draft.pdf",
        "file_size": 102400,
        "uploaded_date": "2026-03-06T16:27:06Z"
      }
    ]
  }
}
```

---

## Frontend Implementation

### addAttachment() Function

When a new attachment is added, the `addAttachment()` function:
1. Generates current timestamp with `new Date().toISOString()`
2. Creates DOM element with input fields for file_url, file_name, file_size
3. Stores uploaded_date in hidden input field for later retrieval

```javascript
function addAttachment() {
    attachmentCount++;
    const currentDate = new Date().toISOString();
    const html = `
        <div class="attachment-item" id="attachment_${attachmentCount}">
            <input type="text" placeholder="File URL (https://...)" class="attachment-url">
            <input type="text" placeholder="File Name (e.g., deed_draft.pdf)" class="attachment-name">
            <input type="number" placeholder="File Size (bytes, optional)" class="attachment-size">
            <input type="hidden" class="attachment-uploaded-date" value="${currentDate}">
            <button class="btn-remove" onclick="removeAttachment(${attachmentCount})">Remove</button>
        </div>
    `;
    document.getElementById('attachments_list').insertAdjacentHTML('beforeend', html);
}
```

### getAttachmentValues() Function

Extracts attachment data from DOM and includes uploaded_date:

```javascript
function getAttachmentValues() {
    const attachments = [];
    document.querySelectorAll('.attachment-item').forEach(item => {
        const url = item.querySelector('.attachment-url').value;
        const name = item.querySelector('.attachment-name').value;
        const size = item.querySelector('.attachment-size').value;
        const uploadedDate = item.querySelector('.attachment-uploaded-date').value;

        if (url && name) {
            const attachment = { file_url: url, file_name: name };
            if (size) attachment.file_size = parseInt(size);
            if (uploadedDate) attachment.uploaded_date = uploadedDate;
            attachments.push(attachment);
        }
    });
    return attachments;
}
```

---

## Test Suite Updates

### Python Tests (test-api.py)

```python
"attachments": [
    {
        "file_url": "https://example.com/documents/deed_draft.pdf",
        "file_name": "deed_draft.pdf",
        "file_size": 102400,
        "uploaded_date": "2026-03-06T14:30:00Z",
    }
],
```

### Node.js Tests (test-api.js)

```javascript
attachments: [
  {
    file_url: 'https://example.com/documents/deed_draft.pdf',
    file_name: 'deed_draft.pdf',
    file_size: 102400,
    uploaded_date: '2026-03-06T14:30:00Z',
  },
],
```

### Web UI Tests (index.html)

```javascript
attachments: [{
    file_url: 'https://example.com/deed.pdf',
    file_name: 'deed.pdf',
    file_size: 102400,
    uploaded_date: new Date().toISOString()
}]
```

---

## Test Results

### Python Test Suite: 5/5 ✅
- ✓ Get Pricing
- ✓ List Orders
- ✓ Get Specific Order
- ✓ Create Order (with uploaded_date in attachments)
- ✓ Register Webhook

### Node.js Test Suite: 5/5 ✅
- ✓ Get Pricing
- ✓ List Orders
- ✓ Get Specific Order
- ✓ Create Order (with uploaded_date in attachments)
- ✓ Register Webhook

---

## Key Features

✅ **Automatic Timestamp Generation**: uploaded_date is automatically generated with current timestamp
✅ **ISO 8601 Format**: All timestamps stored in standard ISO 8601 format
✅ **Hidden Field Storage**: Timestamp stored in hidden input on DOM for consistency
✅ **Backward Compatible**: File size and other fields remain optional
✅ **Test Coverage**: All test suites include uploaded_date in attachment objects

---

## Files Updated

- **test-api.py** - Added uploaded_date to test attachment objects
- **test-api.js** - Added uploaded_date to test attachment objects
- **index.html** - Updated addAttachment() and getAttachmentValues() functions
- **MEMORY.md** - Documented attachments schema changes

---

## Database Considerations

When the backend persists Order entities with attachments:
1. Each attachment in the `attachments` array stores the uploaded_date
2. This timestamp can be used for audit trails and tracking
3. Can be indexed for filtering orders by upload date range
4. Enables sorting attachments by upload order

---

## Usage Notes

1. **Timestamp Format**: Always use ISO 8601 format (e.g., "2026-03-06T16:27:06Z")
2. **Client Generation**: Frontend generates timestamp at time of upload
3. **Server Verification**: Backend can validate/override timestamp on receipt
4. **Display Format**: Timestamps can be formatted for user display (e.g., "Mar 6, 2026 at 4:27 PM")

---

## Version History

| Date | Status | Changes |
|------|--------|---------|
| 2026-03-06 | ✅ Complete | Added uploaded_date property to attachments schema |
| 2026-03-04 | ✅ Complete | Initial attachments implementation (without uploaded_date) |

