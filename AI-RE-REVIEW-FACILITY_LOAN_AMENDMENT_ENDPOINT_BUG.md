# Facility Loan Amendment: Wrong Endpoint Called for Loan Facilities with Combined Amendments (AI Re-Review)

**Status:** 🔴 Open
**Severity:** High
**Component:** `azure-functions/acbs` — Facility Loan Record amendment sub-orchestrator

---

## Symptom

APIM rejects an amendment request with the error name `"ACBS Facility loan amount amend error"` (i.e. it was sent to the **amount amendment** endpoint), but the logged `dataSent` only contains an `expiryDate` field:

```json
{
  "name": "ACBS Facility loan amount amend error",
  "dataSent": {
    "expiryDate": "2027-12-01"
  }
}
```

With APIM validation errors:

```
effectiveDate must be a valid ISO 8601 date string
effectiveDate must match /^\d{4}-\d{2}-\d{2}$/ regular expression
amountAmendment must be a number conforming to the specified constraints
amountAmendment should not be empty
```

This is confusing because `acbs-amend-facility-loan-record.js` — the code responsible for routing — **has not changed since it was last refactored in February 2023** (commit `81408f149`, *"feat(DTFS2-6283): FLR amendment for Bond only"*). This is not a regression from a recent code change; it is a **dormant logic gap** that only misfires for one specific, legitimate combination of input data.

---

## Root Cause

### 0. Confirmed origin: the commit that introduced the gap

The gating logic gap was introduced by a deliberate refactor, not accidental damage — and it has remained unchanged on `main` ever since. Verified directly against git history:

```
$ git show --format="Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nMessage: %s%n" --date=iso -s 81408f149ffb25562c3448b94cea9795be082853

Commit: 81408f149ffb25562c3448b94cea9795be082853
Author: Abhi Markan <abhi.markan@ukexportfinance.gov.uk>
Date:   2023-02-03 13:52:14 +0000
Message: feat(DTFS2-6283): FLR amendment for Bond only
```

