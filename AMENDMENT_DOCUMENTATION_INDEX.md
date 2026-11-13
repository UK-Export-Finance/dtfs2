# Facility Loan Amendment Documentation Index

This directory contains comprehensive documentation about the facility loan amendment endpoint bug and its fix.

## 📋 Documents

### 1. **FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md** (394 lines)
**What:** Complete bug analysis and root cause investigation

**Contains:**
- Executive summary
- Problem statement with error logs
- Deep technical analysis of the bug
- Root cause: mixed payload fields sent to wrong endpoints
- Expected outcomes after fix
- Implementation checklist
- Related code references

**Read this if you want to:**
- Understand what went wrong
- See the error traces
- Learn the technical details
- Understand the impact

---

### 2. **FACILITY_LOAN_AMENDMENT_FIX.md** (500 lines)
**What:** Step-by-step implementation guide with code changes

**Contains:**
- Quick reference summary
- Before/after code comparison
- Exact code changes (diff format)
- Field specifications for each endpoint
- Complete test scenarios with inputs/outputs
- Implementation checklist
- Verification steps
- Rollback plan

**Read this if you want to:**
- Implement the fix
- Understand what code to change
- Test the fix
- Verify it works

---

## 🐛 The Bug at a Glance

| Aspect | Value |
|--------|-------|
| **Location** | `azure-functions/acbs/src/functions/acbs-amend-facility-loan-record.js` |
| **Lines** | 68-91 (current), 68-103 (fixed) |
| **Issue** | Mixed payload fields sent to wrong APIM endpoints |
| **When** | When amendment includes BOTH amount AND expiry date changes |
| **Impact** | Validation failures: "effectiveDate must be valid", "amountAmendment must be number" |
| **Severity** | 🔴 High |

---

## 🎯 Quick Fix Summary

### The Problem
```javascript
// Current (broken) code passes ALL fields to both endpoints
if (amendment.amount) {
  // POST to amount endpoint with { effectiveDate, amountAmendment, expiryDate, nextDueDate }
  await api.updateFacilityLoanAmount(facilityIdentifier, loanId, flrMapped);
}

if (amendment.coverEndDate) {
  // PATCH to expiry endpoint with { effectiveDate, amountAmendment, expiryDate, nextDueDate }
  await api.updateFacilityLoan(facilityIdentifier, loanId, flrMapped);
}
```

### The Solution
```javascript
// Fixed code filters payload fields by endpoint
if (amendment.amount) {
  const amountPayload = {
    effectiveDate: flrMapped.effectiveDate,
    amountAmendment: flrMapped.amountAmendment,
  };
  await api.updateFacilityLoanAmount(facilityIdentifier, loanId, amountPayload);
}

if (amendment.coverEndDate) {
  const expiryPayload = {
    expiryDate: flrMapped.expiryDate,
    ...(flrMapped.nextDueDate && { nextDueDate: flrMapped.nextDueDate }),
  };
  await api.updateFacilityLoan(facilityIdentifier, loanId, expiryPayload);
}
```

---

## 📊 APIM Endpoints

Two separate endpoints, each expecting different fields:

| Endpoint | Method | Purpose | Fields |
|----------|--------|---------|--------|
| `/v1/facilities/:id/loans/:loanId/amendments/amount` | POST | Amount amendment | `effectiveDate`, `amountAmendment` |
| `/v1/facilities/:id/loans/:loanId` | PATCH | Expiry amendment | `expiryDate`, `nextDueDate` (opt) |

**The bug:** Sending amount fields to expiry endpoint (and vice versa)

---

## ✅ Test Scenarios

### Scenario 1: Amount Only ✓
- Facility type: Bond
- Amendment has: amount
- Expected: 1 call to amount endpoint
- Current code: ✓ Works
- Fixed code: ✓ Works

### Scenario 2: Expiry Only ⚠️
- Facility type: Loan
- Amendment has: coverEndDate only
- Expected: 1 call to expiry endpoint
- Current code: ⚠️ Fails (sends mixed fields)
- Fixed code: ✓ Works

### Scenario 3: Both Amendments ❌
- Facility type: Bond
- Amendment has: amount AND coverEndDate
- Expected: 2 calls with filtered payloads
- Current code: ❌ Fails on both calls
- Fixed code: ✓ Works

---

