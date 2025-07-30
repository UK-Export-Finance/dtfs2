# AZURE-FUNCTIONS MICRO-SERVICE 📦️

This service contains background tasks that are kicked off during deal
submission to UKEF/TFM.

## Endpoints 🌐

### 1. APIM

APIM provides various crucial endpoints across varied services (MDM, TFS and
ESTORE). Azure functions consumes `currencies`, `sector-industries` and
`market` endpoint

#### 1. MDM

Master data management endpoints are responsible for providing wide variety of
imperative data. They range from `/currencies` to `/interest-rates`, EXTERNAL
`.env` requires following three variables to be fulfilled before any
consumption.

```shell
APIM_MDM_URL=
APIM_MDM_KEY=
APIM_MDM_VALUE=
```

Please note `APIM_MDM_KEY` is the header name, whereas `APIM_MDM_VALUE` is the
authentication code, since `value` is applied to a `key`.

```javascript
headers: {
  APIM_MDM_KEY: APIM_MDM_VALUE;
}
```

## Why

Some external APIM APIs can take a long time complete, for example ACBS has
over 10 API calls. Some endpoints can fail and need retrying.

By running these as background tasks, we take the load off of deal submission
calls. Also allows us to retry and endpoints that fail (service could be down
or having performance issues for example).

## Running locally

1. Run everything as normal (`npm run start` from the root directory)
2. In a separate terminal tab, go to azure-functions directory and run
   `npm run start`

Ideally, `azure-functions` would be run in the same root docker, but this
caused memory issues in github actions. Number Generator Function is now run in
root `docker-compose.yml`.

## Integrated APIs

- `ACBS`: UKEF system we need to send data to.

## Moving forwards

On submission to UKEF/TFM, there are a lot of calls to external APIM APIs.
This eats up submission time and therefore causes some e2e tests to take a long
time. It can also cause problems - for example if an API call fails and we
don't get the required data, submission can fail. Some API calls rely on data
from other APIs. Therefore, every API called on submission should be moved to
azure-functions and run as a background task. The vision:

- If any calls fail, keep retrying until successful
- Block any calls that rely on previous API calls until the previous API call is
  successful
- The end user (and our e2e tests) will have a very quick submission process.
  This is not the case in BSS in particular
- In TFM, we can have a "pending deals" table. Showing which deals are pending
  API calls, and which API calls are causing issues
