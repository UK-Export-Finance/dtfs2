# gef-ui

UI for GEF (General Export Facility). Uses the /gef endpoints in portal-api to send and receive data.

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

1. `docker-compose up`
2. Visit http://localhost in your browser

Note: no port number is used due to reverse-proxy.

Alternatively, every service can be started from the root directory (`docker-compose up`).

## Login credentials

See mock users: utils/mock-data-loader/portal/users.js

## Testing

### **Run a UI test suite**

```shell
npm run test
```

### **Run a single UI test **

```shell
npm run test /path/to/file.test.js
```

### **End to end tests**

See e2e-tests README.md.

## Basic happy flow behind the scenes

1. User logs into Portal UI
2. User selects which product to apply for: BSS or GEF
3. Depending on the chosen product, the BSS or GEF UI will be served
4. User completes the deal/application and submits to the bank
5. Bank approves the deal and submits to UKEF. The deal is sent to Trade Finance Manager (TFM)

## Moving forwards - aligning GEF and BSS

### Design

Before GEF was started, we only had the BSS product and UI.

The GEF and BSS products are very similar, but the designs are very different. GEF has a new, better design - whereas BSS UI has an old design.

The vision is that once GEF is completed, GEF can be reused in BSS; Bringing both products into a consistent, modern design.

### Data

Whilst GEF and BSS are very similar in terms of functionality and what is submitted, the data structures are very different.

GEF has a nice, simpler data structure; BSS is a more complicated. The current BSS data structure is due to the old design and lack of initial understanding.

The vision is to use the same GEF data structure in BSS.

### Summary

The GEF UI, API and data structure should be used for other products in order to:

- Deliver a nice, modern user experience
- Be consistent
- Reduce data mapping needs in other systems

This could also help the directory structure which can be confusing.

Currently for BSS:

1. User login (/portal)
2. Select product BSS (/portal)
3. Product pages served (/portal)

Currently for GEF:

1. User login (/portal)
2. Select product GEF (/portal)
3. Product pages served (/gef-ui)

BSS could be seperated from Portal and the Portal UI's only purpose is to login and select a product. I.e:

1. User login (/portal)
2. Select product BSS or GEF (/portal)
3. Product pages served (/bss-ui or /gef-ui)