## 🔧 Implementation Workflow

1. **Read** [FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md](./FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md)
   - Understand the issue thoroughly

2. **Review** [FACILITY_LOAN_AMENDMENT_FIX.md](./FACILITY_LOAN_AMENDMENT_FIX.md)
   - See exact code changes needed

3. **Apply** the fix to `acbs-amend-facility-loan-record.js`
   - Lines 68-103 contain the fix

4. **Test** using provided test scenarios
   - Verify all three scenarios work

5. **Deploy** with proper testing
   - Verify logs show correct endpoint calls

6. **Monitor** for validation errors
   - Look for `dataSent` in error logs
   - Should have correct fields only

---

## 📁 Related Files

```
/var/www/html/dtfs2/
├── FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md     ← Bug analysis
├── FACILITY_LOAN_AMENDMENT_FIX.md               ← Fix guide
├── AMENDMENT_DOCUMENTATION_INDEX.md             ← This file
│
├── azure-functions/acbs/
│   ├── src/functions/
│   │   ├── acbs-amend-facility-loan-record.js   ← 🔴 FILE TO FIX
│   │   ├── activity-update-facility-loan-amount.js
│   │   ├── activity-update-facility-loan.js
│   │   └── acbs-amend-facility.js
│   │
│   ├── api.js                                    ← API wrappers
│   └── mappings/facility/
│       └── facility-loan-amend.js                ← Mapping logic
│
└── doc/
    ├── apim-endpoints.md                         ← APIM specs
    └── acbs-amendments.md                        ← Amendment architecture
```

---

## 🚀 Getting Started

### For Reviewers
1. Start with [FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md](./FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md)
2. Review the root cause analysis section
3. Check the code references to verify accuracy

### For Implementers
1. Start with [FACILITY_LOAN_AMENDMENT_FIX.md](./FACILITY_LOAN_AMENDMENT_FIX.md)
2. Follow the "Implementation Checklist" section
3. Use the provided test scenarios to verify

### For QA/Testers
1. Read both documents for context
2. Focus on "Test Scenarios" and "Verification Steps" in the fix guide
3. Use provided test scenarios to validate the fix

---

## 📝 Key Points to Remember

✅ **What the fix does:**
- Filters `flrMapped` object before passing to each activity
- Amount activity gets only amount fields
- Expiry activity gets only expiry fields

✅ **Why it matters:**
- Each APIM endpoint has a DTO with specific field requirements
- Sending unexpected fields causes validation errors
- The API strips unknown fields, leaving mandatory fields empty

✅ **When to use:**
- When facility amendment includes both amount and expiry changes
- Or just expiry changes on a facility

✅ **No breaking changes:**
- Single amendment scenarios still work
- Only adds field filtering for multi-amendment scenarios

---

## ❓ FAQ

**Q: Will this break existing single-amendment scenarios?**
A: No. The fix only adds field filtering. Single amendments still work the same way.

**Q: Do I need to change the activity functions?**
A: No. The activity functions (`activity-update-facility-loan-amount.js` and `activity-update-facility-loan.js`) already have correct validation.

**Q: What if only amount is being amended?**
A: The `amendment.coverEndDate` check is false, so expiry endpoint is not called. Only amount endpoint is called with correct fields.

**Q: What if only expiry is being amended?**
A: The `amendment.amount` check is false, so amount endpoint is not called. Only expiry endpoint is called with correct fields.

**Q: Should I check other orchestrators for similar issues?**
A: Yes. The fix guide mentions other sub-orchestrators that might have similar issues:
- `acbs-amend-facility-master-record.js`
- `acbs-amend-facility-covenant-record.js`
- `acbs-amend-facility-guarantee-record.js`

---

## 📞 Support

For questions about:
- **The bug:** See [FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md](./FACILITY_LOAN_AMENDMENT_ENDPOINT_BUG.md)
- **The fix:** See [FACILITY_LOAN_AMENDMENT_FIX.md](./FACILITY_LOAN_AMENDMENT_FIX.md)
- **APIM endpoints:** See `doc/apim-endpoints.md`
- **Architecture:** See `doc/acbs-amendments.md`

---

**Last Updated:** November 13, 2026  
**Status:** 🔴 OPEN (fix not yet deployed)  
**Complexity:** Low (isolated change to 1 file)
