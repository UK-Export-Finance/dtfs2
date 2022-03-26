import 'cypress-file-upload';

// Lighthouse audit
import 'cypress-audit/commands';

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

// commands used to interact directly with portal-api
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));

Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('login', require('./portal/logIn'));
Cypress.Commands.add('tfmLogin', require('./trade-finance-manager-ui/login'));

Cypress.Commands.add('forceVisit', (url) => {
  cy.window().then((win) => win.open(url, '_self'));
});

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));
Cypress.Commands.add('submitManyDeals', require('./trade-finance-manager-api/submitManyDeals'));
