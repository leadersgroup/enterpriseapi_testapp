#!/usr/bin/env python3

import requests
import json
import sys

BASE_URL = "https://50-deedscom-enterprise-db0653f4.base44.app/api/functions/enterpriseApi"
API_KEY = "fc779b2e4c79cecec9f995d5098eac8ae8ba4e6ccd289ea9cf9ce3b8fbd95261"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def log_request(method, path, body=None):
    """Log the request details."""
    print(f"\n{'='*70}")
    print(f"REQUEST: {method} {path}")
    print(f"URL: {BASE_URL}")
    print(f"Headers: Authorization: Bearer {API_KEY[:20]}...")
    if body:
        print(f"Body: {json.dumps(body, indent=2)}")
    print('='*70)

def log_response(response):
    """Log the response details."""
    print(f"\nRESPONSE Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    try:
        parsed = response.json()
        print(f"Body: {json.dumps(parsed, indent=2)}")
    except:
        print(f"Body: {response.text}")

def check_status(response, expected_status, test_name):
    """Check if response status matches expected."""
    passed = response.status_code == expected_status
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"\n{status}: {test_name}")
    print(f"  Expected: {expected_status}, Got: {response.status_code}")
    return passed

def test_get_pricing():
    """Test: Get Pricing"""
    api_path = "/pricing/FL/Miami-Dade"
    log_request("GET", api_path)
    try:
        payload = {
            "path": api_path,
            "method": "GET",
        }
        response = requests.post(BASE_URL, json=payload, headers=HEADERS, timeout=10)
        log_response(response)
        return check_status(response, 200, "Get Pricing - Should return 200")
    except requests.exceptions.RequestException as e:
        print(f"✗ FAIL: Get Pricing - Request failed")
        print(f"Error: {str(e)}")
        return False

def test_list_orders():
    """Test: List Orders"""
    api_path = "/orders"
    log_request("GET", api_path)
    try:
        payload = {
            "path": api_path,
            "method": "GET",
        }
        response = requests.post(BASE_URL, json=payload, headers=HEADERS, timeout=10)
        log_response(response)
        return check_status(response, 200, "List Orders - Should return 200")
    except requests.exceptions.RequestException as e:
        print(f"✗ FAIL: List Orders - Request failed")
        print(f"Error: {str(e)}")
        return False

def test_get_specific_order():
    """Test: Get Specific Order"""
    api_path = "/orders/test-order-id-123"
    log_request("GET", api_path)
    try:
        payload = {
            "path": api_path,
            "method": "GET",
        }
        response = requests.post(BASE_URL, json=payload, headers=HEADERS, timeout=10)
        log_response(response)
        return check_status(response, 200, "Get Specific Order - Should return 200 or 404")
    except requests.exceptions.RequestException as e:
        print(f"✗ FAIL: Get Specific Order - Request failed")
        print(f"Error: {str(e)}")
        return False

def test_create_order():
    """Test: Create Order"""
    api_path = "/orders"
    order_data = {
        "property_address": "123 Main St, Miami, FL 33101",
        "grantor_name": "John Doe",
        "deed_type": "Quitclaim Deed between Individuals (Add/Remove name)",
        "county": "Miami-Dade",
        "state": "FL",
        "additional_instructions": "Test order",
    }
    log_request("POST", api_path, order_data)
    try:
        payload = {
            "path": api_path,
            "method": "POST",
            **order_data,
        }
        response = requests.post(BASE_URL, json=payload, headers=HEADERS, timeout=10)
        log_response(response)
        return check_status(response, 201, "Create Order - Should return 201")
    except requests.exceptions.RequestException as e:
        print(f"✗ FAIL: Create Order - Request failed")
        print(f"Error: {str(e)}")
        return False

def test_register_webhook():
    """Test: Register Webhook"""
    api_path = "/webhooks/register"
    webhook_data = {
        "url": "https://your-endpoint.com/webhook",
    }
    log_request("POST", api_path, webhook_data)
    try:
        payload = {
            "path": api_path,
            "method": "POST",
            **webhook_data,
        }
        response = requests.post(BASE_URL, json=payload, headers=HEADERS, timeout=10)
        log_response(response)
        return check_status(response, 200, "Register Webhook - Should return 200 or 201")
    except requests.exceptions.RequestException as e:
        print(f"✗ FAIL: Register Webhook - Request failed")
        print(f"Error: {str(e)}")
        return False

def main():
    """Run all tests."""
    print(f"\n{'█'*70}")
    print("Enterprise API Test Suite")
    print(f"{'█'*70}")

    results = []

    # Run tests
    results.append(("Get Pricing (FL/Miami-Dade)", test_get_pricing()))
    results.append(("List Orders", test_list_orders()))
    results.append(("Get Specific Order", test_get_specific_order()))
    results.append(("Create Order", test_create_order()))
    results.append(("Register Webhook", test_register_webhook()))

    # Summary
    print(f"\n{'█'*70}")
    print("TEST SUMMARY")
    print(f"{'█'*70}")
    for test_name, passed in results:
        status = "✓" if passed else "✗"
        print(f"{status} {test_name}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} passed")
    print(f"{'█'*70}\n")

    sys.exit(0 if passed_count == total_count else 1)

if __name__ == "__main__":
    main()
