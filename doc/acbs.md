# ACBS integration

This guide describes where the repository calls ACBS, the conditions that start
each workflow, and the TFS/MDM operations made by the Azure Functions app.
ACBS is the Automated Commercial Banking System. In this integration, TFM starts
work through the External API; the `azure-functions/acbs` Durable Functions app
maps DTFS deal and facility data to TFS API records.

## Architecture and call paths

```text
TFM API
  -> External API /acbs...
    -> ACBS Azure Function HTTP starter
      -> Durable orchestration and activities
        -> APIM TFS API and, where required, APIM MDM API

TFM scheduled job
  -> polls logged Durable orchestrations
  -> records status and copies completed ACBS data onto TFM deals/facilities
```

The External API starts an orchestration and returns its Durable Functions
response (including the status-polling links). The initial-deal and facility
issue flows store those links in the `durable-functions-log` collection, which
TFM later polls. The amendment flow currently does not create a log entry
because it calls the logger without the required deal object; consequently,
the TFM poller does not process or persist that orchestration's result. The API
wrapper and the durable orchestration entry point are in
[the ACBS API client](../azure-functions/acbs/api.js),
[the HTTP starter](../azure-functions/acbs/src/functions/acbs-http.js), and
[the TFM ACBS controller](../trade-finance-manager-api/server/v1/controllers/acbs.controller.js).

## When TFM starts ACBS work

### Create deal and facility records

TFM starts the `acbs` orchestration from either of these flows:

- After a first deal submission, in
  [`submitDealAfterUkefIds`](../trade-finance-manager-api/server/v1/controllers/deal.submit.controller.js),
  after TFM has updated the deal and its facilities.
- After a deal resubmission, from the same controller. The same eligibility
  check is used for deal creation; TFM then separately checks whether it can
  issue facilities.
- After TFM updates deal parties, in
  [`updateParty`](../trade-finance-manager-api/server/v1/controllers/party.controller.js).

All three flows use
[`canSubmitToACBS`](../trade-finance-manager-api/server/v1/helpers/can-submit-to-acbs.js).
It returns true only when all of the following hold:

1. A deal, `dealSnapshot`, and `tfm` object are present.
2. The submission type is `AIN` or `MIN`.
3. For the default first-submission check, the deal does not already have
   `tfm.acbs`.
4. The deal has a valid 10-digit UKEF ID, and every facility has a UKEF ID.
5. Required deal-party URNs and any required bond issuer/beneficiary URNs exist.

There is an implementation caveat in the facility-ID check:
[`dealHasAllValidUkefIds`](../trade-finance-manager-api/server/v1/helpers/dealHasAllUkefIds.js)
rejects missing facility IDs, but its current predicate does not reject a
non-empty facility ID that is not a valid 10-digit number. The deal ID itself
is checked for the numeric format.

### TFM deal fields read by `canSubmitToACBS`

The helper receives a TFM deal object, then fetches the persisted deal again by
`_id` when it checks the UKEF IDs. These are the fields it reads:

| TFM database path                                           | Requirement                                                                                                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`                                                       | Must be truthy and identify a retrievable TFM deal.                                                                                                                        |
| `dealSnapshot`                                              | Must be present.                                                                                                                                                           |
| `dealSnapshot.submissionType`                               | Must be `AIN` or `MIN`.                                                                                                                                                    |
| `dealSnapshot.dealType`                                     | Selects the UKEF deal-ID path below: exact GEF uses `ukefDealId`; any other value uses `details.ukefDealId` (BSS/EWCS). The helper does not validate the deal type itself. |
| `dealSnapshot.ukefDealId`                                   | For GEF deals: required, truthy, and a valid 10-digit UKEF ID.                                                                                                             |
| `dealSnapshot.details.ukefDealId`                           | For non-GEF (BSS/EWCS) deals: required, truthy, and a valid 10-digit UKEF ID.                                                                                              |
| `dealSnapshot.facilities`                                   | Must be present as an array. An empty array technically passes these checks.                                                                                               |
| `dealSnapshot.facilities[].facilitySnapshot.ukefFacilityId` | Must be truthy for every facility. See the format-validation caveat above.                                                                                                 |
| `tfm`                                                       | Must be present.                                                                                                                                                           |
| `tfm.acbs`                                                  | Must be falsey/absent when `firstSubmissionCheck` is true (the default). It is not checked when that option is false.                                                      |
| `tfm.parties`                                               | Must be present as an object; each entry is checked as described below. An empty object technically passes the URN check.                                                  |

#### Exact deal-party fields

The standard `tfm.parties` object is populated with these four entries by
[`addPartyUrns`](../trade-finance-manager-api/server/v1/controllers/deal.party-db.js):

| TFM database fields                                                            | When `partyUrn` must be truthy          |
| ------------------------------------------------------------------------------ | --------------------------------------- |
| `tfm.parties.exporter.partyUrnRequired`, `tfm.parties.exporter.partyUrn`       | When `exporter.companyName` is truthy.  |
| `tfm.parties.buyer.partyUrnRequired`, `tfm.parties.buyer.partyUrn`             | When `buyer.name` is truthy.            |
| `tfm.parties.indemnifier.partyUrnRequired`, `tfm.parties.indemnifier.partyUrn` | When `indemnifier.name` is truthy.      |
| `tfm.parties.agent.partyUrnRequired`, `tfm.parties.agent.partyUrn`             | When `eligibility.agentName` is truthy. |

`partyUrnRequired` is set to the matching condition in the second column.
`canSubmitToACBS` iterates every value in `tfm.parties`: each entry must have a
truthy `partyUrn` when its `partyUrnRequired` is true. The exporter URN is
looked up or created during `addPartyUrns`; the other three URNs start as empty
strings there and must be populated when their party is required. The check
only tests truthiness; it does not validate URN format. See
[`allPartiesHaveUrn`](../trade-finance-manager-api/server/v1/helpers/all-parties-have-urn.js)
for the exact predicate.

For a GEF AIN, product type and submission type do not themselves make the
buyer, indemnifier, or agent URNs mandatory. If `buyer.name`,
`indemnifier.name`, and `eligibility.agentName` are absent, their
`partyUrnRequired` flags are false and those URNs may remain empty; the
exporter URN is required when `exporter.companyName` is present. If any of
those other party names is present, its matching URN is required as well.

#### Exact facility bond-party fields

For each entry in `dealSnapshot.facilities`:

| Facility snapshot field                      | Required TFM database field                                             |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `facilitySnapshot.bondIssuer` is truthy      | `dealSnapshot.facilities[].tfm.bondIssuerPartyUrn` must be truthy.      |
| `facilitySnapshot.bondBeneficiary` is truthy | `dealSnapshot.facilities[].tfm.bondBeneficiaryPartyUrn` must be truthy. |

These are only required for the corresponding bond party; if the snapshot
field is falsey or absent, the matching URN is not required.

The resubmission flow calls this check a second time with
`firstSubmissionCheck: false` before considering facility issuance. That skips
only the “no existing `tfm.acbs`” check; the submission type, IDs, and party
URN checks still apply.

### Issue facilities

After a resubmission, TFM calls `issueAcbsFacilities` only if the eligibility
check above passes. The controller also requires the deal to have
`tfm.acbs`. It sends only facilities that have been issued in Portal
(`hasBeenIssued`) and are still at ACBS stage `06` (commitment/unissued).
Facilities already at stage `07` (issued), or stage `08` (risk expired), are
not sent for issuance. The stage check is
[`isUnissuedInACBS`](../trade-finance-manager-api/server/v1/helpers/is-facility-unissued-acbs.js).

### Amend facilities

Facility amendments are sent from the TFM amendment update and submission
flows in
[`amendment.controller.js`](../trade-finance-manager-api/server/v1/controllers/amendment.controller.js),
through [`canSendToAcbs`](../libs/common/src/helpers/can-submit-to-acbs.ts).
The shared gate requires an amount/value or cover-end-date change, a submitted
amendment, the appropriate user involvement, and that the update is not merely
a task update:

- Portal amendment: status is `Acknowledged` and `createdBy.username` exists.
- TFM amendment: status is `Completed` and `submittedByPim` is set.
- Manual TFM amendment (UKEF approval required and a bank decision is present):
  the bank decision must be submitted and `PROCEED`, and the amendment must not
  be declined.

For value amendments, TFM adds the calculated UKEF exposure. It sends an
internal amendment email before starting ACBS processing.

### Check whether an allocated UKEF ID is already in ACBS

The External API exposes `GET /acbs/:entityType/:id`. It checks either a deal
or facility ID against the corresponding TFS GET endpoint; a `404` means the
ID is not in use. This is a separate endpoint, not the eligibility check used
by TFM deal submission: `canSubmitToACBS` checks that IDs are valid numeric
IDs, but does not call this endpoint.

## External API entry points

The routes are registered in
[`external-apis.route.ts`](../external-api/server/v1/routes/external-apis.route.ts)
and handled by
[`acbs.controller.ts`](../external-api/server/v1/controllers/acbs.controller.ts).
The External API base URL includes the version prefix (normally `/v1`).

| Route                                | What it starts or checks                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `POST /acbs`                         | Starts the `acbs` orchestration to create deal, party, and facility records. |
| `GET /acbs/:entityType/:id`          | Checks whether a deal or facility ID already exists in TFS.                  |
| `POST /acbs/facility/:id/issue`      | Starts `acbs-issue-facility` for one facility.                               |
| `POST /acbs/facility/:id/amendments` | Starts `acbs-amend-facility` for one facility amendment.                     |

The durable HTTP starter is `POST /api/orchestrators/{orchestratorName}` on the
ACBS Function App. It accepts the orchestration name and JSON input, starts the
orchestration, and returns a Durable Functions status response.

## ACBS orchestration behavior

### Initial deal submission: `acbs`

The main orchestration is
[`acbs.js`](../azure-functions/acbs/src/functions/acbs.js). It:

1. Maps the supplier industry to an ACBS industry code. For non-UK countries on
   GEF deals, it also maps the country through MDM. Missing countries default
   to `GBR`; UK country values are normalized to `GBR`.
2. Creates the exporter and bank party records in parallel. It also creates a
   buyer party for non-GEF deals.
3. Creates the deal master, deal investor, and deal guarantee records, in that
   order.
4. Starts one facility sub-orchestration per deal facility in parallel.

The deal ID and each facility ID are rejected if they still contain a pending
or test ID. For the deal guarantee `limitKey`, the orchestration selects the
indemnifier party identifier if `parties.indemnifier` exists; otherwise it
selects the exporter party identifier. The current initial-deal orchestration
creates only exporter, bank, and (for non-GEF) buyer parties, so it takes the
exporter fallback. Although an indemnifier party mapping exists, this
orchestration does not call it or add an indemnifier to `parties`.

### Facility creation: `acbs-facility`

[`acbs-facility.js`](../azure-functions/acbs/src/functions/acbs-facility.js)
creates records in this order:

1. Facility master.
2. Facility investor.
3. Standard facility covenant.
4. Facility-type-specific records:

   - GEF facilities use the loan sub-orchestration.
   - Non-GEF loan facilities use the loan sub-orchestration.
   - Non-GEF bond facilities use the bond sub-orchestration.

   The loan sub-orchestration creates the facility-provider guarantee. For
   non-GEF deals it also creates the buyer-for-exporter guarantee. The bond
   sub-orchestration creates a chargeable-amount covenant, creates
   bond-issuer/beneficiary parties when their URNs are present, and creates the
   corresponding guarantees.

5. Facility activation transaction (code-value transaction).
6. If the facility is already issued/activated, facility loan and fixed-fee
   record(s).

Facility loan and fixed-fee records are created only when the facility has
already been issued/activated according to the facility mapping helper. For
unissued facilities, the orchestration still creates the master and supporting
records and activation transaction, but skips the loan and fixed-fee records;
those are added when the facility is issued later.

### Facility issuance: `acbs-issue-facility`

[`acbs-issue-facility.js`](../azure-functions/acbs/src/functions/acbs-issue-facility.js)
retrieves the existing facility master and its ETag, maps the issued values,
and updates the master with operation `issue`. It then creates the facility
loan and fixed-fee record(s). The flow requires a valid facility identifier
and an existing master record with an ETag.

### Facility amendment: `acbs-amend-facility`

[`acbs-amend-facility.js`](../azure-functions/acbs/src/functions/acbs-amend-facility.js)
requires a facility ID, facility and deal data, an effective date, and an
amount and/or cover end date. Pending/test IDs are rejected. The orchestration
retrieves the facility master and accepts amendments only when its ACBS stage
is `07` (issued).

It updates the facility loan record and facility master record. Amount and
cover-end-date changes are applied independently; the master record is fetched
again to obtain a current ETag before a cover-end-date update. A loan-record
amendment is skipped when the mapping has no fields to update (for example,
the supported loan amount-only case).

Facility covenant and guarantee amendments are additionally sent only when
`FF_AMENDMENT_COVENANT_GUARANTEE_ENABLED` is exactly `true`. If disabled, the
loan and master amendment flows still run.

## TFS and MDM calls

The exact paths below are relative to `APIM_TFS_URL` or `APIM_MDM_URL`.
Implementations and HTTP methods are in
[the ACBS API client](../azure-functions/acbs/api.js) and
[ACBS MDM client](../azure-functions/acbs/apim-mdm.js).

| Service and request                                                     | What the call does                                                                                                                                                                                                                                                                                                                                        | When used                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TFS `GET /v1/deals/{dealId}`                                            | Reads a deal by its UKEF ID. The External API ID-check route returns the TFS response status; its route contract says `404` means the ID is unused.                                                                                                                                                                                                       | `GET /acbs/deal/{id}` ID-in-use check.                                                                                                                                                                                    |
| TFS `GET /v1/facilities/{facilityId}`                                   | Reads a facility by UKEF ID for the ID check. In orchestration workflows, reads the facility master record and its HTTP `ETag`; issuance/amendment mapping uses the returned record, and updates send the ETag as `If-Match`.                                                                                                                             | ID-in-use checks, issuance, amendments.                                                                                                                                                                                   |
| TFS `GET /v1/facilities/{facilityId}/loans`                             | Lists loans for the facility. The activity takes the first result's `loanIdentifier`; no result or no identifier is treated as an error.                                                                                                                                                                                                                  | Before changing an existing loan record during an amendment.                                                                                                                                                              |
| TFS `POST /v1/parties`                                                  | Creates a party using its alternate UKEF party URN, name split across up to three 35-character fields, industry classification, SME type, citizenship class, country, and officer-risk date. The returned ACBS `partyIdentifier` is referenced by later deal/facility records.                                                                            | Exporter and bank for every deal; buyer for non-GEF; bond issuer/beneficiary when their facility URNs exist.                                                                                                              |
| TFS `POST /v1/deals`                                                    | Creates the deal master: deal ID, deal currency/value, commencement/effective date, exporter ACBS party ID and name, industry classification, and submission-based risk date.                                                                                                                                                                             | Once per initial `acbs` orchestration, after required parties are created.                                                                                                                                                |
| TFS `POST /v1/deals/{dealId}/investors`                                 | Creates the deal investor period, mapped with deal effective date and currency. Expiry is the configured far-future value (`2050-12-31`) to represent no fixed expiry.                                                                                                                                                                                    | After the deal master is created.                                                                                                                                                                                         |
| TFS `POST /v1/deals/{dealId}/guarantees`                                | Creates the deal guarantee with effective/expiry dates, maximum liability, the UKEF guarantor code, and `limitKey` tied to the selected party's ACBS ID. The orchestration selects the indemnifier if present in its `parties` object, otherwise the exporter; its current party-creation flow does not populate an indemnifier, so it uses the exporter. | After the deal investor record is created.                                                                                                                                                                                |
| TFS `POST /v1/facilities`                                               | Creates the facility master (FMR), linking it to the deal and exporter. The mapping includes exposure, product/facility type, currency, dates, delegation, fee/interest rate, stage, risk, and other required ACBS fields.                                                                                                                                | Once per facility during initial deal creation.                                                                                                                                                                           |
| TFS `POST /v1/facilities/{facilityId}/investors`                        | Creates the facility investor record with maximum liability, currency, effective date, and guarantee expiry date.                                                                                                                                                                                                                                         | After the facility master is created.                                                                                                                                                                                     |
| TFS `POST /v1/facilities/{facilityId}/covenants`                        | Creates a covenant with its generated covenant ID, covenant type, maximum liability, currency, effective date, and expiry date. Currency is converted to the ACBS code before this request.                                                                                                                                                               | Initial facility creation; one standard covenant, plus a chargeable-amount covenant for bonds.                                                                                                                            |
| TFS `POST /v1/facilities/{facilityId}/guarantees`                       | Creates a facility guarantee with type-specific guarantor, exporter `limitKey`, maximum liability, and effective/expiry dates. The type identifies provider, buyer-for-exporter, bond giver, or bond beneficiary.                                                                                                                                         | Facility loan/bond sub-orchestrations.                                                                                                                                                                                    |
| TFS `POST /v1/facilities/{facilityId}/activation-transactions`          | Creates the code-value transaction that initializes the facility bundle/activation, using configured lender type, initial bundle status, and transaction code values.                                                                                                                                                                                     | After the facility master, investor, standard covenant, and type-specific records (including guarantees and bond-specific records); before any loan and fixed-fee records for an already issued/activated facility.       |
| TFS `POST /v1/facilities/{facilityId}/loans`                            | Creates the facility loan record with borrower, product, amount, currency, issue/expiry dates, premium rate, due date, and billing/day-count settings. When `facility.tfm.exchangeRate` is set, it adds FX rate/operation; BSS/EWCS add contractual interest and index-frequency fields.                                                                  | Only for facilities already issued/activated when created, or during the later issue workflow.                                                                                                                            |
| TFS `POST /v1/facilities/{facilityId}/fixed-fees`                       | Creates fixed-fee/premium records with amount and schedule dates, period, currency, income class, and lender type. GEF maps one record; BSS/EWCS map one per premium-schedule segment.                                                                                                                                                                    | Along with the facility loan, only for issued/activated facilities.                                                                                                                                                       |
| TFS `POST /v1/facilities/{facilityId}/loans/{loanId}/amendments/amount` | Submits an ACBS loan amount amendment using the mapped amount-difference fields and amendment effective date. This is an amount amendment operation, not a replacement loan record.                                                                                                                                                                       | For amount changes when the loan amendment mapping produces fields. Loan facilities with an amount-only change can produce an empty loan mapping and skip this call; the facility master amount update is still separate. |
| TFS `PUT /v1/facilities/{facilityId}?op={operation}`                    | Replaces/updates the facility master from the fetched record plus mapped changes. `op=issue` sets issued-stage fields; `op=amendAmount` changes maximum liability; `op=amendExpiryDate` changes guarantee expiry/exposure period. Sends `If-Match` with the current ETag.                                                                                 | Facility issue and facility master amendments.                                                                                                                                                                            |
| TFS `PATCH /v1/facilities/{facilityId}/loans/{loanId}`                  | Patches loan expiry date; for an at-maturity fee, also moves `nextDueDate` to the new cover end date.                                                                                                                                                                                                                                                     | Cover-end-date loan amendments.                                                                                                                                                                                           |
| TFS `PATCH /v1/facilities/{facilityId}/covenants`                       | Patches covenant `targetAmount` and/or `expirationDate`.                                                                                                                                                                                                                                                                                                  | Amendment workflow only when `FF_AMENDMENT_COVENANT_GUARANTEE_ENABLED=true`.                                                                                                                                              |
| TFS `PATCH /v1/facilities/{facilityId}/guarantees`                      | Patches guarantee `guaranteedLimit` and/or `expirationDate`.                                                                                                                                                                                                                                                                                              | Amendment workflow only when `FF_AMENDMENT_COVENANT_GUARANTEE_ENABLED=true`.                                                                                                                                              |
| MDM `GET /v1/sector-industries?ukefIndustryId={industryId}`             | Looks up the ACBS industry-sector ID for the supplied UKEF industry ID; the first result's `acbsIndustryId` is used.                                                                                                                                                                                                                                      | Every initial deal orchestration.                                                                                                                                                                                         |
| MDM `GET /v1/markets?search={country}`                                  | Searches for the ACBS country/market and uses the first result's `isoCode`.                                                                                                                                                                                                                                                                               | GEF deal with a non-UK supplier country.                                                                                                                                                                                  |
| MDM `GET /v1/currencies/{currencyCode}`                                 | Looks up the ACBS currency code used in a covenant. Current code uses the first result's `acbsCode` only for an HTTP 200 response with more than one result; otherwise it falls back to `O`.                                                                                                                                                              | Before each facility covenant create.                                                                                                                                                                                     |
| MDM `POST /v1/numbers`                                                  | Requests a covenant number (`numberTypeId: 8`, created/requesting system `Portal v2/TFM`); the first result's `maskedId` becomes the covenant identifier in the TFS create request.                                                                                                                                                                       | Immediately before each facility covenant create.                                                                                                                                                                         |

Industry lookup falls back to the default ACBS industry code when MDM returns no
usable result. Country lookup falls back to `GBR`. Both are best-effort
reference lookups; a missing result does not itself fail the orchestration.

### MDM calls that prepare ACBS prerequisites

The following MDM calls happen outside the ACBS Durable Function, but are part
of preparing the party URNs and UKEF IDs that ACBS submission depends on.
Party-URN preparation is handled by
[`deal.party-db.js`](../trade-finance-manager-api/server/v1/controllers/deal.party-db.js)
and the [External API Party DB controller](../external-api/server/v1/controllers/party-db.controller.ts);
UKEF number allocation is handled by the
[External API number-generator controller](../external-api/server/v1/controllers/number-generator.controller.ts).

| DTFS flow and endpoint                          | MDM request                                                                        | What it does                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TFM `GET /party-db/{companyRegistrationNumber}` | `GET /v1/customers?companyReg={companyRegistrationNumber}`                         | Looks up the exporter in Party DB by Companies House registration number and returns the party URN, if one exists. Used when Salesforce customer creation is disabled.                                                                                                                                                                                                                                                    |
| TFM `POST /party-db`                            | First `GET /v1/sector-industries?ukefIndustryId={code}`, then `POST /v1/customers` | Used when Salesforce customer creation is enabled. External API validates the registration number, name, industry code, and customer type; it maps the industry code to ACBS industry/sector names, then sends company name, registration number, customer type, probability of default, UK-entity flag, and those industry/sector names to Party DB. The returned party URN is saved as `tfm.parties.exporter.partyUrn`. |
| External API `POST /number-generator`           | `POST /v1/numbers`                                                                 | Allocates a UKEF deal or facility ID. `entityType` selects the number type; the request identifies DTFS as the creator/requesting system. The first result's `maskedId` is returned as the allocated ID. These IDs must be assigned before the `canSubmitToACBS` gate passes.                                                                                                                                             |

With Salesforce customer creation enabled, `addPartyUrns` may first call
`GET /party-db/{companyRegistrationNumber}` to check whether the exporter
already existed, then call `POST /party-db` to get or create the customer. That
pre-check is made only when registration number, company name, probability of
default, and industry code are all present. The exporter URN lookup/create
path itself requires a registration number; in the enabled flow it also
requires company name, probability of default, and industry code. A failure to
obtain the URN leaves it empty, and a required exporter URN then prevents ACBS
submission.

### Request and response handling

The shared [ACBS API client](../azure-functions/acbs/api.js) sends TFS and MDM
POST bodies as a one-item array (`[payload]`); PUT and PATCH bodies are sent as
objects. The TFS client adds the configured TFS key header; the MDM client adds
the configured MDM key header. The generic clients convert HTTP/network errors
to a `{ status, data }` result for the activity to handle.

For the ID-in-use route, the OpenAPI contract says a TFS `404` means the ID is
available. In the current implementation, `checkDealId` does not catch an
Axios rejection for a non-2xx response, while `checkFacilityId` does catch it
and extracts the response status; their not-found behavior is therefore not
implemented identically.

Record-create activities check their configured mandatory fields before
making a request. If fields are missing, they return a `missingMandatory`
array without calling TFS; most record-create/update activities throw when TFS
returns an HTTP error, allowing Durable retry behavior to apply. Successful
record activities include the sent data, send/receive timestamps, and returned
ACBS data in their activity result. The orchestration aggregates those results
into its output, which TFM stores in the Durable status log and, on completion,
copies into the deal/facility ACBS fields. Industry/country lookup activities
instead log errors and return their documented default values.

## Durable Functions lifecycle

The ACBS app uses Azure Durable Functions to run ACBS work asynchronously:

1. The [HTTP starter](../azure-functions/acbs/src/functions/acbs-http.js)
   reads the request body and calls `startNew` with the requested orchestrator
   name (`acbs`, `acbs-issue-facility`, or `acbs-amend-facility`). Azure returns
   `202 Accepted` and status URLs, including `statusQueryGetUri`; this means
   the orchestration was scheduled, not that ACBS processing has finished.
2. The orchestration coordinates activity functions and sub-orchestrations.
   The orchestration functions describe the workflow; activity functions
   perform the external TFS/MDM HTTP calls. Durable Functions persists the
   orchestration state so the workflow can resume after a host restart.
3. The instance remains `Running` while its activities and child
   orchestrations are in progress. Activity calls use the configured retry
   policy. Once the orchestration returns normally, Durable Functions reports
   `Completed`; if an uncaught error escapes the orchestration, it reports a
   failure status instead.
4. TFM's [`checkAzureAcbsFunction` poller](../trade-finance-manager-api/server/v1/controllers/acbs.controller.js)
   requests each running instance's status URL on the schedule configured in
   [`check-azure-acbs-function.js`](../trade-finance-manager-api/server/cron-scheduler-jobs/check-azure-acbs-function.js).
   When a response has a `runtimeStatus` other than `Running`, TFM saves that
   status and the full status response as `acbsTaskResult` in the
   `durable-functions-log` collection. TFM copies results to deal/facility
   records only when the status is exactly `Completed`, and only for
   orchestrations represented by a TFM log entry:
   - `acbs-issue-facility`: updates the facility's ACBS stage and stores the
     returned master, loan, and fee records.
   - `acbs-amend-facility`: the completion handler is intended to store the
     returned master and loan amendment results under the orchestration
     instance ID on the facility. However, the current amendment launcher calls
     `addToACBSLog({ acbsTaskLinks })` without the `deal` property required by
     that logger. The logger returns `false` without inserting a log entry, so
     the poller cannot reach this completion handler for amendments started
     through this path; their results are not persisted to the TFM facility.
   - `acbs`: updates the deal and its facilities with the returned ACBS data.

`Completed` means the orchestrator returned normally; it does not always mean
every ACBS write succeeded. For example, the deal and amendment orchestrators
catch some errors and return `false`, which is still a normal orchestration
return. Some activities can also return a `missingMandatory` result instead of
throwing. Check `acbsTaskResult.output` and the activity results in the Durable
status response, as well as the log/error details, before treating a completed
instance as successful ACBS submission. A status such as `Failed` is recorded
but does not trigger the completed-result updates.

## Status tracking, retries, and configuration

- Durable activities are called with the ACBS retry policy: five attempts and
  a five-second initial retry interval.
- TFM's `checkAzureAcbsFunction` job polls outstanding ACBS status URLs every
  ten minutes by default. `AZURE_ACBS_FUNCTION_SCHEDULE` overrides the schedule.
- Initial-deal and facility-issue orchestrations are recorded in
  `durable-functions-log` with status `Running`, their instance ID, status URLs,
  and deal context. The amendment launcher currently fails to create this log
  entry because it omits the required `deal` argument to `addToACBSLog`; see
  the lifecycle section for the impact on amendment result persistence.
- The ACBS Function App uses `APIM_TFS_URL`, `APIM_TFS_KEY`,
  `APIM_TFS_VALUE`, `APIM_MDM_URL`, `APIM_MDM_KEY`, and `APIM_MDM_VALUE`.
  The key variables are header names and the value variables are credentials.
  The Azure Function client concatenates each base URL and a relative `v1/...`
  path, so the base URLs must end in `/`.
- `AZURE_ACBS_FUNCTION_URL` points the External API and TFM to the ACBS
  Function App. `FF_AMENDMENT_COVENANT_GUARANTEE_ENABLED` controls optional
  covenant and guarantee amendment requests.

See the
[ACBS Function App README](../azure-functions/acbs/README.md) for local
development instructions. The main implementation areas are the
[ACBS mappings](../azure-functions/acbs/mappings/index.js),
[Durable activities and orchestrations](../azure-functions/acbs/src/functions),
[TFM integration controller](../trade-finance-manager-api/server/v1/controllers/acbs.controller.js),
and [External API ACBS controller](../external-api/server/v1/controllers/acbs.controller.ts).
