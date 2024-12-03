# portal-api 🏛️

The **portal-api** is a crucial component of the Portal UIs, serving both BSS and GEF.

- BSS endpoints are located in `/src/v1`.
- GEF endpoints are found in `/src/v1/gef`.

Additionally, it's responsible for sending deals to TFM (Trade Finance Manager) by making a call to a TFM endpoint upon deal submission.

## Prerequisite 🧩

Ensure you have an `.env` file configured. You can use `.env.sample` as a base. Some sensitive variables must be shared within the team.

## Running Locally 🏃‍♂️

```shell
npm run start
```

Alternatively, you can start all services from the root directory using `npm run start`.

## Testing 🧪

In a separate terminal, execute:

```shell
npm run api-test
```

This will generate test coverage.

### **Run a Single API Test**

To run a single API test, use:

```shell
npm run api-test "**/*/deals-party-db.api-test.js"
```

## The Current Shape of the API 📐

Initially, the API was developed for BSS, designed to work with the old BSS UI. The UI/UX was not fully understood until around two-thirds of the project was completed. Consequently, much of the API's structure was influenced by the UI, and data requirements were based on this.

Subsequently, the GEF API was created with a cleaner, simpler UI/UX. Lessons learned from the BSS project, especially in terms of business logic, resulted in a more streamlined GEF API.

There are further details about the differences between BSS and GEF in the portal/gef-ui READMEs.

## User login process 🔓

User login process can be found in the [Portal](../portal/README.md) microservice.

## Moving Forward - Aligning GEF and BSS 🚀

BSS and GEF are currently misaligned, with GEF being cleaner and BSS gradually becoming legacy. The vision is to utilize the GEF structure for a new, cleaner BSS.

Therefore, there should be minimal work for portal-api regarding BSS. Active development efforts are focused primarily on the GEF endpoints.

The long-term goal is to use the same GEF data structure in BSS, as these products share many similarities. Using the GEF UI, API, and data structure as a foundation for other products offers several advantages:

- Delivering a modern user experience.
- Maintaining consistency.
- Reducing data mapping complexities in other systems.

The team should collectively consider how BSS and GEF should align. Perhaps both BSS and GEF could share the same endpoints with flags to accommodate product-specific differences. Alternatively, they could remain separate but with a well-defined strategy for managing the commonalities.

Over time, the distinctions between this and the central API have become less clear. It's worth considering adopting GraphQL more extensively, potentially even transitioning to a full schema. This could eliminate the need for REST endpoints, except for essential services like health checks. If other APIs follow suit, exploring solutions like [Apollo Federation](https://www.apollographql.com/docs/federation/) may simplify the management of a diverse set of services.

Simplifying the GraphQL schema is also worth exploring. Options include making use of GraphQL files or modularizing the existing schema for better organization and maintainability. 🧩🚀

## Eligibility criteria ✔

In order to add a new version of a EC, following steps should be followed:

- Visit the `eligibilityCriteria` collection.
- Use the existing EC as a template and amend where necessary.
- Create a new version of the EC criterions by incrementing the version number by `0.1`. If current version is at `2.1` then please ensure the updated version must be `2.2`.
- Update the `createdAt` property.
- Add the EC object to GEF-UI model `gef-ui/server/models/application.js`.
- Insert the updated EC version to the abovementioned collection.
- Ensure mock-data, E2E fixures and api-tests are also reflected with the latest EC.
- Ensure new criterion is also added to `TFM` content-string file for consistency.

---
