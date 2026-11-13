# Facility Loan Amendment Fix - Implementation Guide

## Quick Reference

**Bug Location:** `azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js`  
**Lines:** 68-91  
**Severity:** High  
**Fix Type:** Logic correction (payload filtering)

---

## The Problem (Visual)

### Current (Broken) Flow

```
facilityLoanAmend(amendment, facility, fmr)
    ↓
flrMapped = { effectiveDate, amountAmendment, expiryDate, nextDueDate }
    ├─→ update-facility-loan-amount ← ❌ Gets expiryDate (unexpected)
    └─→ update-facility-loan ← ❌ Gets amountAmendment (unexpected)
```

### After Fix (Correct) Flow

```
facilityLoanAmend(amendment, facility, fmr)
    ↓
flrMapped = { effectiveDate, amountAmendment, expiryDate, nextDueDate }
    ├─→ amountPayload = { effectiveDate, amountAmendment }
    │   └─→ update-facility-loan-amount ← ✓ Gets expected fields
    └─→ expiryPayload = { expiryDate, nextDueDate }
        └─→ update-facility-loan ← ✓ Gets expected fields
```

---

## Code Changes

### Current Code (Lines 68-91)

```javascript
if (loanId) {
  facilityLoanRecordAmendments = {
    loanId,
  };

  // 1.3.1 - UKEF Exposure
  if (amendment.amount) {
    const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
      loanId,
      facilityIdentifier,
      acbsFacilityLoanInput: flrMapped,  // ⚠️ PROBLEM: passes ALL fields
    });

    facilityLoanRecordAmendments = {
      ...facilityLoanRecordAmendments,
      amount,
    };
  }

  // 1.3.2 - Cover end date
  if (amendment.coverEndDate) {
    const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
      loanId,
      facilityIdentifier,
      acbsFacilityLoanInput: flrMapped,  // ⚠️ PROBLEM: passes ALL fields
    });

    facilityLoanRecordAmendments = {
      ...facilityLoanRecordAmendments,
      coverEndDate,
    };
  }
}
```

### Fixed Code (Lines 68-103)

```javascript
if (loanId) {
  facilityLoanRecordAmendments = {
    loanId,
  };

  // 1.3.1 - UKEF Exposure
  if (amendment.amount) {
    // Extract ONLY fields required by amount amendment endpoint
    const amountPayload = {
      effectiveDate: flrMapped.effectiveDate,
      amountAmendment: flrMapped.amountAmendment,
    };

    const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
      loanId,
      facilityIdentifier,
      acbsFacilityLoanInput: amountPayload,  // ✓ FIX: passes only amount fields
    });

    facilityLoanRecordAmendments = {
      ...facilityLoanRecordAmendments,
      amount,
    };
  }

  // 1.3.2 - Cover end date
  if (amendment.coverEndDate) {
    // Extract ONLY fields required by expiry date endpoint
    const expiryPayload = {
      expiryDate: flrMapped.expiryDate,
      ...(flrMapped.nextDueDate && { nextDueDate: flrMapped.nextDueDate }),
    };

    const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
      loanId,
      facilityIdentifier,
      acbsFacilityLoanInput: expiryPayload,  // ✓ FIX: passes only expiry fields
    });

    facilityLoanRecordAmendments = {
      ...facilityLoanRecordAmendments,
      coverEndDate,
    };
  }
}
```

---

## Diff View

```diff
  if (loanId) {
    facilityLoanRecordAmendments = {
      loanId,
    };

    // 1.3.1 - UKEF Exposure
    if (amendment.amount) {
+     // Extract ONLY fields required by amount amendment endpoint
+     const amountPayload = {
+       effectiveDate: flrMapped.effectiveDate,
+       amountAmendment: flrMapped.amountAmendment,
+     };
+
      const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
        loanId,
        facilityIdentifier,
-       acbsFacilityLoanInput: flrMapped,
+       acbsFacilityLoanInput: amountPayload,
      });

      facilityLoanRecordAmendments = {
        ...facilityLoanRecordAmendments,
        amount,
      };
    }

    // 1.3.2 - Cover end date
    if (amendment.coverEndDate) {
+     // Extract ONLY fields required by expiry date endpoint
+     const expiryPayload = {
+       expiryDate: flrMapped.expiryDate,
+       ...(flrMapped.nextDueDate && { nextDueDate: flrMapped.nextDueDate }),
+     };
+
      const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
        loanId,
        facilityIdentifier,
-       acbsFacilityLoanInput: flrMapped,
+       acbsFacilityLoanInput: expiryPayload,
      });

      facilityLoanRecordAmendments = {
        ...facilityLoanRecordAmendments,
        coverEndDate,
      };
    }
  }
```

