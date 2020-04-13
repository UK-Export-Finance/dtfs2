// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const {
  cacheDeals,
  uncacheDeals,
  aDealInStatus,
  clearCache,
  dealsCreatedBy,
  dealsAssociatedWithBank,
  dealsInStatus,
  dealsBySubmissionType,
  clearDeals,
} = require('./deal-api/cache');

Cypress.Commands.add("cacheDeals", cacheDeals);
Cypress.Commands.add("clearCache", cacheDeals);
Cypress.Commands.add("uncacheDeals", uncacheDeals);
Cypress.Commands.add("aDealInStatus", aDealInStatus);
Cypress.Commands.add("dealsInStatus", dealsInStatus);
Cypress.Commands.add("dealsCreatedBy", dealsCreatedBy);
Cypress.Commands.add("dealsAssociatedWithBank", dealsAssociatedWithBank);
Cypress.Commands.add("dealsBySubmissionType", dealsBySubmissionType);
Cypress.Commands.add("clearDeals", clearDeals);


Cypress.Commands.add("loginViaAPI", require('./deal-api/loginViaAPI'));
Cypress.Commands.add("createADeal", require('./deal-api/createADeal'));
Cypress.Commands.add("createManyDeals", require('./deal-api/createManyDeals'));
Cypress.Commands.add("deleteAllDeals", require('./deal-api/deleteAllDeals'));
