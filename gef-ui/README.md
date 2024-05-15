# GEF-UI 🌐

The **GEF-UI** is the user interface for the General Export Facility (GEF) product. It interacts with the `/gef` endpoints in the `portal-api` to send and receive data.

## Prerequisite 🛠️

Before running the GEF-UI locally, make sure you have an `.env` file. You can use the `.env.sample` as a base. Some sensitive variables may need to be shared within the team.

## Running locally 🏃

To run the GEF-UI locally, follow these steps:

1. Execute `npm run start`.
2. Visit http://localhost in your web browser.

Note that no port number is specified in the URL due to the reverse proxy.

Alternatively, you can start all services from the root directory using `npm run start`.

## Login credentials 🔑

For testing purposes, you can find mock user credentials in the `utils/mock-data-loader/portal/users.js` file.

## Testing 🧪

### **Run a UI test suite**

Verbose with coverage:

```shell
npm run unit-test
```

### **Run a single UI test**

```shell
npm run unit-test ./path/to/file.test.js
```

### **Run API tests**

```shell
npm run api-test
```

### **End to end tests**

Detailed information about running end-to-end tests can be found in the `e2e-tests` README.md.

## Basic Workflow 🔄

Behind the scenes, the basic workflow for the GEF-UI is as follows:

1. A user logs into the Portal UI.
2. The user selects whether to apply for the Bond Support Scheme (BSS) or the General Export Facility (GEF).
3. Depending on the chosen product, either the BSS or GEF UI is served.
4. The user completes the deal/application and submits it to the bank.
5. The bank approves the deal and submits it to UKEF. The deal is then sent to Trade Finance Manager (TFM).

## Moving Forward - Aligning GEF and BSS 🚀

### Design 🎨

Before the development of GEF, the only product and UI available was BSS. While the GEF and BSS products have similar functionalities, their designs are quite different. GEF boasts a more modern design compared to the older design of the BSS UI.

The vision is that once GEF is completed, its design can be reused in BSS. This would help bring both products in line with a consistent and modern design.

### Data 📊

While GEF and BSS have similar functionalities in terms of what is submitted, their data structures differ significantly. GEF has a simpler and more streamlined data structure, while BSS has a more complex structure. The complexity of the BSS data structure is partly due to the older design and initial lack of understanding.

The vision is to unify the data structure and use the same structure as GEF in BSS. This would not only simplify data handling but also reduce the need for extensive data mapping in other systems.

### Summary 📝

To summarize, the GEF UI, API, and data structure should be leveraged for other products to achieve the following goals:

- Provide a modern and consistent user experience.
- Ensure consistency between products.
- Reduce the complexity of data mapping in other systems.

Additionally, it may be beneficial to separate BSS from the Portal, where the Portal's sole purpose would be to handle user login and product selection. This would result in the following simplified flow:

1. User logs in (/portal).
2. User selects either BSS or GEF (/portal).
3. Product-specific pages are served (/bss-ui or /gef-ui).

---