---

## Field Specifications by Endpoint

### Amount Amendment Endpoint

**Path:** `POST /v1/facilities/{facilityIdentifier}/loans/{loanId}/amendments/amount`

**Expected Payload:**
```javascript
[{
  "effectiveDate": "2024-01-15",     // REQUIRED - ISO 8601 date
  "amountAmendment": 50000           // REQUIRED - Number, non-zero
}]
```

**Validation Rules:**
- `effectiveDate` must be valid ISO 8601 date format (`YYYY-MM-DD`)
- `amountAmendment` must be a number
- `amountAmendment` cannot be zero or empty
- Unknown fields are stripped (whitelist validation)

**Error if You Send `expiryDate`:**
```
{
  "name": "ACBS Facility loan amount amend error",
  "dataSent": { "expiryDate": "2027-12-01" },
  "errors": [
    "effectiveDate must be a valid ISO 8601 date string",
    "amountAmendment must be a number conforming to the specified constraints"
  ]
}
```

### Expiry Date Amendment Endpoint

**Path:** `PATCH /v1/facilities/{facilityIdentifier}/loans/{loanId}`

**Expected Payload:**
```javascript
{
  "expiryDate": "2027-12-01",        // REQUIRED - ISO 8601 date
  "nextDueDate": "2027-12-01"        // OPTIONAL - ISO 8601 date
}
```

**Validation Rules:**
- `expiryDate` must be provided
- `expiryDate` must be valid ISO 8601 date format
- `nextDueDate` is optional (included only if fee type is "At Maturity")
- Unknown fields are stripped

**Does NOT Accept:**
- `effectiveDate` ❌
- `amountAmendment` ❌

---

## Test Coverage

### Test Scenario 1: Amount Only (Non-Loan Facility)

**Input Amendment:**
```javascript
{
  facilityIdentifier: "0030000000/000/001",
  amount: 500000,
  effectiveDate: "2024-01-15",
  facility: {
    facilitySnapshot: {
      type: "Bond",
      feeType: "At Maturity"
    }
  }
}
```

**Expected Payload to Amount Endpoint:**
```javascript
{
  effectiveDate: "2024-01-15",
  amountAmendment: 50000  // (calculated difference)
}
```

**Expected Payload to Expiry Endpoint:**
- NOT CALLED ✓

---

### Test Scenario 2: Expiry Only

**Input Amendment:**
```javascript
{
  facilityIdentifier: "0030000000/000/001",
  coverEndDate: "2027-12-01",
  effectiveDate: "2024-01-15",
  facility: {
    facilitySnapshot: {
      type: "Loan",
      feeType: "At Maturity"
    }
  }
}
```

**Expected Payload to Amount Endpoint:**
- NOT CALLED ✓

**Expected Payload to Expiry Endpoint:**
```javascript
{
  expiryDate: "2027-12-01",
  nextDueDate: "2027-12-01"
}
```

---

### Test Scenario 3: Both (Non-Loan Facility)

**Input Amendment:**
```javascript
{
  facilityIdentifier: "0030000000/000/001",
  amount: 500000,
  coverEndDate: "2027-12-01",
  effectiveDate: "2024-01-15",
  facility: {
    facilitySnapshot: {
      type: "Bond",
      feeType: "At Maturity"
    }
  }
}
```

**Mapping Output:**
```javascript
flrMapped = {
  effectiveDate: "2024-01-15",
  amountAmendment: 50000,
  expiryDate: "2027-12-01",
  nextDueDate: "2027-12-01"
}
```

