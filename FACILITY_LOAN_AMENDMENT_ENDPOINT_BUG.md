# Facility Loan Amendment Endpoint Bug Report

**Date:** November 13, 2026  
**Status:** 🔴 OPEN  
**Severity:** High  
**Component:** Azure Functions (ACBS) - Facility Loan Amendment Orchestration

---

## Executive Summary

The DTFS facility loan amendment orchestration function incorrectly sends **mixed payload fields** to separate APIM endpoints, causing validation failures at the API level. When a facility amendment includes **both** an amount change **and** a cover end date change, the same mapped object is reused for both amendment activities without filtering endpoint-specific fields.

---

## Problem Statement

### Error in Logs

```
"ACBS Facility loan amount amend error" with:

"dataSent": {
  "expiryDate": "2027-12-01"
}

Validation errors:
  - "effectiveDate must be a valid ISO 8601 date string"
  - "effectiveDate must match /^\d{4}-\d{2}-\d{2}$/"
  - "amountAmendment must be a number conforming to the specified constraints"
  - "amountAmendment should not be empty"
```

### Root Cause Analysis

The error reveals **endpoint confusion**: the API is receiving `expiryDate` on an endpoint that expects `effectiveDate` and `amountAmendment`.

#### APIM Endpoints (Correct Specifications)

| Endpoint | HTTP Method | Purpose | Required Fields |
|----------|-------------|---------|-----------------|
| `/v1/facilities/:facilityIdentifier/loans/:loanIdentifier` | PATCH | Update loan **expiry date** | `expiryDate` |
| `/v1/facilities/:facilityIdentifier/loans/:loanIdentifier/amendments/amount` | POST | Create loan **amount amendment** | `effectiveDate`, `amountAmendment` |

**The consumer is mixing payloads across endpoints.**

---

## Technical Deep Dive

### Data Flow

```
acbs-amend-facility (Orchestrator)
  ↓
acbs-amend-facility-loan-record (Sub-Orchestrator)
  ↓
facilityLoanAmend() mapping
  ↓
TWO parallel activities:
  ├─ update-facility-loan-amount (if amendment.amount exists)
  └─ update-facility-loan (if amendment.coverEndDate exists)
```

### The Bug in `acbs-amend-facility-loan-record.js`

#### Current Code (Buggy)

```javascript
// Line 46: Create single mapped object
const flrMapped = mappings.facility.facilityLoanAmend(amendment, facility, fmr);

// Lines 72-79: Activity 1 - Amount amendment
if (amendment.amount) {
  const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
    loanId,
    facilityIdentifier,
    acbsFacilityLoanInput: flrMapped,  // ⚠️ Contains ALL fields
  });
}

// Lines 84-91: Activity 2 - Expiry date amendment
if (amendment.coverEndDate) {
  const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
    loanId,
    facilityIdentifier,
    acbsFacilityLoanInput: flrMapped,  // ⚠️ Same object with ALL fields
  });
}
```

### What `flrMapped` Contains (Scenario: Both Amendments)

**Input:**
```javascript
amendment = {
  amount: 500000,                    // Non-Loan facility amount change
  coverEndDate: "2027-12-01",        // Expiry date change
  effectiveDate: "2024-01-15",       // When amendments take effect
  facility: {
    facilitySnapshot: {
      type: "Bond",                  // NOT "Loan" type
      feeType: "At Maturity"
    }
  }
}
```

**Output of `facilityLoanAmend()` mapping:**
```javascript
{
  // From amount block (line 25-31 of facility-loan-amend.js)
  effectiveDate: "2024-01-15",
  amountAmendment: <calculated>,
  
  // From coverEndDate block (line 35-45)
  expiryDate: "2027-12-01",
  nextDueDate: "2027-12-01"
}
```

**Problem:** This single object is passed to BOTH activities:
1. ❌ `update-facility-loan-amount` receives `{ effectiveDate, amountAmendment, expiryDate, nextDueDate }`
   - Endpoint validates against `CreateLoanAmountAmendmentRequestItem` DTO
   - Rejects: `expiryDate`, `nextDueDate` (unknown fields, stripped)
   - Missing: `amountAmendment` ← **ERROR**

