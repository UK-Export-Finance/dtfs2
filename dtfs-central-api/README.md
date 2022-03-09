# dtfs-central-api

Central endpoints to handle submissions, getting and updating data from one API to another API.

## Why

- Avoid one API calling another API directly
- Act as a "middleman" to pass data (deals and facilities) from one system to another
- Have a single place to perform CRUD operations for deals and facilities with minimal business logic
- Create snapshots of submitted data that should not be edited from another API/system

## High level overview of the flow between systems

There are currently 3 systems - each system has it's own UI, API and database collections:

- Portal (BSS/EWCS deals and facilities)
- GEF (GEF deals, Cash Contingent facilities)
- TFM (Internal UKEF system that consumes all deals and facilities)

Once a BSS or GEF deal is completed, the bank will submit to UKEF - technically meaning - submitting the deal and any associated facilities, to TFM (Trade Finance Manager).

At this point, TFM _consumes and renders_ the deal and facilities so that UKEF can review and proceed with any actions to finalise the deal.

:warning: TFM *should never* edit any deal or facility data - it purely consumes the submitted data for user review.

## When/Where is Central API called?

1) When Portal (BSS) performs any CRUD operation for a deal or facility

2) When TFM receives a deal

When a bank submits the deal to UKEF (from Portal/BSS), Portal calls the TFM API (submit endpoint). TFM then receives a deal and it calls the Central API several times to do the following:

- Fetch the deal from the Portal (BSS) MongoDB collection (`deals`)
- Create a snapshot of the deal and add to the TFM MongoDB deals collection (`tfm-deals`)
- Fetch all facilities associated with the deal from the Portal (BSS) MongoDB collection (`facilities`)
- Create a snapshot for each facility and add to the TFM MongoDB facilities collection (`tfm-facilities`)
- Update the Portal (BSS) status of the deal from "Submitted" to "Acknowledged" (`deals`)

Note: There is the scenario where a deal can be submitted to TFM for a second time. In this case, the TFM snapshots are updated rather than created again.

## Deal and facility snapshots

:warning: TFM *should never* edit any deal or facility data - it purely consumes the submitted data for user review.

Therefore, TFM should only copy and consume the data in a "locked down" state - this is why TFM calls central API to create snapshots.

Imagine a deal that is submitted:

```js
{
  submissionType: 'Automatic Inclusion Notice',
  dealType: 'BSS/EWCS',
}
```

In one Central API endpoint, it will create the following structure with an additional default TFM object:

```js
{
  dealSnapshot: {
    submissionType: 'Automatic Inclusion Notice',
    dealType: 'BSS/EWCS',
  },
  tfm: {
    dateReceived: '20-12-2021',
  },
}
```

This is then added to `tfm-deals` MongoDB collection.

With this structure in place, the `tfm` object becomes the only object that TFM can update - it is data specific to TFM and is not relevant in any other systems.

The snapshot is also locked down in the Central API so it cannot be updated by TFM.

Facilities have exactly the same setup - except it goes to the `tfm-facilities` MongoDB collection and the data looks like this:

```js
{
  facilitySnapshot: {
    value: 1234,
    coverPercentage: 20,
  },
  tfm: {},
}
```

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

```shell
docker-compose up
```

Alternatively, every service can be started from the root directory (`docker-compose up`).

## Testing

In a second terminal, run:

```shell
npm run api-test
```

Test coverage will be generated.

### **Run a single API test**

```shell
npm run api-test-file "**/*/deals-party-db.api-test.js"
```

## Moving forwards

Currently, BSS (portal-api) uses the Central API for deal and facility CRUD operations. GEF (gef endpoints in portal-api) does not do this.

There are 2 potential approaches from here to make both products consistent:

1) Update GEF API to use central API for deal and facility CRUD operations
2) Remove all deal and facility CRUD operations from Central API; do inside of BSS (portal-api).

However it's important to note that currently, BSS and GEF are misaligned. Eventually, GEF and BSS will be aligned to use the same design and approach (see portal and gef-ui READMEs). When this happens, the deal and facility CRUD operations in Central API - that are currently consumed only by BSS (Portal), may become redundant. In which case they can just be deleted.

This has not been thought about as a team. What's the best, most scalable approach?

Just to be clear - Both BSS and GEF submit to TFM directly. The TFM submission handling works the same for both product types (i.e TFM always calls Central API to create snapshots).
