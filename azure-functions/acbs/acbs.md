# ACBS integration cheat sheet

This guide describes the DTFS and TFS API integration with ACBS. It is not a
complete guide to every ACBS feature.

The examples are based on DTFS commit `abc19b1` and TFS API commit `6265832`.
Check the version deployed in your environment, as behaviour may differ.

## 1. Overview

DTFS integrates with ACBS

### ACBS Durable Functions route

```text
DTFS / TFM
   |
   v
External API
   | Starts an Azure Durable Function
   v
DTFS ACBS Durable Functions
   | Map DTFS data into TFS API requests
   v
APIM -> TFS API
   | Validates and maps requests into ACBS format
   v
ACBS
```

### Components and explanation

| Component         | Responsibility                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------- |
| DTFS / TFM        | Holds the deal, facility and amendment data.                                                  |
| External API      | Starts Durable Functions or forwards requests to TFS API.                                     |
| Durable Functions | Coordinate ACBS record creation, issuance and amendments.                                     |
| APIM              | Gateway in front of APIs. Environment policies and routing are separate from repository code. |
| TFS API           | Validates requests, maps them into ACBS requests, and calls ACBS                              |
| ACBS              | Holds and processes deal, facility, loan, guarantee and related financial records.            |
| MDM               | Supplies reference data and identifiers used by the integration.                              |

Sources:

- [DTFS ACBS API client](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/api.js)
- [External API ACBS controller](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/external-api/server/v1/controllers/acbs.controller.ts)

## 2. ACBS records and terminology

```text
Party records: exporter, bank, buyer, etc.
       |
       v
Deal
├── Deal Master Record         DMR
├── Deal Investor Record       DIR
├── Deal Guarantee Record      DGR
|
└── Facility
    ├── Facility Master Record FMR
    ├── Facility Investor      FIR
    ├── Facility Covenant      FCR
    ├── Facility Guarantee     FGR
    ├── Facility Loan Record   FLR
    └── Facility Fixed Fee     FFFR
```

| Record            | Simple explanation                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Party             | An organisation associated with a deal, such as an exporter or bank.                                                         |
| DMR               | The main deal record.                                                                                                        |
| DIR               | The investor-related record for a deal.                                                                                      |
| DGR               | A guarantee associated with the deal.                                                                                        |
| FMR               | The main facility record, including UKEF's maximum liability and the facility expiry date.                                   |
| FIR               | The investor-related record for a facility.                                                                                  |
| FCR               | A covenant associated with a facility, including a target amount and dates.                                                  |
| FGR               | A facility guarantee, including guarantor, guaranteed limit and expiry.                                                      |
| FLR / Loan Record | An ACBS loan record under a facility. It has its own amount, principal balance and maturity date.                            |
| FFFR              | A fixed fee or premium schedule record.                                                                                      |
| Bundle            | An ACBS request containing transaction messages. TFS uses bundles for operations including facility and loan amount changes. |

**FMR amount is not the same thing as FLR principal.** Changing the facility's
maximum liability does not automatically mean the loan principal should change
by the same amount.

Source: [DTFS ACBS README](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/README.md).

## 3. Identifiers

| Identifier            | Meaning                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `dealIdentifier`      | UKEF deal identifier used to identify the ACBS deal.                                                  |
| `facilityIdentifier`  | UKEF facility identifier used to identify the ACBS facility.                                          |
| `partyIdentifier`     | ACBS identifier returned for a party.                                                                 |
| `alternateIdentifier` | Party reference DTFS sends, commonly a party URN. It is not the same field as ACBS `partyIdentifier`. |
| `loanIdentifier`      | ACBS identifier for the loan record. It is not the facility ID.                                       |
| `bundleIdentifier`    | Identifier returned when an ACBS bundle is created.                                                   |
| `portfolioIdentifier` | TFS API's ACBS portfolio; the current default is `E1`.                                                |

For facility amendments, DTFS obtains the loan ID by calling TFS for the
facility's loans, then takes **the first returned loan**.