2. ❌ `update-facility-loan` receives `{ effectiveDate, amountAmendment, expiryDate, nextDueDate }`
   - Endpoint validates against update loan DTO
   - Rejects: `effectiveDate`, `amountAmendment` (unknown fields, stripped)
   - Has: `expiryDate` ✓

---

## The Fix

### Solution: Filter Payloads by Endpoint

Each activity must receive **only** its required fields. Modify lines 72-91 in `acbs-amend-facility-loan-record.js`:

```javascript
if (loanId) {
  facilityLoanRecordAmendments = {
    loanId,
  };

  // 1.3.1 - UKEF Exposure (Amount Amendment)
  if (amendment.amount) {
    // Extract ONLY fields required by amount amendment endpoint
    const amountPayload = {
      effectiveDate: flrMapped.effectiveDate,
      amountAmendment: flrMapped.amountAmendment,
    };

    const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
      loanId,
      facilityIdentifier,
      acbsFacilityLoanInput: amountPayload,  // ✓ Only amount fields
    });

    facilityLoanRecordAmendments = {
      ...facilityLoanRecordAmendments,
      amount,
    };
  }

  // 1.3.2 - Cover end date (Expiry Amendment)
  if (amendment.coverEndDate) {
    // Extract ONLY fields required by expiry date endpoint
    const expiryPayload = {
      expiryDate: flrMapped.expiryDate,
      ...(flrMapped.nextDueDate && { nextDueDate: flrMapped.nextDueDate }),
    };

    const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
      loanId,
      facilityIdentifier,
      acbsFacilityLoanInput: expiryPayload,  // ✓ Only expiry fields
    });

    facilityLoanRecordAmendments = {
      ...facilityLoanRecordAmendments,
      coverEndDate,
    };
  }
}
```

### Before/After Comparison

| Scenario | Before | After |
|----------|--------|-------|
| **Amount only** | ✓ Works (no expiryDate in flrMapped) | ✓ Works |
| **Expiry only** | ⚠️ Mixed fields sent | ✓ Works (only expiryDate sent) |
| **Both amendments** | ❌ FAILS - mixed fields for both activities | ✓ Works (each activity gets correct fields) |

---

## Implementation Steps

### Step 1: Update Sub-Orchestrator

**File:** `/var/www/html/dtfs2/azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js`

Replace lines 68-91 with the filtered payload implementation shown in "The Fix" section above.

### Step 2: Verify Mandatory Field Validation

Confirm that the activity functions properly validate their specific fields:

**`activity-update-facility-loan-amount.js`:**
```javascript
const mandatoryFields = ['effectiveDate', 'amountAmendment'];
```

**`activity-update-facility-loan.js`:**
```javascript
const mandatoryFields = ['expiryDate'];
```

Both are correctly configured. ✓

### Step 3: Test Scenarios

Create integration tests for:

```javascript
// Scenario 1: Amount only (non-Loan facility)
{
  amendment: {
    facilityIdentifier: "0030000000/000/001",
    amount: 500000,
    effectiveDate: "2024-01-15",
    facility: { facilitySnapshot: { type: "Bond" } }
  }
}
// Expected: POST to /amendments/amount endpoint only

// Scenario 2: Expiry only
{
  amendment: {
    facilityIdentifier: "0030000000/000/001",
    coverEndDate: "2027-12-01",
    effectiveDate: "2024-01-15",
    facility: { facilitySnapshot: { type: "Loan", feeType: "At Maturity" } }
  }
}
// Expected: PATCH to /loans/{loanId} endpoint only

// Scenario 3: Both (non-Loan facility)
{
  amendment: {
    facilityIdentifier: "0030000000/000/001",
    amount: 500000,
    coverEndDate: "2027-12-01",
    effectiveDate: "2024-01-15",
    facility: { facilitySnapshot: { type: "Bond", feeType: "At Maturity" } }
  }
}
// Expected: TWO calls with filtered payloads
//   1. POST to /amendments/amount with { effectiveDate, amountAmendment }
//   2. PATCH to /loans/{loanId} with { expiryDate, nextDueDate }
```

