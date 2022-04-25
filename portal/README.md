# portal

UI for BSS/EWCS (Bond Support Scheme, Export Working Capital Scheme). Uses the portal-api to send and receive data. Also handles login.

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

1. `docker-compose up`
2. Visit http://localhost:5000 in your browser

Alternatively, every service can be started from the root directory (`docker-compose up`).

## Login credentials

See mock users: utils/mock-data-loader/portal/users.js

## Testing

### **Run a UI test suite**

```shell
npm run test
```

### **Run a single UI test**

```shell
npm run test /path/to/file.test.js
```

### **Run UI component tests**

```shell
npm run component-test
```

### **Run a single UI component tests**

```shell
npm run component-test ./component-tests/path/to/file.component-test.js
```

### **End to end tests**

See e2e-tests README.md.

## Basic happy flow behind the scenes

1. User logs into Portal UI
2. User selects which product to apply for: BSS or GEF
3. Depending on the chosen product, the BSS or GEF UI will be served
4. User completes the deal/application and submits to the bank
5. Bank approves the deal and submits to UKEF. The deal is sent to Trade Finance Manager (TFM)

## Moving forwards - aligning Portal, BSS and GEF

### Design

Portal (also known as BSS/EWCS) was the first product and UI.

Portal/BSS currently has an old design - the initial approach was to shift the old design/technology into a JavaScript application.

The vision is that once GEF is completed (with a new design), GEF can be reused in BSS; Bringing both products into a consistent, modern design.

### Data

The current BSS data structure is not great - this is due to the old design and lack of initial understanding.

The vision is to use the same GEF data structure in BSS.

### Summary

BSS and GEF products are very similar, but they currently have different designs and approaches.

Portal/BSS should be shifted to use the GEF UI, API and data structure in order to:

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

# DTFS
Trigger 123 123