Source: [loan ID activity](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/src/functions/activity-get-facility-loan-id.js).

## 4. Durable Functions: what calls what

### Create a deal and its facilities

External API starts:

```http
POST /api/orchestrators/acbs
```

With a body shaped like:

```json
{
  "deal": { "...": "DTFS deal data" },
  "bank": { "...": "DTFS bank data" }
}
```

The orchestrator broadly:

1. Looks up industry and, where needed, country reference data.
2. Creates party records for exporter and bank; for non-GEF deals, also the buyer.
3. Creates the deal master, deal investor and deal guarantee.
4. For each facility, creates its FMR, FIR and FCR.
5. Creates facility-type-specific guarantees and, for Bond, additional covenant data.
6. Sends an activation transaction.
7. For issued facilities, creates an FLR and fixed fee records.

Sources:

- [Deal orchestrator](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/src/functions/acbs.js)
- [Facility orchestrator](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/src/functions/acbs-facility.js)

### Issue an existing facility

External API starts:

```http
POST /api/orchestrators/acbs-issue-facility
```

With a body shaped like:

```json
{
  "facilityIdentifier": "UKEF_FACILITY_ID",
  "facility": { "...": "DTFS facility data" },
  "deal": { "...": "DTFS deal data" }
}
```

DTFS gets the FMR, sends an FMR update with `op=issue`, then creates the loan
and fixed fee records.

Source: [issuance orchestrator](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/src/functions/acbs-issue-facility.js).

### Amend a facility

External API starts:

```http
POST /api/orchestrators/acbs-amend-facility
```

The important shape is:

```json
{
  "amendment": {
    "facilityIdentifier": "UKEF_FACILITY_ID",
    "amount": 200000,
    "coverEndDate": "2027-11-01",
    "effectiveDate": "2026-11-16",
    "facility": { "...": "DTFS facility, including facilitySnapshot" },
    "deal": { "...": "DTFS deal, including dealSnapshot" }
  }
}
```

External API sets `amount` from **`amendments.ukefExposure`**, not directly
from the raw facility value. It removes the amount or date if the change was
not requested or was declined.

DTFS then:

1. Gets the FMR and checks its stage is `07`—issued.
2. Runs the FLR amendment.
3. Runs the FMR amendment.
4. If `FF_AMENDMENT_COVENANT_GUARANTEE_ENABLED=true`, also runs FCR and FGR amendments.

Sources:

- [External API mapping](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/external-api/server/v1/controllers/acbs.controller.ts)
- [Amendment orchestrator](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/src/functions/acbs-amend-facility.js)

## 5. DTFS to TFS API endpoints

Paths are relative to the configured TFS API base URL.

DTFS wraps POST bodies in an array: `[{ ...mappedRecord }]`. PUT and PATCH
bodies are objects.

