# portal-api

This API is used for the Portal UIs - BSS and GEF.

- BSS endpoints are in /src/v1
- GEF endpoints are in /src/v1/gef

It is also responsible for sending a deal to TFM (Trade Finance Manager). It simply calls a TFM endpoint on deal submission.

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

## The current shape of the API

BSS was the first API developed. It was built to work for the (current), old BSS UI design. The UI/UX of the product was not fully understood until the project was roughly two thirds completed.

Because of this, and the confusing UI/UX, a lot of the UI dictated how the API should work and what data needs to be stored.

Further down the line, GEF was built with a new, clean, simpler UI/UX. This, coupled with the lessons we learnt from BSS (in terms of business logic), resulted in a much cleaner GEF API.

There is additional information about the BSS/GEF differences in the portal/gef-ui READMEs.

## Moving forwards - aligning GEF and BSS

BSS and GEF are now misaligned - GEF is cleaner, BSS is effectively becoming legacy. The vision is to use GEF for a new, cleaner BSS.

Therefore there should be no work for portal-api for BSS. Only the GEF endpoints are actively being worked on.

The vision is to use the same GEF data structure in BSS. They are very similar products with some differences.

The GEF UI, API and data structure should be used for other products in order to:

- Deliver a nice, modern user experience
- Be consistent
- Reduce data mapping needs in other systems

This has not been thought about as a team. Maybe BSS and GEF could use exactly the same endpoints, but have some flags for any product differences? Maybe they should be seperated? What's the best, most scalable approach?

Over time the differences between this and central API have become murkier. It is worth considering 

If the team like working with GraphQL, it is worth embracing it and planning to move to a complete schema, this eliminating the need for REST endpoints except for things like healthcheck etc. With other APIs doing the same, it is worth investigating [Apollo Federation](https://www.apollographql.com/docs/federation/) to simplify working with a range of services.

There is area for the GraphQL Schema to be simplified. Possible options are making use of GraphQL files, or by modularising the Schema currently in use.