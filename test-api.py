#!/usr/bin/env python3
"""50Deeds Enterprise API v4.0 test suite (sandbox).

Transport note: the v4.0 reference documents REST-style URLs
(GET /functions/enterpriseApi/pricing/FL/Miami-Dade?deed_type=...), but Base44
does not route sub-paths to a function -- those URLs return 404. Every call is a
POST to the function root with the logical path/method in the body (_path,
_method); GET query params go in the body too. Auth uses the documented
Authorization: Bearer header.
"""

import json
import os
import random
import string
import sys
import tempfile
import time

import requests

HOST = os.environ.get("API_HOST", "https://50-deeds-enterprise-testenv-385a4bcc.base44.app")
API_KEY = os.environ.get("API_KEY", "c24398ff06861986a415b4b44b89b0fc29caecb7f045113c797b20f086b3b87a")
API_URL = f"{HOST}/functions/enterpriseApi"
UPLOAD_URL = f"{HOST}/functions/uploadDocument"
AUTH = {"Authorization": f"Bearer {API_KEY}"}

results = []


def show(res):
    print(f"\nRESPONSE {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except ValueError:
        print(res.text)


def api(method, api_path, **params):
    body = {"_path": api_path, "_method": method, **params}
    print(f"\n{'=' * 70}\nREQUEST: {method} {api_path}\nPOST {API_URL}")
    print(f"Authorization: Bearer ***{API_KEY[-8:]}")
    print(json.dumps(body, indent=2))
    res = requests.post(API_URL, json=body, headers=AUTH, timeout=30)
    show(res)
    return res


def body_of(res):
    try:
        return res.json()
    except ValueError:
        return {}


def check(name, res, expected, extra=True):
    ok = res.status_code in expected and bool(extra)
    print(f"\n{'✓ PASS' if ok else '✗ FAIL'}: {name} (expected {'/'.join(map(str, expected))}, got {res.status_code})")
    results.append((name, ok))
    return ok


def step(name, fn):
    try:
        fn()
    except Exception as e:  # noqa: BLE001 - report and keep going
        print(f"✗ FAIL: {name} - {e}")
        results.append((name, False))


def base_order(**overrides):
    ref = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    order = {
        "deed_type": "Individual to trust",
        "property_address": "123 Main St, Miami, FL 33101",
        "grantor_name": "John Doe, individually",
        "grantee_name": "John Doe, Trustee of the Doe Family Trust dated 01/15/2026",
        "contact_name": "John Doe",
        "contact_email": "test@example.com",
        "county": "Miami-Dade",
        "state": "FL",
        "additional_instructions": "Automated sandbox test order",
        "client_reference": f"TEST-{int(time.time() * 1000)}-{ref}",
    }
    order.update(overrides)
    return order


def main():
    print(f"\n{'█' * 70}\n50Deeds Enterprise API v4.0 Test Suite\nHost: {HOST}\n{'█' * 70}")
    state = {"order_id": None, "webhook_id": None}

    def pricing_legacy():
        r = api("GET", "/pricing/FL/Miami-Dade",
                deed_type="Transfer from entity to Trust: FinCEN reportable (Legacy)")
        check("Pricing: FL/Miami-Dade, legacy reportable", r, [200], body_of(r).get("fincen_required") is True)

    def pricing_new():
        r = api("GET", "/pricing/FL/Walton", deed_type="Individual to individual")
        check("Pricing: FL/Walton, Individual to individual", r, [200],
              isinstance(body_of(r).get("total"), (int, float)))

    def list_orders():
        r = api("GET", "/orders", state="FL")
        check("List orders", r, [200], isinstance(body_of(r).get("orders"), list))

    def history():
        r = api("GET", "/orders/history", limit=5, sort_by="created_date", sort_dir="desc")
        check("Order history (paginated)", r, [200], "pagination" in body_of(r))

    order = base_order()

    def create():
        r = api("POST", "/orders", **order)
        if check("Create order (FL, no SSN)", r, [201], body_of(r).get("order", {}).get("id")):
            state["order_id"] = body_of(r)["order"]["id"]

    def lookup():
        r = api("GET", "/orders", client_reference=order["client_reference"])
        check("Lookup by client_reference", r, [200], len(body_of(r).get("orders", [])) == 1)

    def get_order():
        oid = state["order_id"] or "invalid-id"
        r = api("GET", f"/orders/{oid}")
        check("Get specific order", r, [200], body_of(r).get("id") == state["order_id"])

    def upload_doc():
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(b"%PDF-1.4\n% 50deeds sandbox test\n")
            tmp = f.name
        print(f"\n{'=' * 70}\nREQUEST: POST {UPLOAD_URL} (multipart, order_id={state['order_id'] or '-'})")
        try:
            with open(tmp, "rb") as fh:
                data = {"order_id": state["order_id"]} if state["order_id"] else {}
                r = requests.post(UPLOAD_URL, headers=AUTH, timeout=60,
                                  files={"file": ("test.pdf", fh, "application/pdf")}, data=data)
        finally:
            os.unlink(tmp)
        show(r)
        check("Upload document to order", r, [200, 201], body_of(r).get("file_url"))

    ny = {"property_address": "500 5th Ave, New York, NY 10110", "county": "New York", "state": "NY"}

    def ny_missing_ssn():
        r = api("POST", "/orders", **base_order(**ny))
        check("NY order without SSNs -> 400", r, [400], "ssn" in r.text.lower())

    def ny_with_ssn():
        r = api("POST", "/orders", **base_order(deed_type="Individual to company", grantor_ssn="123-45-6789",
                                                grantee_ssn="987-65-4321", **ny))
        check("NY order with SSNs", r, [201])

    # deed_type is matched case-sensitively against the Order entity enum, which capitalizes
    # "Trust to Individual", "Company to Trust" and "Company to Company".
    def doc_casing():
        r = api("POST", "/orders", **base_order(deed_type="Company to Trust"))
        check('Capitalized deed_type "Company to Trust" accepted', r, [201])

    def malformed():
        r = api("POST", "/orders", deed_type="Individual to individual")
        check("Malformed order -> 400", r, [400], body_of(r).get("error"))

    def register_webhook():
        r = api("POST", "/webhooks/register", url="https://example.com/webhooks/50deeds",
                description="Automated test")
        if check("Register webhook", r, [201], body_of(r).get("webhook", {}).get("id")):
            state["webhook_id"] = body_of(r)["webhook"]["id"]

    def delete_webhook():
        r = api("DELETE", f"/webhooks/{state['webhook_id'] or 'wh_missing'}")
        check("Delete webhook", r, [200], body_of(r).get("success") is True)

    step("Pricing: FL/Miami-Dade, legacy reportable", pricing_legacy)
    step("Pricing: FL/Walton, Individual to individual", pricing_new)
    step("List orders", list_orders)
    step("Order history (paginated)", history)
    step("Create order (FL, no SSN)", create)
    step("Lookup by client_reference", lookup)
    step("Get specific order", get_order)
    step("Upload document to order", upload_doc)
    step("NY order without SSNs -> 400", ny_missing_ssn)
    step("NY order with SSNs", ny_with_ssn)
    step('Capitalized deed_type "Company to Trust" accepted', doc_casing)
    step("Malformed order -> 400", malformed)
    step("Register webhook", register_webhook)
    step("Delete webhook", delete_webhook)

    print(f"\n{'█' * 70}\nTEST SUMMARY\n{'█' * 70}")
    for name, ok in results:
        print(f"{'✓' if ok else '✗'} {name}")
    passed = sum(1 for _, ok in results if ok)
    print(f"\nTotal: {passed}/{len(results)} passed\n")
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    main()