| Purpose               | TFS request                                                        | Main DTFS-mapped fields                                                                                                                     |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Create party          | `POST v1/parties`                                                  | `alternateIdentifier`, `industryClassification`, `name1`, `name2`, `name3`, `smeType`, `citizenshipClass`, `officerRiskDate`, `countryCode` |
| Create deal           | `POST v1/deals`                                                    | `dealIdentifier`, `currency`, `dealValue`, `guaranteeCommencementDate`, obligor ID/name/industry, `creditReviewRiskDate`                    |
| Create deal investor  | `POST v1/deals/{dealId}/investors`                                 | `effectiveDate`, `currency`, `expiryDate`                                                                                                   |
| Create deal guarantee | `POST v1/deals/{dealId}/guarantees`                                | `effectiveDate`, `limitKey`, `guaranteeExpiryDate`, `maximumLiability`, `guarantorParty`                                                    |
| Get FMR               | `GET v1/facilities/{facilityId}`                                   | No request body                                                                                                                             |
| Create FMR            | `POST v1/facilities`                                               | Facility and deal IDs, `maximumLiability`, product, currency, dates, stage, risk and party fields                                           |
| Create FIR            | `POST v1/facilities/{facilityId}/investors`                        | `maximumLiability`, `currency`, `guaranteeExpiryDate`, `effectiveDate`                                                                      |
| Create FCR            | `POST v1/facilities/{facilityId}/covenants`                        | Covenant ID/type, amount, currency and dates                                                                                                |
| Create FGR            | `POST v1/facilities/{facilityId}/guarantees`                       | Guarantor, `limitKey`, dates, `maximumLiability`, guarantee type                                                                            |
| Activate facility     | `POST v1/facilities/{facilityId}/activation-transactions`          | Lender type, bundle status and transaction code value                                                                                       |
| Get FLRs              | `GET v1/facilities/{facilityId}/loans`                             | No request body                                                                                                                             |
| Create FLR            | `POST v1/facilities/{facilityId}/loans`                            | Loan amount, borrower, product, currency, dates and fee/schedule fields                                                                     |
| Create fixed fee      | `POST v1/facilities/{facilityId}/fixed-fees`                       | Amount, dates, period, currency, lender and income class                                                                                    |
| Update FMR            | `PUT v1/facilities/{facilityId}?op=...`                            | Mapped FMR object; operation is `issue`, `amendAmount` or `amendExpiryDate`                                                                 |
| Amend FLR amount      | `POST v1/facilities/{facilityId}/loans/{loanId}/amendments/amount` | `effectiveDate`, `amountAmendment`                                                                                                          |
| Amend FLR expiry      | `PATCH v1/facilities/{facilityId}/loans/{loanId}`                  | `expiryDate`                                                                                                                                |
| Amend FCR             | `PATCH v1/facilities/{facilityId}/covenants`                       | `targetAmount`, `expirationDate`                                                                                                            |
| Amend FGR             | `PATCH v1/facilities/{facilityId}/guarantees`                      | `guaranteedLimit`, `expirationDate`                                                                                                         |

This is an endpoint inventory and a summary of the main fields, not a
substitute for the complete DTOs or full mapped payloads.

Sources:

