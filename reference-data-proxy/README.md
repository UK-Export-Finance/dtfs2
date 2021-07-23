# reference-data-proxy
 
This service integrates with many external APIs such as:
- Companies House
- Ordanance Survey
- Many UKEF APIs via Mulesoft

The service also hosts some reference data for countries, currencies and industry sectors. These need to be removed and obtained through Mulesoft API call.

This service initially started purely as a reference data api (i.e, no external API). Service should be renamed to external-apis.

## To execute api tests:

In one terminal, launch our dependencies:
```
docker-compose up --build
```
 
In a second terminal, execute our api tests:
```
npm run api-test
```
 
Test coverage will be generated.

