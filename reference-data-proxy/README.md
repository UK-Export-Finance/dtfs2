# REFERENCE-DATA-PROXY MICRO-SERVICE 📦️
RDP is predominately responsible for external API consumption and communication.
## Endpoints 🌐
### 1. APIM
APIM provides various crucial endpoints across varied services (MDM, TFS and ESTORE).
RDP has an high exposure to MDM endpoints.
#### 1. MDM
Master data management endpoints are responsible for providing wide variety of imperative data.
They range from `/currencies` to `/interest-rates`, RDP `.env` requires following three variables
to be fulfilled before any consumption.

```
APIM_MDM_URL=
APIM_MDM_KEY=
APIM_MDM_VALUE=
```
### 2. Companies house
CS entity fetch
### 3. OS
Places API
The service also hosts some reference data for countries, currencies and industry sectors. These need to be removed and obtained through Mulesoft API calls.
This service initially started purely as a reference data api (i.e, no external API calls). Service should be renamed to external-apis.

## Why
Separation of concerns and reusability.
By having external API calls in it's own service, and external endpoint can be used from anywhere in the same way. It also allows us to gracefully wrap or map requests, responses and errors etc.

## Prerequisite
Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.


## Testing
```shell
npm run api-test
```

Test coverage will be generated.

### **Run a single API test**
```shell
npm run api-test-file "**/*/deals-party-db.api-test.js"
```
