# reference-data-proxy

This service integrates with many external APIs such as:

- Companies House
- Ordanance Survey
- Many UKEF APIs via Mulesoft

The service also hosts some reference data for countries, currencies and industry sectors. These need to be removed and obtained through Mulesoft API calls.

This service initially started purely as a reference data api (i.e, no external API calls). Service should be renamed to external-apis.

## Why

Seperation of concerns and reusability. By having external API calls in it's own service, and external endpoint can be used from anywhere in the same way. It also allows us to gracefully wrap or map requests, responses and errors etc.

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

```shell
docker-compose up
```

If the service hasn't been run before, you'll need to run `docker-compose up --build`.

Alternatively, every service can be started from the root directory (`docker-compose up`).

## Testing

In a second terminal, simply run:

```shell
npm run api-test
```

Test coverage will be generated.

### **Run a single API test**

```shell
npm run api-test-file "**/*/deals-party-db.api-test.js"
```

# DTFS
