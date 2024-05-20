# DTFS Central API 📦️

**dtfs-central-api** is responsible for handling submissions and managing data between different APIs. It acts as an intermediary, facilitating communication between various systems.

## Why

- **Avoid Direct API Calls:** It prevents one API from directly calling another API, promoting a more organized and scalable architecture.

- **Data Passing:** Serves as a middleman for passing data (deals and facilities) from one system to another.

- **Centralized CRUD Operations:** Provides a single point to perform CRUD operations for deals and facilities with minimal business logic.

- **Data Snapshots:** Creates snapshots of submitted data that should not be edited by another API/system.

## High-Level Overview

There are currently three systems, each with its own UI, API, and database collections:

1. **Portal (BSS/EWCS):** Deals and facilities related to Bond Support Scheme and Export Working Capital Scheme.

2. **GEF (General Export Facility):** Deals and Cash Contingent facilities.

3. **TFM (Trade Finance Manager):** UKEF's internal system that consumes all deals and facilities.

When a BSS or GEF deal is completed, the bank submits it to UKEF, effectively passing the deal and any associated facilities to TFM (Trade Finance Manager). TFM consumes and renders the submitted data for UKEF's review, ensuring the deal's progress.

:warning: **TFM should never edit any deal or facility data**; its primary role is to consume the submitted data for user review.

## When/Where is Central API Called?

1. **Portal (BSS):** Central API is called whenever Portal (BSS) performs any CRUD operation for a deal or facility.

2. **TFM:** TFM receives a deal and calls the Central API multiple times to:

   - Fetch the deal from the Portal (BSS) MongoDB collection (`deals`).
   - Create a snapshot of the deal and add it to the TFM MongoDB deals collection (`tfm-deals`).
   - Fetch all facilities associated with the deal from the Portal (BSS) MongoDB collection (`facilities`).
   - Create a snapshot for each facility and add it to the TFM MongoDB facilities collection (`tfm-facilities`).
   - Update the Portal (BSS) status of the deal from "Submitted" to "Acknowledged" (`deals`).

   Note: In case a deal is submitted to TFM for a second time, TFM updates the TFM snapshots rather than creating them again.

## Deal and Facility Snapshots

:warning: **TFM should never edit any deal or facility data.** Therefore, TFM should only copy and consume the data in a "locked down" state, which is why TFM calls the Central API to create snapshots.

Consider a deal submitted with this data:

```javascript
{
  submissionType: 'Automatic Inclusion Notice',
  dealType: 'BSS/EWCS',
}
```

The Central API creates the following structure, including a default TFM object:

```javascript
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

This structure is then added to the `tfm-deals` MongoDB collection.

With this setup, the `tfm` object becomes the only part that TFM can update; it contains data specific to TFM and isn't relevant in any other systems. The snapshots are locked down in the Central API to prevent updates by TFM.

Facilities have a similar structure, but they are stored in the `tfm-facilities` MongoDB collection. The data looks like this:

```javascript
{
  facilitySnapshot: {
    value: 1234,
    coverPercentage: 20,
  },
  tfm: {},
}
```

## Prerequisite

Make sure you have an `.env` file. Use `.env.sample` as a base. Some sensitive variables need to be shared with the team.

## Running Locally

```shell
npm run start
```

Alternatively, you can start every service from the root directory with `npm run start`.

## Testing

In a second terminal, run:

```shell
npm run api-test
```

This will generate test coverage.

### **Running a Single API Test**

You can run a specific API test file using the following command:

```shell
npm run api-test "**/*/deals-party-db.api-test.js"
```

## Moving Forwards

Currently, BSS (portal-api) uses the Central API for deal and facility CRUD operations, while GEF (gef endpoints in portal-api) does not.

Two potential approaches can align both products:

- Update GEF API to use the Central API for deal and facility CRUD operations.
- Remove all deal and facility CRUD operations from the Central API and handle them inside BSS (portal-api).

It's essential to note that BSS and GEF are currently misaligned. Eventually, GEF and BSS will be aligned to use the same design and approach (refer to portal and gef-ui READMEs). When this alignment occurs, the deal and facility CRUD operations in the Central API, which are currently consumed only by BSS (Portal), may become redundant and can be deleted.

This decision should be made collaboratively as a team, considering the best, most scalable approach.

---