- [DTFS API client](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/api.js)
- [DTFS mappings](https://github.com/UK-Export-Finance/dtfs2/tree/abc19b1/azure-functions/acbs/mappings)
- [TFS API modules](https://github.com/UK-Export-Finance/tfs-api/tree/6265832/src/modules)

## 6. Important field mappings

### Facility master: DTFS to TFS to ACBS

| Meaning                | DTFS source / TFS field                                  | ACBS field                                              |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Facility ID            | `facilitySnapshot.ukefFacilityId` → `facilityIdentifier` | `FacilityIdentifier`                                    |
| Deal ID                | Deal's ACBS ID → `dealIdentifier`                        | `DealIdentifier`                                        |
| UKEF maximum liability | `facilitySnapshot.ukefExposure` → `maximumLiability`     | `LimitAmount` on creation/update mapping                |
| Facility type          | Derived → `productTypeId`                                | `FacilityType.FacilityTypeCode`                         |
| Currency               | `facilitySnapshot.currency.id` → `currency`              | `Currency.CurrencyCode`                                 |
| Cover end date         | Guarantee dates → `guaranteeExpiryDate`                  | `ExpirationDate` and `FinalAvailableDate`               |
| Stage                  | Derived → `facilityStageCode`                            | `FacilityUserDefinedList1.FacilityUserDefinedList1Code` |
| Exposure period        | Derived → `exposurePeriod`                               | `ExternalReferenceIdentifier`                           |
| Exporter               | ACBS party ID → `obligorPartyIdentifier`                 | `BorrowerParty.PartyIdentifier`                         |

For an **amount amendment**, TFS does not simply send a replacement FMR: it
calculates the difference from ACBS's current `LimitAmount` and creates a
`FacilityAmountTransaction` bundle.

Sources:

- [DTFS FMR mapping](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/mappings/facility/facility-master.js)
- [TFS facility service](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility/facility.service.ts)

### Facility loan: DTFS to TFS to ACBS

| Meaning                 | DTFS / TFS field          | ACBS field                                                                        |
| ----------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| Loan amount at creation | `amount`                  | `LoanAmount`                                                                      |
| Expiry at creation      | `expiryDate`              | `MaturityDate` and `RateMaturityDate`                                             |
| Borrower                | `borrowerPartyIdentifier` | `BorrowerPartyIdentifier`                                                         |
| Product                 | `productTypeId`           | `ProductType.ProductTypeCode`; also influences `LoanInstrumentCode`               |
| Amount change           | `amountAmendment`         | Absolute value becomes `LoanAdvanceAmount`; sign selects transaction code         |
| Expiry amendment        | `expiryDate`              | `MaturityDate`, `RateMaturityDate`, and existing FX valuation dates where present |

For a GEF Contingent loan record, TFS uses product type `281` but sets the loan
instrument code to `280`.

Sources:

- [DTFS loan mapping](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/mappings/facility/facility-loan.js)
- [TFS loan service](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility-loan/facility-loan.service.ts)

### Other useful mappings

| TFS field                          | ACBS field                        |
| ---------------------------------- | --------------------------------- |
| Party `alternateIdentifier`        | `PartyAlternateIdentifier`        |
| Party `name1`                      | `PartyName1`                      |
| Party `smeType`                    | `MinorityClass.MinorityClassCode` |
| FIR `maximumLiability`             | `LimitAmount`                     |
| FCR `maximumLiability` on creation | `TargetAmount`                    |
| FGR `maximumLiability` on creation | `GuaranteedLimit`                 |
| Fixed fee `amount`                 | `FixedFeeAmount`                  |
| Fixed fee `period`                 | `SegmentIdentifier`               |

Complete mappings:

- [Party](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/party/party.service.ts)
- [Facility investor](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility-investor/facility-investor.service.ts)
- [Facility covenant](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility-covenant/facility-covenant.service.ts)
- [Facility guarantee](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility-guarantee/facility-guarantee.service.ts)
- [Fixed fees](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility-fixed-fee/facility-fixed-fee.service.ts)

## 7. Facility types and amount calculations

### Type codes

| DTFS facility type | Product | FMR product code | FLR product code |
| ------------------ | ------- | ---------------: | ---------------: |
| Bond               | BSS     |            `250` |            `250` |
| Loan               | EWCS    |            `260` |            `260` |
| Cash               | GEF     |            `280` |            `280` |
| Contingent         | GEF     |            `280` |            `281` |

### FLR amount at creation

| Facility type  | DTFS calculation                                                   |
| -------------- | ------------------------------------------------------------------ |
| Bond           | UKEF exposure                                                      |
| Loan           | Disbursement amount × cover percentage                             |
| GEF Cash       | UKEF exposure × Cash utilisation percentage; default **85%**       |
| GEF Contingent | UKEF exposure × Contingent utilisation percentage; default **70%** |

The GEF percentages can be overridden by environment variables. Do not rely on
an old comment saying “10%”; the calculation uses the configured or default
Cash/Contingent percentages.

Sources:

- [Type mapping](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/mappings/facility/helpers/get-product-type-id.js)
- [Loan amount mapping](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/mappings/facility/helpers/get-loan-maximum-liability.js)

## 8. Amendment payloads: where they go

### A. Facility amount to the FMR

For a new UKEF exposure of `200000`, DTFS builds an FMR object containing:

```json
{
  "maximumLiability": 200000
}
```

This is only the relevant field. DTFS sends the mapped FMR object, including
other FMR fields.

```http
PUT v1/facilities/{facilityId}?op=amendAmount
```

TFS retrieves the existing facility from ACBS and creates a bundle. For
example, if ACBS currently has `LimitAmount = 250000`, the important ACBS
bundle message fields are:

```json
{
  "$type": "FacilityAmountTransaction",
  "FacilityIdentifier": "UKEF_FACILITY_ID",
  "FacilityTransactionType": { "TypeCode": "2320" },
  "TransactionAmount": 50000
}
```

This is an excerpt, not the complete bundle. The reviewed TFS code uses `2300`
for an increase and `2320` for a decrease. It uses the existing ACBS facility's
`OriginalEffectiveDate` in that bundle.

The ACBS request goes to:

```http
POST /BundleInformation?servicingQueueIdentifier=DCIS
```

### B. Loan amount to the FLR

For Cash, Contingent and Bond, DTFS maps:

```text
difference = new UKEF exposure − current FMR maximumLiability

Bond:           amountAmendment = difference
GEF Cash:       amountAmendment = difference × Cash percentage
GEF Contingent: amountAmendment = difference × Contingent percentage
```

DTFS sends, for example:

```http
POST v1/facilities/{facilityId}/loans/{loanId}/amendments/amount
```

```json
[
  {
    "effectiveDate": "2026-11-16",
    "amountAmendment": -50000
  }
]
```

For a combined amendment, DTFS passes the same mapped object to both loan
endpoints, so it may also contain `expiryDate` and, for an at-maturity fee,
`nextDueDate`. The reviewed TFS flexible validation accepts extra fields and
strips fields outside the endpoint DTO.

TFS builds an ACBS bundle with these important fields:

```json
{
  "$type": "LoanAdvanceTransaction",
  "EffectiveDate": "2026-11-16T00:00:00Z",
  "LoanIdentifier": "ACBS_LOAN_ID",
  "TransactionTypeCode": "9030",
  "LoanAdvanceAmount": 50000
}
```

This is an excerpt, not the complete bundle. The reviewed TFS source uses
`9020` for positive changes and `9030` for negative changes. **Check the
deployed version:** earlier TFS versions used `9040/9050`.

For DTFS facility type **Loan**, the mapper intentionally does not create
`amountAmendment`.

### C. Cover end date to the FLR and FMR

DTFS maps the date for the loan endpoint:

```http
PATCH v1/facilities/{facilityId}/loans/{loanId}
```

```json
{
  "expiryDate": "2027-11-01"
}
```

TFS reads the ACBS loan, then sends an updated loan to:

```http
PUT /Portfolio/E1/Loan/{loanId}
```

It changes `MaturityDate` and `RateMaturityDate`; it also changes the
financial/customer valuation dates if those fields already exist.

DTFS separately sends the mapped FMR to:

```http
PUT v1/facilities/{facilityId}?op=amendExpiryDate
```

TFS reads the existing ACBS facility, merges the mapped fields and sends an
updated facility to:

```http
PUT /Portfolio/E1/Facility/{facilityId}
```

**`nextDueDate` caveat:** DTFS may include it in the mapped FLR object for
at-maturity fees, but the reviewed TFS loan-expiry DTO defines only
`expiryDate`. Do not assume the extra field updates ACBS.

### D. Covenant and guarantee amendments

These are sent only when the DTFS feature flag is enabled.

Covenant:

```http
PATCH v1/facilities/{facilityId}/covenants
```

```json
{
  "targetAmount": 200000,
  "expirationDate": "2027-11-01"
}
```

Guarantee:

```http
PATCH v1/facilities/{facilityId}/guarantees
```

```json
{
  "guaranteedLimit": 200000,
  "expirationDate": "2027-11-01"
}
```

TFS reads the facility's existing covenants or guarantees and applies the
supplied fields to each one.

Sources:

- [DTFS loan amendment mapper](https://github.com/UK-Export-Finance/dtfs2/blob/abc19b1/azure-functions/acbs/mappings/facility/facility-loan-amend.js)
- [TFS facility mapping](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility/facility.service.ts)
- [TFS loan mapping](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/facility-loan/facility-loan.service.ts)
- [TFS bundle endpoint](https://github.com/UK-Export-Finance/tfs-api/blob/6265832/src/modules/acbs/acbs-bundle-information.service.ts)
