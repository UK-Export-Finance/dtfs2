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
  allDeals,
  aDealInStatus,
  clearCache,
  dealsCreatedBy,
  dealsAssociatedWithBank,
  dealsInStatus,
  dealsBySubmissionType,
  clearDeals,
} = require('./deal-api/cache');

const {downloadFile} = require('./deal-api/fileshare');

// commands used to maintain a cache of 'deals we have loaded as part of our tests'
Cypress.Commands.add("cacheDeals", cacheDeals);
Cypress.Commands.add("clearDeals", clearDeals);


// commands used to interact directly with deal-api
Cypress.Commands.add("insertOneDeal", require('./deal-api/insertOneDeal'));
Cypress.Commands.add("insertManyDeals", require('./deal-api/insertManyDeals'));
Cypress.Commands.add("deleteDeals", require('./deal-api/deleteDeals'));
Cypress.Commands.add("downloadFile", downloadFile);


// commands used to get hold of loaded test-data'
Cypress.Commands.add("allDeals", allDeals);
Cypress.Commands.add("aDealInStatus", aDealInStatus);
Cypress.Commands.add("dealsInStatus", dealsInStatus);
Cypress.Commands.add("dealsCreatedBy", dealsCreatedBy);
Cypress.Commands.add("dealsAssociatedWithBank", dealsAssociatedWithBank);
Cypress.Commands.add("dealsBySubmissionType", dealsBySubmissionType);


// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add("addBondToDeal", require('./portal/addBondToDeal'));
Cypress.Commands.add("createADeal", require('./portal/createADeal'));
Cypress.Commands.add("createNewSubmission", require('./portal/createNewSubmission'));
Cypress.Commands.add("login", require('./portal/login'));
Cypress.Commands.add("loginGoToDealPage", require('./portal/loginGoToDealPage'));
Cypress.Commands.add("passRedLine", require('./portal/passRedLine'));
Cypress.Commands.add("renameDeal", require('./portal/renameDeal'));
