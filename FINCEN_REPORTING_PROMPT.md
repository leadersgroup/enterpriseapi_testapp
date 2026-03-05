# FinCEN Residential Reporting Implementation for 50Deeds Enterprise API

## System Prompt for Base44 Application

Copy and paste this prompt into your Base44 `enterpriseApi` function or create a new dedicated `fincenReporting` function:

---

### CORE INSTRUCTIONS

You are implementing FinCEN Form 8300 (Reportable Transactions) and FinCEN residential real estate reporting for 50deeds.com's Enterprise API. Your implementation must comply with:

1. **FinCEN Reporting Requirements** (31 USC § 5318(g))
   - Track beneficial ownership information for residential real estate transactions
   - Report transactions exceeding reporting thresholds
   - Maintain beneficial owner records for beneficial ownership registry
   - Implement AML/CFT (Anti-Money Laundering / Countering Terrorist Financing) compliance

2. **Residential Real Estate Definition**
   - Any real property located in the United States that is used or intended to be used as a dwelling
   - Single-family homes, condominiums, townhouses, multi-unit residential (up to 4 units)
   - Exclude: commercial properties, vacant land, investment properties, industrial facilities

3. **Data Collection Requirements**
   - **Beneficial Owner Information** (for entities):
     - Full legal name
     - Date of birth
     - Current address
     - Identification document type and number (driver's license, passport, etc.)
   - **Grantor/Transferor Information**:
     - Full legal name
     - Current address
     - For individuals: date of birth, identification document
     - For entities: registered agent, principal place of business
   - **Grantee/Transferee Information** (same as grantor)
   - **Property Information**:
     - Street address
     - County and state
     - Property type (single-family, condo, multi-unit, etc.)
     - Estimated property value

---

## API ENDPOINTS TO IMPLEMENT

### 1. POST /fincen/residential-report
**Description**: Submit a residential real estate transaction for FinCEN reporting

**Request Body**:
```json
{
  "transaction_id": "string (unique)",
  "transaction_date": "ISO 8601 date",
  "transaction_amount": "number (USD)",

  "property": {
    "street_address": "string",
    "city": "string",
    "county": "string",
    "state": "string (2-letter code)",
    "zip_code": "string",
    "property_type": "enum: single-family|condo|townhouse|multi-unit",
    "estimated_value": "number (USD)"
  },

  "grantor": {
    "entity_type": "enum: individual|entity",
    "full_name": "string",
    "date_of_birth": "ISO 8601 date (required if individual)",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string",
    "identification_type": "enum: drivers-license|passport|ssn",
    "identification_number": "string (encrypted)",
    "tax_id": "string (optional, for entities)"
  },

  "grantee": {
    "entity_type": "enum: individual|entity",
    "full_name": "string",
    "date_of_birth": "ISO 8601 date (required if individual)",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string",
    "identification_type": "enum: drivers-license|passport|ssn",
    "identification_number": "string (encrypted)",
    "tax_id": "string (optional, for entities)"
  },

  "beneficial_owners": [
    {
      "full_name": "string",
      "date_of_birth": "ISO 8601 date",
      "address": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string",
      "ownership_percentage": "number (0-100)",
      "identification_type": "enum: drivers-license|passport|ssn",
      "identification_number": "string (encrypted)",
      "is_controlling_owner": "boolean"
    }
  ],

  "transaction_details": {
    "deed_type": "enum: transfer|sale|gift|mortgage|other",
    "consideration_received": "number (USD)",
    "financing_obtained": "boolean",
    "financing_amount": "number (USD, optional if financing_obtained=true)",
    "cash_transaction": "boolean",
    "payment_method": "enum: cash|check|wire|ach|credit-card|other",
    "intermediary_involved": "boolean"
  },

  "aml_checks": {
    "politically_exposed_person": "boolean",
    "sanctions_list_checked": "boolean",
    "aml_risk_assessment": "enum: low|medium|high",
    "reporting_reason": "enum: cash-payment|large-transaction|beneficial-owner-identification|sanctions-concern|other"
  }
}
```

**Response**:
```json
{
  "success": "boolean",
  "report_id": "string",
  "filing_status": "enum: submitted|pending|accepted|rejected",
  "fincen_reference_number": "string (if accepted)",
  "validation_errors": ["array of error messages"],
  "warnings": ["array of warnings"],
  "next_steps": "string"
}
```

**Status Codes**:
- 201: Report created successfully
- 400: Validation error (missing required fields, invalid data)
- 409: Duplicate transaction_id
- 422: AML/sanctions concern - manual review required

---

### 2. GET /fincen/residential-reports
**Description**: List all filed residential FinCEN reports

**Query Parameters**:
- `status`: pending|submitted|accepted|rejected
- `date_from`: ISO 8601 date
- `date_to`: ISO 8601 date
- `state`: filter by state
- `skip`: pagination offset
- `limit`: page size (default 20)

**Response**:
```json
{
  "reports": [
    {
      "report_id": "string",
      "transaction_id": "string",
      "filing_status": "string",
      "transaction_date": "ISO 8601 date",
      "property_address": "string",
      "transaction_amount": "number",
      "submitted_date": "ISO 8601 date",
      "fincen_reference_number": "string (if accepted)"
    }
  ],
  "total": "number",
  "filtered_count": "number"
}
```

---

### 3. GET /fincen/residential-reports/{report_id}
**Description**: Get detailed FinCEN report

**Response**:
```json
{
  "report_id": "string",
  "transaction_id": "string",
  "filing_status": "string",
  "fincen_reference_number": "string",
  "property": { /* property details */ },
  "grantor": { /* grantor details */ },
  "grantee": { /* grantee details */ },
  "beneficial_owners": [ /* array */ ],
  "transaction_details": { /* transaction details */ },
  "aml_checks": { /* AML check results */ },
  "filed_date": "ISO 8601 date",
  "filing_deadline": "ISO 8601 date",
  "compliance_status": "enum: compliant|non-compliant|pending-review"
}
```

---

### 4. POST /fincen/beneficial-owners/verify
**Description**: Verify beneficial owner information against FinCEN requirements

**Request Body**:
```json
{
  "full_name": "string",
  "date_of_birth": "ISO 8601 date",
  "address": "string",
  "identification_type": "string",
  "identification_number": "string"
}
```

**Response**:
```json
{
  "verified": "boolean",
  "pep_status": "boolean",
  "sanctions_match": "boolean",
  "compliance_score": "number (0-100)",
  "verification_details": {
    "name_match_confidence": "number (0-100)",
    "address_verified": "boolean",
    "id_valid": "boolean"
  }
}
```

---

### 5. GET /fincen/filing-deadlines
**Description**: Get FinCEN filing deadline for transactions

**Query Parameters**:
- `transaction_date`: ISO 8601 date

**Response**:
```json
{
  "transaction_date": "ISO 8601 date",
  "filing_deadline": "ISO 8601 date",
  "days_remaining": "number",
  "reporting_required": "boolean",
  "reason": "string"
}
```

---

## VALIDATION RULES

### Required Fields by Transaction Type:
1. **All Transactions**:
   - Property address and details
   - Grantor and grantee information
   - Transaction date and amount

2. **Entity Grantors/Grantees**:
   - Beneficial owner information (minimum 1)
   - Ownership percentage totaling 100%
   - At least one controlling owner

3. **Large Transactions** (>$100,000):
   - Enhanced beneficial owner verification
   - Source of funds documentation
   - AML risk assessment (required)

4. **Cash Transactions**:
   - Payment method must be "cash"
   - Enhanced due diligence required
   - AML reporting threshold check

---

## DATA SECURITY & PRIVACY

1. **PII Encryption**:
   - All identification numbers must be encrypted at rest
   - Use AES-256 encryption
   - Store encryption keys separately from data

2. **Access Control**:
   - Log all access to FinCEN reports
   - Restrict access to authorized personnel only
   - Implement role-based access control (RBAC)

3. **Data Retention**:
   - Maintain records for minimum 5 years
   - Implement secure deletion policies
   - Comply with GDPR/CCPA where applicable

4. **Audit Trail**:
   - Record all modifications to reports
   - Track report status changes
   - Log PEP and sanctions list checks

---

## COMPLIANCE CHECKS

### Automatically Performed:
1. **PEP Screening** (Politically Exposed Person)
   - Check beneficial owners against FinCEN PEP list
   - Flag for manual review if match found
   - Update daily from FinCEN sources

2. **OFAC Sanctions List**
   - Check all parties against OFAC Specially Designated Nationals (SDN) list
   - Block transactions with sanctions matches
   - Log all screening results

3. **AML Risk Assessment**
   - Evaluate transaction size and type
   - Assess counterparty jurisdiction risk
   - Calculate overall AML risk score

4. **Beneficial Ownership Validation**
   - Verify beneficial owner information completeness
   - Ensure ownership percentages total 100%
   - Confirm at least one controlling owner

---

## ERROR HANDLING

**Validation Errors** (400):
- Missing required fields: "Field {field_name} is required"
- Invalid format: "Field {field_name} must be {expected_format}"
- Invalid enum: "Field {field_name} must be one of: {valid_values}"
- Date validation: "Transaction date cannot be in future"

**Compliance Errors** (422):
- "Grantor flagged as politically exposed person - manual review required"
- "OFAC sanctions match detected - transaction blocked"
- "Beneficial ownership incomplete - minimum {n} beneficial owners required for entity"

**System Errors** (500):
- Database connection failures
- External API timeouts (PEP/OFAC services)
- Encryption/decryption failures

---

## INTEGRATION WITH EXISTING ORDERS

Modify the existing `POST /orders` endpoint to:

1. **Detect FinCEN Residential Transactions**:
   - Check if property is residential (state + property type)
   - Check if transaction requires FinCEN reporting (amount threshold)
   - Store beneficial owner info if grantee is an entity

2. **Auto-Submit Reports**:
   - Create FinCEN report automatically for residential transactions
   - Link report_id to order record
   - Return fincen_report_id in order response

3. **Enhanced Order Response**:
```json
{
  "order": {
    "id": "string",
    "fincen_report": {
      "report_id": "string",
      "filing_status": "string",
      "filing_deadline": "ISO 8601 date",
      "fincen_reference_number": "string (if accepted)"
    }
  }
}
```

---

## TESTING CHECKLIST

- [ ] POST /fincen/residential-report with all required fields
- [ ] Validation rejects missing required fields
- [ ] PEP screening flags known PEP names
- [ ] OFAC sanctions check blocks listed entities
- [ ] Beneficial owner verification works correctly
- [ ] Filing deadline calculation accurate
- [ ] Data encryption/decryption works
- [ ] Access control prevents unauthorized viewing
- [ ] Audit logs record all access
- [ ] Integration with /orders endpoint works
- [ ] Database persistence stores all fields correctly

---

## COMPLIANCE REFERENCES

- **FinCEN Form 8300 Instructions**: https://www.fincen.gov/form-8300-frequently-asked-questions
- **Beneficial Ownership Requirements**: 31 USC § 5318(b)(1)
- **Residential Real Estate Reporting**: 31 USC § 5318(g)
- **OFAC SDN List**: https://sanctionssearch.ofac.treas.gov/
- **AML Best Practices**: https://www.fincen.gov/aml-cft-resources

---

## NEXT STEPS

1. Create MongoDB collections:
   - `fincen_reports` - store submitted reports
   - `beneficial_owners` - store beneficial owner records
   - `aml_screenings` - store PEP/OFAC check results
   - `audit_logs` - store all access/modifications

2. Implement external API integrations:
   - PEP database (daily updates)
   - OFAC SDN list (daily updates)
   - Optional: AML risk scoring service

3. Create admin dashboard:
   - View all FinCEN reports
   - Monitor filing deadlines
   - Review flagged transactions
   - Export compliance reports

4. Set up background jobs:
   - Daily PEP/OFAC list updates
   - Filing deadline reminders (60, 30, 7 days before deadline)
   - Auto-submission of complete reports
   - Compliance reporting (daily/monthly/annual)

5. Legal review:
   - Ensure compliance with FinCEN regulations
   - Review data retention policies
   - Verify privacy/security measures
   - Document AML/CFT procedures

---

**Implementation Owner**: 50deeds.com Enterprise API Team
**Last Updated**: 2026-03-05
**Status**: Ready for implementation