Merged to `main` the same day via PR [#1297](https://github.com/UK-Export-Finance/dtfs2/pull/1297) (commit `ad185389b`, *"feat(DTFS2-6283): Bond - Facility loan record amendment (#1297)"*). Confirmed still an ancestor of the current `main` HEAD:

```
$ git merge-base --is-ancestor 81408f149ffb25562c3448b94cea9795be082853 HEAD && echo "YES"
YES
```

The relevant part of the diff (originally at `azure-functions/acbs-function/acbs-amend-facility-loan-record/index.js`, the pre-rename path of today's `acbs-amend-facility-loan-record.js`):

```diff
-      // 1.3.1 - UKEF Exposure (Only `Bond`)
-      if (amendment.amount && facilitySnapshot.type === FACILITY.FACILITY_TYPE.BOND) {
+      // 1.3.1 - UKEF Exposure
+      if (amendment.amount) {
         const amount = yield context.df.callActivityWithRetry('activity-update-facility-loan-amount', retryOptions, {
```

**Before this commit**, the orchestrator itself explicitly checked `facilitySnapshot.type === FACILITY.FACILITY_TYPE.BOND` before calling the amount-amendment activity — the Bond/Loan distinction was enforced at the call site. **This commit removed that check** and relocated the Bond/Loan distinction into the mapping function (`facilityLoanAmend()`) instead, under the assumption that an empty/partial mapping result would be an adequate substitute signal. That assumption holds for the "amount only" case (handled by the separate empty-object early-return guard) but not for the "amount + coverEndDate together on a Loan facility" case described below — which is exactly the gap this report addresses.

Since this commit, `azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js` (and its pre-rename equivalent) has had no further logic changes to the amount/cover-end-date gating — confirmed via `git log --follow` on the file, which shows no commits between this one and the 2025-10-02 directory rename (`feat(DTFS2-7457)`) that touch this logic.

### 1. Two separate APIM endpoints, two different payload shapes

| Endpoint | Method | Required fields |
|---|---|---|
| `/v1/facilities/:facilityIdentifier/loans/:loanId/amendments/amount` | POST | `effectiveDate`, `amountAmendment` |
| `/v1/facilities/:facilityIdentifier/loans/:loanId` | PATCH | `expiryDate` (`nextDueDate` optional) |

### 2. Where a combined payload originates

[`external-api/server/v1/controllers/acbs.controller.ts`](/var/www/html/dtfs2/external-api/server/v1/controllers/acbs.controller.ts:246) builds the payload sent to the Azure Function orchestrator:

```typescript
const payload = {
  facilityIdentifier: id,
  amount: amendments.ukefExposure,
  coverEndDate: amendments.coverEndDate,
  effectiveDate: amendments.effectiveDate,
  facility,
  deal,
};

const { changeFacilityValue, changeCoverEndDate } = amendments;

if (!changeFacilityValue || valueDeclined) delete payload.amount;
if (!changeCoverEndDate || coverEndDateDeclined) delete payload.coverEndDate;
```

Whenever a single TFM amendment changes **both** the facility value **and** the cover end date (a normal, supported business scenario), the orchestrator receives a payload with **both `amount` and `coverEndDate` populated**.

### 3. How the mapping encodes the Bond/Loan distinction

[`facility-loan-amend.js`](/var/www/html/dtfs2/azure-functions/acbs/mappings/facility/facility-loan-amend.js) only adds amount-related fields when the facility is **not** a `Loan` (Loan-type value amendments are handled via the Facility Master Record elsewhere, not the Facility Loan Record):

```javascript
if (amount) {
  if (type !== FACILITY.FACILITY_TYPE.LOAN) {
    record = {
      ...record,
      effectiveDate: formatDate(effectiveDate),
      amountAmendment: helpers.getLoanAmountDifference(amount, type, facilityMasterRecord),
    };
  }
}

if (coverEndDate) {
  record = { ...record, expiryDate: formatDate(coverEndDate) };
  if (feeType === CONSTANTS.FACILITY.FEE_TYPE.AT_MATURITY) {
    record = { ...record, nextDueDate: formatDate(coverEndDate) };
  }
}
```

### 4. Where the gating logic and the mapping disagree

[`acbs-amend-facility-loan-record.js`](/var/www/html/dtfs2/azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js) decides **whether to call each activity** based on the *raw* `amendment` input, not on what the mapping actually produced:

```javascript
// 1.3.1 - UKEF Exposure
if (amendment.amount) {                                              // ← raw input, not flrMapped
  const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
    loanId,
    facilityIdentifier,
    acbsFacilityLoanInput: flrMapped,                                 // ← whatever flrMapped happens to contain
  });
  ...
}

// 1.3.2 - Cover end date
if (amendment.coverEndDate) {
  const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
    loanId,
    facilityIdentifier,
    acbsFacilityLoanInput: flrMapped,
  });
  ...
}
```

### 5. The failure sequence for a `Loan`-type facility with both `amount` and `coverEndDate`

| Step | Result |
|---|---|
| `facilityLoanAmend()` mapping | `amount` branch adds nothing (`type === 'Loan'`); `coverEndDate` branch adds `expiryDate` → **`flrMapped = { expiryDate: "2027-12-01" }`** |
| Guard: `if (!Object.values(flrMapped).length)` | **False** — `flrMapped` is not empty, so execution is *not* aborted |
| `if (amendment.amount)` | **True** — the raw amendment still has `amount` set | 
| → `update-facility-loan-amount` activity called with `acbsFacilityLoanInput: flrMapped` | Sends `{ expiryDate: "2027-12-01" }` to the **amount** endpoint ❌ — missing `effectiveDate`/`amountAmendment` → APIM validation error |
| `if (amendment.coverEndDate)` | **True** |
| → `update-facility-loan` activity called with the same `flrMapped` | Sends `{ expiryDate: "2027-12-01" }` to the **expiry** endpoint ✓ (correct, but only by coincidence) |

This produces exactly the observed error: error name from the amount activity, but `dataSent` containing only `expiryDate`.

### 6. Why this has never been caught

```
$ find azure-functions/acbs -iname "*facility-loan-record*test*" -o -iname "*facility-loan-amend*test*"
(no results)
```

There is **no unit test coverage** for either `acbs-amend-facility-loan-record.js` or `facility-loan-amend.js`, unlike the sibling mappings `facility-covenant-amend.test.js` and `facility-guarantee-amend.test.js`, which do have tests. The specific scenario — a `Loan`-type facility amendment that changes both value and cover end date in the same request — was never exercised.

---

## Why Field-Filtering Alone Is Not a Correct Fix

A naive fix would just restrict which keys of `flrMapped` get passed to each activity (e.g. only pass `{ effectiveDate, amountAmendment }` to the amount activity). **This does not fix the bug** — for a `Loan` facility, `flrMapped.amountAmendment` is `undefined` whether or not you filter the keys, so the amount endpoint would still be called, just with an **empty/incomplete** payload instead of a **wrong** one. It would still fail APIM's mandatory-field validation. The real defect is the **gating condition**, not just the payload shape.

---

## The Proper Fix

Gate each activity call on whether the **mapping actually produced the fields that activity needs**, rather than on the raw amendment input. The mapping function is already the single source of truth for "does this facility type need a Facility Loan Record amount amendment" — the orchestrator should trust it instead of duplicating/second-guessing that decision via `amendment.amount`.

### Change

In [`acbs-amend-facility-loan-record.js`](/var/www/html/dtfs2/azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js):

```diff
       // 1.3.1 - UKEF Exposure
-      if (amendment.amount) {
+      if (flrMapped.amountAmendment !== undefined) {
+        const amountPayload = {
+          effectiveDate: flrMapped.effectiveDate,
+          amountAmendment: flrMapped.amountAmendment,
+        };
+
         const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
           loanId,
           facilityIdentifier,
-          acbsFacilityLoanInput: flrMapped,
+          acbsFacilityLoanInput: amountPayload,
         });
 
         facilityLoanRecordAmendments = {
           ...facilityLoanRecordAmendments,
           amount,
         };
       }
 
       // 1.3.2 - Cover end date
-      if (amendment.coverEndDate) {
+      if (flrMapped.expiryDate !== undefined) {
+        const expiryPayload = {
+          expiryDate: flrMapped.expiryDate,
+          ...(flrMapped.nextDueDate && { nextDueDate: flrMapped.nextDueDate }),
+        };
+
         const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
           loanId,
           facilityIdentifier,
-          acbsFacilityLoanInput: flrMapped,
+          acbsFacilityLoanInput: expiryPayload,
         });
 
         facilityLoanRecordAmendments = {
           ...facilityLoanRecordAmendments,
           coverEndDate,
         };
       }
```

### Full corrected function body (lines 60–98 of the current file)

```javascript
    // 1.1. Facility Loan Record (FLR) amendment mapping
    const flrMapped = mappings.facility.facilityLoanAmend(amendment, facility, fmr);

    /**
     * Facility amendment on facility type `loan` with only `amount`
     * facility attribute, the execution should be terminated.
     *
     * However if the facility (Loan) amendment consist of an additional
     * attribute with `amount` then FLR should be mapped as normal.
     */
    if (!Object.values(flrMapped).length) {
      facilityLoanRecordAmendments = 'Facility loan amount only amendment, aborting FLR amendment';

      return facilityLoanRecordAmendments;
    }

    // 1.2. Extract loan id for facility id
    const loanId = yield context.df.callActivityWithRetry('get-facility-loan-id', retryOptions, {
      facilityIdentifier,
    });

    if (loanId) {
      facilityLoanRecordAmendments = {
        loanId,
      };

      /**
       * 1.3.1 - UKEF Exposure
       * Gated on the MAPPED output (not the raw `amendment.amount`), because
       * `facilityLoanAmend()` intentionally omits amount fields for `Loan`
       * type facilities (their value amendments go via the Facility Master
       * Record, not the Facility Loan Record). Using the raw input here would
       * call this endpoint with an incomplete payload whenever a `Loan`
       * facility's amendment also includes a `coverEndDate` change.
       */
      if (flrMapped.amountAmendment !== undefined) {
        const amountPayload = {
          effectiveDate: flrMapped.effectiveDate,
          amountAmendment: flrMapped.amountAmendment,
        };

        const amount = yield context.df.callActivityWithRetry('update-facility-loan-amount', retryOptions, {
          loanId,
          facilityIdentifier,
          acbsFacilityLoanInput: amountPayload,
        });

        facilityLoanRecordAmendments = {
          ...facilityLoanRecordAmendments,
          amount,
        };
      }

      // 1.3.2 - Cover end date
      if (flrMapped.expiryDate !== undefined) {
        const expiryPayload = {
          expiryDate: flrMapped.expiryDate,
          ...(flrMapped.nextDueDate && { nextDueDate: flrMapped.nextDueDate }),
        };

        const coverEndDate = yield context.df.callActivityWithRetry('update-facility-loan', retryOptions, {
          loanId,
          facilityIdentifier,
          acbsFacilityLoanInput: expiryPayload,
        });

        facilityLoanRecordAmendments = {
          ...facilityLoanRecordAmendments,
          coverEndDate,
        };
      }
    }
```

This fix does two things together, both necessary:

1. **Correct gating** — `flrMapped.amountAmendment !== undefined` / `flrMapped.expiryDate !== undefined` reflect what the mapping actually decided for this facility type, closing the Loan-type gap.
2. **Payload filtering** — each activity still only receives the fields it needs, as defence-in-depth against future fields being added to `flrMapped` for unrelated reasons.

---

## Behaviour Before/After, by Scenario

| Scenario (facility type / amendment fields) | Before fix | After fix |
|---|---|---|
| Bond, `amount` only | ✓ Amount endpoint called correctly | ✓ Unchanged |
| Bond, `coverEndDate` only | ✓ Expiry endpoint called correctly | ✓ Unchanged |
| Bond, `amount` **and** `coverEndDate` | ✓ Works (fields happen to all be present in `flrMapped`, both calls correct) | ✓ Unchanged |
| Loan, `amount` only | ✓ `flrMapped` is `{}` → early-return guard aborts both calls | ✓ Unchanged |
| Loan, `coverEndDate` only | ✓ Works (`amendment.amount` falsy, so amount endpoint never called) | ✓ Unchanged |
| **Loan, `amount` *and* `coverEndDate`** | ❌ Amount endpoint called with `{ expiryDate }` only → APIM validation error | ✅ Amount endpoint **not called**; expiry endpoint called with `{ expiryDate, nextDueDate? }` |

---

## Recommended Test Coverage

No tests currently exist for either file. At minimum, add:

**`azure-functions/acbs/mappings/facility/facility-loan-amend.test.js`**
- Bond + amount only → `{ effectiveDate, amountAmendment }`
- Bond + coverEndDate only → `{ expiryDate }` (+ `nextDueDate` if `At maturity`)
- Bond + both → all four fields present
- Loan + amount only → `{}`
- Loan + coverEndDate only → `{ expiryDate }`
- **Loan + both → `{ expiryDate }` only, no `effectiveDate`/`amountAmendment`** (the regression case)

**`azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.test.js`**
- Loan + both amount and coverEndDate → assert `update-facility-loan-amount` activity is **not** called, and `update-facility-loan` is called with `{ expiryDate, ... }` only
- Bond + both → assert both activities are called, each with the correctly filtered payload

---

## Implementation Checklist

- [ ] Apply the diff to `acbs-amend-facility-loan-record.js`
- [ ] Add `facility-loan-amend.test.js` covering all six scenarios above
- [ ] Add `acbs-amend-facility-loan-record.test.js` covering the orchestrator routing
- [ ] Run `npm run lint` and the existing `azure-functions/acbs` test suite
- [ ] Verify in logs: for a Loan facility amendment with both `amount` and `coverEndDate`, only **one** APIM call is made (PATCH to the expiry endpoint)
- [ ] Update `CHANGELOG.md`

---

## Related Files

| File | Role |
|---|---|
| [`azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js`](/var/www/html/dtfs2/azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js) | 🔴 Fix location |
| [`azure-functions/acbs/mappings/facility/facility-loan-amend.js`](/var/www/html/dtfs2/azure-functions/acbs/mappings/facility/facility-loan-amend.js) | Source of truth for which fields apply per facility type — unchanged |
| [`azure-functions/acbs/src/functions/activity-update-facility-loan-amount.js`](/var/www/html/dtfs2/azure-functions/acbs/src/functions/activity-update-facility-loan-amount.js) | Amount activity — unchanged, validation already correct |
| [`azure-functions/acbs/src/functions/activity-update-facility-loan.js`](/var/www/html/dtfs2/azure-functions/acbs/src/functions/activity-update-facility-loan.js) | Expiry activity — unchanged, validation already correct |
| [`external-api/server/v1/controllers/acbs.controller.ts`](/var/www/html/dtfs2/external-api/server/v1/controllers/acbs.controller.ts) | Origin of the combined `amount` + `coverEndDate` payload — unchanged, behaviour is legitimate |
