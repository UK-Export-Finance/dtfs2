# Trade Finance Manager API (TFM API) :gear:

TFM API, also known as Trade Finance Manager API, plays a pivotal role in handling deal submissions to UKEF (UK Export Finance). TFM-API is interacted with using REST endpoints. In TFM, a deal is an integral part of a 'case,' which encompasses the deal, facilities, and other TFM-specific components. This documentation provides an in-depth understanding of the Trade Finance Manager API (TFM API), its functionalities, data structure, and future considerations for handling different product types and data.

## Prerequisite :key:

Before running the TFM API, make sure to have an `.env` file configured. You can use `.env.sample` as a base. Some sensitive variables may need to be shared among the team.

## Running Locally :computer:

To run the TFM API locally, use the following command:

```shell
npm run start
```

Alternatively, you can start all services from the project's root directory by running `npm run start`.

## Testing :test_tube:

To run API tests and generate test coverage, open a second terminal and execute:

```shell
npm run api-test
```

### Run a Single API Test :heavy_check_mark:

To run a specific API test, use the following command (replace the path accordingly):

```shell
npm run api-test "**/*/deals-party-db.api-test.js"
```

## Functionality :gear:

The TFM API is responsible for several crucial tasks when a deal is submitted to UKEF:

1. Accept submitted deals.
2. Trigger a status update for the Portal (e.g., from 'Submitted' to 'Acknowledged').
3. Call external UKEF APIs to populate more data (e.g., currency conversions).
4. Allow TFM users to complete necessary updates to the deal (triggered by TFM UI).

:warning: In TFM, a deal is referred to as a 'Case', which includes one deal with facilities and tasks for users to complete in order to process the case.

## Deal Submission Workflow :briefcase:

When a deal is sent to TFM, the following steps are taken:

1. Retrieve the deal from the database by deal ID.
2. Create a snapshot of the deal and facilities.
3. Add the snapshots to TFM collections.
4. Map all fields into a generic format.
5. Update the deal status in Portal to 'Acknowledged' or 'In progress.'
6. Make calls to external UKEF APIs and add all data to the `tfm` object in the deal and facilities.
7. Generate a list of tasks for the deal.
8. Send emails for acknowledgment and notifying users that 'tasks are ready to start.'

All of this starts from the deal submission controller: `/src/v1/controllers/deal.submit.controller.js`.

## Documentation :book:

This README serves as a primary source for understanding the TFM API's functionality. The API offers two endpoints: deal submission and get user.

Swagger documentation can be found at the following URL: `/v1/api-docs`.

## Snapshots and Data Structure :file_folder:

When a deal is sent to TFM, its structure initially looks like this (a simplified example):

```js
{
  _id: '61f7a71ccf809301e78fbea3',
  submissionType: 'Automatic Inclusion Notice',
  // ...
}
```

When TFM creates a snapshot (and adds it to the TFM collections) for its own consumption, the deal structure becomes:

```js
{
  _id: '61f7a71ccf809301e78fbea3',
  dealSnapshot: {
    _id: '61f7a71ccf809301e78fbea3',
    submissionType: 'Automatic Inclusion Notice',
    // ...
  },
  tfm: {
    dateReceived: '20-12-2021',
    // ...
  },
}
```

:warning: **The snapshot should not be changed by TFM.** TFM updates are stored in the `tfm` object.

This is the same for facilities, with the exception that 'dealSnapshot' is replaced with 'facilitySnapshot'.

## Mapping Different Product Types and Data :earth_americas:

TFM handles two types of deals and four types of facilities:

- BSS and EWCS (bond and loan facilities for a BSS deal).
- Cash and Contingent (facilities for a GEF deal).

At the time of writing, BSS has a different structure compared to GEF. GEF data is more straightforward.

In the future, BSS will be redesigned to align with the GEF data structure, creating a shared, generic structure. TFM will then be refactored to query and render data based on this generic structure, rather than the BSS structure. The submission mapping is a step towards this alignment.

---