---

## Expected Outcomes After Fix

### Correct APIM Payloads

**Call 1 - Amount Amendment:**
```
POST /v1/facilities/0030000000/000/001/loans/{loanId}/amendments/amount
Content-Type: application/json

[{
  "effectiveDate": "2024-01-15",
  "amountAmendment": 50000
}]
```

**Call 2 - Expiry Amendment:**
```
PATCH /v1/facilities/0030000000/000/001/loans/{loanId}
Content-Type: application/json

{
  "expiryDate": "2027-12-01",
  "nextDueDate": "2027-12-01"
}
```

### Success Response

```javascript
{
  facilityIdentifier: "0030000000/000/001",
  facilityLoanRecord: {
    loanId: "...",
    amount: {
      status: 200,
      submittedToACBS: "2024-01-15T10:30:45.123Z",
      receivedFromACBS: "2024-01-15T10:30:46.456Z",
      dataSent: { effectiveDate, amountAmendment }
    },
    coverEndDate: {
      status: 200,
      submittedToACBS: "2024-01-15T10:30:47.789Z",
      receivedFromACBS: "2024-01-15T10:30:48.456Z",
      dataSent: { expiryDate, nextDueDate }
    }
  }
}
```

---

## Related Code References

### Files Involved

| File | Purpose | Role |
|------|---------|------|
| `azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js` | Sub-Orchestrator | 🔴 **BUGGY** - Mixed payloads |
| `azure-functions/acbs/src/functions/activity-update-facility-loan-amount.js` | Amount Activity | ✓ Correct validation |
| `azure-functions/acbs/src/functions/activity-update-facility-loan.js` | Expiry Activity | ✓ Correct validation |
| `azure-functions/acbs/mappings/facility/facility-loan-amend.js` | Payload Mapping | ✓ Correct mapping logic |
| `azure-functions/acbs/api.js` | API Wrapper | ✓ Correct endpoints |

---

## API Validation Details

### CreateLoanAmountAmendmentRequestItem DTO (APIM)

Required fields:
- `effectiveDate` (DateOnlyString) - Regex: `^\d{4}-\d{2}-\d{2}$`
- `amountAmendment` (number) - Non-zero, non-null

Rejects: `expiryDate`, `nextDueDate`

### UpdateLoanRequestItem DTO (APIM)

Required field:
- `expiryDate` (DateOnlyString)

Optional:
- `nextDueDate` (DateOnlyString)

Rejects: `effectiveDate`, `amountAmendment`

---

## Timeline

- **Discovered:** 2026-11-13
- **Root Cause Analysis:** Payload field mixing in sub-orchestrator
- **Fix Complexity:** Low (isolated to lines 68-91 of sub-orchestrator)
- **Testing Impact:** Medium (requires scenario-based integration tests)
- **Deployment Risk:** Low (fix is backward compatible)

---

## Checklist

- [ ] Implement payload filtering in sub-orchestrator
- [ ] Update unit tests for `acbs-amend-facility-loan-record.js`
- [ ] Add integration tests for all three scenarios
- [ ] Run API test suite against fixed code
- [ ] Test with cover end date only amendments (Scenario 2)
- [ ] Test with both amendments (Scenario 3)
- [ ] Update APIM test data if applicable
- [ ] Document change in CHANGELOG
- [ ] Deploy to dev environment
- [ ] Verify logs show correct endpoint calls
- [ ] Monitor production for recurring errors

---

## Questions for Review

1. Are there other orchestrators/activities that might have similar payload-mixing issues?
2. Should we add validation at the sub-orchestrator level to prevent mixed payloads?
3. Are there existing tests that cover both-amendment scenarios that should now pass?

---

## References

- [ACBS Facility Loan Amendment Architecture](./doc/acbs-amendments.md)
- [APIM Endpoint Specifications](./doc/apim-endpoints.md)
- Azure Durable Functions: Activity & Orchestrator pattern
- Payload validation: DTO-based whitelist filtering

