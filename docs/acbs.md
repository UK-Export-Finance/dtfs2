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
  -> polls each started Durable orchestration
  -> records status and copies/inserts completed ACBS data onto TFM deals/facilities into the tfm object within the collection
```

The External API starts an orchestration and returns its Durable Functions
response (including the status-polling links). TFM stores those links in the
`durable-functions-log` collection and later polls the status URL. Completion
results are written to the TFM deal and facility records. The API wrapper and
the durable orchestration entry point are in
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
or test ID. The deal guarantee is associated with the indemnifier when present,
otherwise with the exporter.

### Facility creation: `acbs-facility`

[`acbs-facility.js`](../azure-functions/acbs/src/functions/acbs-facility.js)
creates a facility master, investor, covenant, and activation transaction.
It then creates facility-type-specific records:

- GEF facilities use the loan sub-orchestration.
- Non-GEF loan facilities use the loan sub-orchestration.
- Non-GEF bond facilities use the bond sub-orchestration.

The loan sub-orchestration creates the facility-provider guarantee. For
non-GEF deals it also creates the buyer-for-exporter guarantee.
The bond sub-orchestration creates a chargeable-amount covenant, creates
bond-issuer/beneficiary parties when their URNs are present, and creates the
corresponding guarantees.

Facility loan and fixed-fee records are created only when the facility has
already been issued/activated according to the facility mapping helper. For
unissued facilities, the orchestration still creates the master and supporting
records, but skips the loan and fixed-fee records; those are added when the
facility is issued later.

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
[the ACBS API client](../azure-functions/acbs/api.js).

| Service and request                                                     | Purpose                                                                                | When used                                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| TFS `GET /v1/deals/{dealId}`                                            | Read a deal by UKEF ID.                                                                | ID-in-use check endpoint.                                                          |
| TFS `GET /v1/facilities/{facilityId}`                                   | Read a facility by UKEF ID, or retrieve the facility master (including ETag).          | ID-in-use checks, issuance, and amendments.                                        |
| TFS `GET /v1/facilities/{facilityId}/loans`                             | Find the ACBS loan ID for a facility.                                                  | Loan-record amendments.                                                            |
| TFS `POST /v1/parties`                                                  | Create an ACBS party.                                                                  | Exporter, bank, buyer, and optional bond issuer/beneficiary parties.               |
| TFS `POST /v1/deals`                                                    | Create the deal master record.                                                         | Initial deal orchestration.                                                        |
| TFS `POST /v1/deals/{dealId}/investors`                                 | Create the deal investor record.                                                       | Initial deal orchestration.                                                        |
| TFS `POST /v1/deals/{dealId}/guarantees`                                | Create the deal guarantee record.                                                      | Initial deal orchestration.                                                        |
| TFS `POST /v1/facilities`                                               | Create the facility master record.                                                     | Initial facility orchestration.                                                    |
| TFS `POST /v1/facilities/{facilityId}/investors`                        | Create a facility investor record.                                                     | Initial facility orchestration.                                                    |
| TFS `POST /v1/facilities/{facilityId}/covenants`                        | Create a facility covenant record.                                                     | Initial facility orchestration, including bond covenants.                          |
| TFS `POST /v1/facilities/{facilityId}/guarantees`                       | Create a facility guarantee record.                                                    | Initial facility orchestration.                                                    |
| TFS `POST /v1/facilities/{facilityId}/activation-transactions`          | Create the facility activation/code-value transaction.                                 | Initial facility orchestration.                                                    |
| TFS `POST /v1/facilities/{facilityId}/loans`                            | Create a facility loan record.                                                         | Issued/activated facility creation and issuance.                                   |
| TFS `POST /v1/facilities/{facilityId}/fixed-fees`                       | Create a fixed-fee/premium record.                                                     | Issued/activated facility creation and issuance.                                   |
| TFS `POST /v1/facilities/{facilityId}/loans/{loanId}/amendments/amount` | Amend the loan amount/exposure.                                                        | Facility amount amendments.                                                        |
| TFS `PUT /v1/facilities/{facilityId}?op={operation}`                    | Update the facility master; operation is `issue`, `amendAmount`, or `amendExpiryDate`. | Issuance and facility master amendments. Uses `If-Match` when an ETag is supplied. |
| TFS `PATCH /v1/facilities/{facilityId}/loans/{loanId}`                  | Update the facility loan record.                                                       | Cover-end-date amendments.                                                         |
| TFS `PATCH /v1/facilities/{facilityId}/covenants`                       | Update the facility covenant record.                                                   | Amendments when the covenant/guarantee feature flag is enabled.                    |
| TFS `PATCH /v1/facilities/{facilityId}/guarantees`                      | Update the facility guarantee record.                                                  | Amendments when the covenant/guarantee feature flag is enabled.                    |
| MDM `GET /v1/sector-industries?ukefIndustryId={industryId}`             | Map a UKEF industry ID to an ACBS industry ID.                                         | Every initial deal orchestration.                                                  |
| MDM `GET /v1/markets?search={country}`                                  | Map a country to an ACBS/ISO country code.                                             | GEF deal with a non-UK supplier country.                                           |
| MDM `GET /v1/currencies/{currencyCode}`                                 | Map an ISO currency to an ACBS currency code.                                          | Before creating a facility covenant.                                               |
| MDM `POST /v1/numbers`                                                  | Allocate a covenant identifier.                                                        | Before creating a facility covenant.                                               |

Industry and country lookups use default ACBS values when MDM returns no usable
result. The currency lookup also falls back to the configured default currency
code (`O`).

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
   records only when the status is exactly `Completed`:
   - `acbs-issue-facility`: updates the facility's ACBS stage and stores the
     returned master, loan, and fee records.
   - `acbs-amend-facility`: stores the returned master and loan amendment
     results under the orchestration instance ID on the facility.
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
- A newly started orchestration is recorded in `durable-functions-log` with
  status `Running`, its instance ID, status URLs, and the submitted deal
  context. The lifecycle section above describes how TFM updates this record
  and processes completed results.
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