**Expected Payload to Amount Endpoint:**
```javascript
{
  effectiveDate: "2024-01-15",
  amountAmendment: 50000
}
// expiryDate and nextDueDate are filtered out ✓
```

**Expected Payload to Expiry Endpoint:**
```javascript
{
  expiryDate: "2027-12-01",
  nextDueDate: "2027-12-01"
}
// effectiveDate and amountAmendment are filtered out ✓
```

---

## Implementation Checklist

- [ ] **Backup current file:**
  ```bash
  cp azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js \
     azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js.bak
  ```

- [ ] **Apply fix to lines 68-103**

- [ ] **Verify syntax:**
  ```bash
  node -c azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js
  ```

- [ ] **Run ESLint:**
  ```bash
  npm run lint azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js
  ```

- [ ] **Run unit tests:**
  ```bash
  npm test --workspace azure-functions/acbs -- acbs-amend-facility-loan-record
  ```

- [ ] **Run API tests:**
  ```bash
  npm run test:api --workspace azure-functions/acbs
  ```

- [ ] **Test locally with docker-compose:**
  ```bash
  docker-compose up
  # Send amendment with both amount and coverEndDate
  # Verify two separate APIM calls are made
  ```

- [ ] **Verify logs:**
  ```bash
  # Should see TWO successful requests to different endpoints
  # Amount endpoint: POST .../amendments/amount
  # Expiry endpoint: PATCH .../loans/{loanId}
  ```

- [ ] **Update CHANGELOG:**
  ```markdown
  ### Fixed
  - Fixed facility loan amendment endpoint routing: properly filter payload 
    fields to correct endpoints when both amount and expiry date amendments 
    are combined
  ```

- [ ] **Commit with message:**
  ```bash
  git add azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js
  git commit -m "fix: filter facility loan amendment payloads by endpoint

  When an amendment includes both amount and expiry date changes, the same
  mapped object was being passed to both activity functions. This caused
  validation errors because each endpoint expects different fields.

  This fix extracts endpoint-specific fields before calling each activity:
  - amountPayload contains only: effectiveDate, amountAmendment
  - expiryPayload contains only: expiryDate, nextDueDate

  Fixes: ACBS Facility loan amount amend error when both amendments present
  Refs: FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md"
  ```

---

## Verification Steps

### Step 1: Check Logs After Deployment

Look for **TWO separate** APIM calls in logs:

```
[INFO] Calling TFS POST /v1/facilities/0030000000/000/001/loans/ABC/amendments/amount
[INFO] Response Status: 200
[INFO] Calling TFS PATCH /v1/facilities/0030000000/000/001/loans/ABC
[INFO] Response Status: 200
```

### Step 2: Verify Payload Structure

Search logs for `dataSent` objects:

**Amount Endpoint Should Show:**
```json
{
  "dataSent": {
    "effectiveDate": "2024-01-15",
    "amountAmendment": 50000
  }
}
```

**Expiry Endpoint Should Show:**
```json
{
  "dataSent": {
    "expiryDate": "2027-12-01",
    "nextDueDate": "2027-12-01"
  }
}
```

### Step 3: No More Mixed Field Errors

Before fix, saw:
```
"effectiveDate must be a valid ISO 8601 date string"
"amountAmendment must be a number conforming to the specified constraints"
```

After fix, these should NOT appear when only expiry is being amended.

---

## Rollback Plan

If issues arise:

```bash
# Restore backup
cp azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js.bak \
   azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js

# Redeploy
npm run deploy --workspace azure-functions/acbs
```

---

## Related Issues

- This fix applies only to facility loan amendments
- Similar payload-mixing issues should be checked in:
  - `acbs-amend-facility-master-record.js` (Facility Master)
  - `acbs-amend-facility-covenant-record.js` (Covenants)
  - `acbs-amend-facility-guarantee-record.js` (Guarantees)

---

## Questions?

Refer to:
1. [FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md](./FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md) - Full bug analysis
2. [APIM Endpoint Specifications](./doc/apim-endpoints.md) - API contract details
3. Azure Durable Functions documentation - Activity orchestration patterns
