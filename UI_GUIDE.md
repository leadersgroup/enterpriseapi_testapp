# Enterprise API Tester UI Guide

## Overview

The **index.html** file provides a complete web-based interface for testing all Enterprise API endpoints. It simulates a premium plan enterprise client user with full access to the deed recording service.

## Features

### 📋 Three Main Tabs

#### 1. **Pricing Tab**
- **GET /pricing/{state}/{county}** - Retrieve pricing information
- Quick preset buttons for common Florida counties:
  - FL / Lee
  - FL / Miami-Dade
  - FL / Broward
  - FL / default
- Dynamically query any state/county combination

#### 2. **Orders Tab**
- **GET /orders** - List all orders in the system
- **GET /orders/{order_id}** - Retrieve specific order details
  - "Use Latest" button automatically populates the last retrieved order ID
- **POST /orders** - Create new deed recording orders
  - Full form with all required fields
  - Support for optional attachments
  - Multiple deed type options

#### 3. **Webhooks Tab**
- **POST /webhooks/register** - Register webhook URLs
- Optional webhook description field
- Real-time notification configuration

### ⚙️ Configuration Panel

- **API Key**: Pre-filled with your Enterprise API key (can be modified)
- **Base URL**: Pre-configured endpoint (can be changed)
- **User Profile**: Shows simulated premium plan member details
- **Test Summary**: Displays latest order ID and test results
- **Quick Tests**: Run all 5 tests in sequence

### 📤 Response Viewer

Split-panel design showing:
- **Request Details**: Complete request structure with sanitized API key
- **Response Data**: HTTP status and formatted JSON response

### 🧪 Features

#### Real-time Request/Response Display
- See exactly what's being sent to the API
- View formatted JSON responses
- HTTP status codes with color indicators

#### Attachment Management
- Add multiple file attachments per order
- Specify file URL, name, and optional size
- Remove attachments easily

#### Quick Parameters
- Pre-populated form fields with sample data
- One-click preset buttons for common test cases
- "Clear" button to reset order form

#### Automatic Order ID Capture
- First order retrieved automatically stored
- "Use Latest" button uses most recent order ID
- Enables easy chaining of order retrieval tests

#### Bulk Testing
- "Run All Tests" button executes full test suite
- Tests run sequentially with 500ms delays
- Display summary with pass/fail counts

## How to Use

### 1. Open the UI
```bash
# Open in your default browser
open index.html

# Or manually navigate to the file in your browser
```

### 2. Configure API Access (Optional)
- API key and Base URL are pre-filled
- Modify if testing against different environment

### 3. Test Individual Endpoints

**Test Pricing:**
1. Click the "Pricing" tab
2. Select a county from quick buttons or enter custom values
3. Click "Send Request"
4. View response in the right panel

**Test Orders:**
1. Click the "Orders" tab
2. Click "Get Orders" to list all orders
3. Click "Use Latest" to populate the first order ID
4. Click "Get Order" to retrieve that order's details
5. Fill order form and click "Create Order" to add new order

**Test Webhooks:**
1. Click the "Webhooks" tab
2. Enter webhook URL (e.g., https://your-domain.com/webhook)
3. Optionally add description
4. Click "Register Webhook"

### 4. Add Attachments to Orders

1. Scroll to "Attachments" section in Order form
2. Click "+ Add Attachment"
3. Enter:
   - **File URL**: Publicly accessible HTTPS URL
   - **File Name**: Filename (e.g., deed_draft.pdf)
   - **File Size** (optional): Size in bytes
4. Add multiple attachments as needed
5. Click "Remove" to delete an attachment

### 5. Run All Tests
1. Click "Run All Tests" in Configuration panel
2. Tests execute in sequence:
   - Get Pricing (FL/Lee)
   - List Orders
   - Get Specific Order
   - Create Order (with attachment)
   - Register Webhook
3. View results summary showing pass/fail count

## Example Workflows

### Workflow 1: Basic Order Creation
1. Open UI in browser
2. Click "Orders" tab
3. Review pre-filled order form
4. Click "Create Order"
5. Check response for order ID and pricing

### Workflow 2: Test Pricing Fallback
1. Click "Pricing" tab
2. Click "FL / Lee" (tests fallback to default)
3. Check if status is 200 and pricing is returned
4. Try other counties to test fallback behavior

### Workflow 3: Complete Order Lifecycle
1. List all orders (click "Get Orders")
2. View latest order details (click "Use Latest" then "Get Order")
3. Create new order with attachments
4. Register webhook for notifications
5. Run full test suite to validate all endpoints

### Workflow 4: Attachment Testing
1. Go to Orders tab
2. Click "+ Add Attachment" multiple times
3. Enter test attachment URLs
4. Create order
5. Check response includes attachment references

## Test Results Summary

The UI displays test results showing:
- ✓ **Passed**: Number of successful API calls
- ✗ **Failed**: Number of failed API calls
- **Total**: Tests run / Total tests

### Current Status (4/5 Passing)
- ✓ List Orders - 200 OK
- ✓ Get Specific Order - 200 OK
- ✓ Create Order - 201 Created
- ✓ Register Webhook - 201 Created
- ✗ Get Pricing - 404 (waiting for fallback implementation)

## User Simulation

The UI simulates a **premium plan enterprise client** with:
- Automatic server-side plan detection
- No plan parameter needed in requests
- Discounted pricing based on user profile
- Full access to all endpoints

## Response Codes

| Status | Meaning |
|--------|---------|
| 200 | Success - GET request |
| 201 | Created - POST request success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

## Tips & Tricks

1. **Pre-fill Data**: Form fields come with sample data. Edit as needed.

2. **Quick Testing**: Use preset buttons for fast switching between common test cases.

3. **Error Messages**: Check response body for detailed error explanations.

4. **Test Chaining**:
   - Run "Get Orders" first to populate latest order ID
   - Click "Use Latest" to automatically fill order ID field
   - Test "Get Order" on the populated ID

5. **Attachment URLs**: Must be publicly accessible HTTPS URLs. Test in browser first.

6. **API Key**: Sanitized in request display (shows only last 8 characters).

7. **Bulk Testing**: "Run All Tests" includes 500ms delays between requests to avoid rate limiting.

## Troubleshooting

### "Invalid API Key" Error
- Verify API key in Configuration panel
- Check key copied correctly (no extra spaces)

### CORS Issues
- Browser may block cross-origin requests
- Use browser DevTools to check Network tab
- Ensure API endpoint is CORS-enabled

### Attachment Not Accepted
- Verify file URL is HTTPS (not HTTP)
- Test URL in browser to ensure it's accessible
- Check file name format (no special characters)

### Order ID Not Populating
- Run "Get Orders" first to retrieve latest order
- Check response shows orders array with IDs
- Try copying order ID manually

## Files

- **index.html** - Complete UI (this interface)
- **test-api.js** - Node.js automated test suite
- **test-api.py** - Python automated test suite
- **api-config.json** - API configuration reference

## Next Steps

1. Open **index.html** in web browser
2. Test individual endpoints using the UI
3. Run "Run All Tests" to validate API
4. Create test orders with attachments
5. Monitor pricing endpoint for fallback implementation

---

**Status**: Production Ready ✅
**Test Coverage**: 5 endpoints
**User Type**: Premium Plan Member
**Last Updated**: 2026-03-04
