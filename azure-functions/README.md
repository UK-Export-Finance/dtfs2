# azure-functions

This service contains background tasks that are kicked off during deal submission to UKEF/TFM.

## Why

Some external Mulesoft APIs can take a long time complete, for example ACBS has over 10 API calls. Some endpoints can fail and need retrying.

By running these as background tasks, we take the load off of deal submission calls. Also allows us to retry and endpoints that fail (service could be down or having performance issues for example).

## Running locally

1. Run everything as normal (`docker-compose up` from the root directory)
2. In a seperate terminal tab, go to azure-functions directory and run `docker-compose up`

Ideally, azure-functions would be run in the same root docker, but this caused memory issues in github actions.

Number Generator Function is now run in root `docker-compose.yml`.

## Integrated APIs

| API              | Why                                        | Additional info                                      |
| ---------------- | ------------------------------------------ | ---------------------------------------------------- |
| ACBS             | UKEF system we need to send data to        | -                                                    |
| Number Generator | Generates UKEF IDs required for other APIs | Also uses an ACBS function to 'double check' the IDs |

## Moving forwards

On submission to UKEF/TFM, there are _alot_ of calls to external Mulesoft APIs. This eats up submission time and therefore causes some e2e tests to take a long time.

It can also cause problems - for example if an API call fails and we don't get the required data, submission can fail. Some API calls rely on data from other APIs.

Therefore, every API called on submission should be moved to azure-functions and run as a background task. The vision:

- If any calls fail, keep retrying until successful
- Block any calls that rely on previous API calls until the previous API call is successful
- The end user (and our e2e tests) will have a very quick submission process. This is not the case in BSS in particular
- In TFM, we can have a "pending deals" table. Showing which deals are pending API calls, and which API calls are causing issues