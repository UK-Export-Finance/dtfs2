# dtfs-submissions-data

:warning: This service is out of date

When a docker-compose is run that causes us to start an API/database service (Central API, Portal API, Trade Finance Manager API), MongoDB configuration will be governed by files in this service.

This service currently only serves one purpose - to insert an initial count of deals and facilities in a collection called `idCounters`, starting at 1000000.

## Why

At the start of the project, the requirement was to submit deals to another system called Workflow.

Workflow required deal and facility IDs to have at least 7 numerical digits, e.g `1234567`. It cannot handle the standard 12-byte ObjectId from MongoDB (which also contains letters). E.g `507f1f77bcf86cd799439011`.

Therefore, we had to adhere to the Workflow ID format.

## This service is out of date

The 7 numerical digits ID format should be retired as we no longer integrate with Workflow (instead we submit to our own service, Trade Finance Manager).

## Moving forwards

We currently have 2 different services/APIs that generate and submit new deals - BSS and GEF.

- BSS (portal-api) generates a new id by checking the latest value in the `idCounters` collection.
- GEF (separate endpoints in portal-api), generates a standard MongoDB ObjectId

- BSS and GEF share the same collection for deals, called `deals`.
- BSS and GEF share the same collection for facilities, called `facilities`.

BSS should be changed to generate a standard ObjectId. However, if this change is made, there could be a possibility of both BSS and GEF generating the same ID.

The goal should be for both BSS and GEF to use the same collections (`deals` and `facilities`) with standard ObjectId generation.

Once this has been done, this service can be retired.
