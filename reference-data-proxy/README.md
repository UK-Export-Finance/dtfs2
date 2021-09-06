# reference-data-proxy

This service integrates with many external APIs such as:

- Companies House
- Ordanance Survey
- Many UKEF APIs via Mulesoft

The service also hosts some reference data for countries, currencies and industry sectors. These need to be removed and obtained through Mulesoft API calls.

This service initially started purely as a reference data api (i.e, no external API). Service should be renamed to external-apis.

## Running locally

```shell
docker-compose up
```

If the service hasn't been run before, you'll need to run `docker-compose up --build`.

Make sure that you have all the necessary environment variables - more on this in the main README.

## Testing

In a second terminal, simply run:

```shell
npm run api-test
```

Test coverage will be generated.

## Linting

```shell
npm run lint
```
