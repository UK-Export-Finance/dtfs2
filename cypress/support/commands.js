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

const { downloadFile } = require('./portal-api/fileshare');

// commands used to interact directly with portal-api
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('updateDeal', require('./portal-api/updateDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));

Cypress.Commands.add('downloadFile', downloadFile);
Cypress.Commands.add('removeUserIfPresent', require('./portal-api/removeUserIfPresent'));
Cypress.Commands.add('updateBond', require('./portal-api/updateBond'));
Cypress.Commands.add('updateLoan', require('./portal-api/updateLoan'));

// commands used to interact with the test hooks - ie. endpoints that only exist during pipeline execution.
Cypress.Commands.add('sendTypeB', require('./test-hooks-api/sendTypeB'));

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('addBondToDeal', require('./portal/addBondToDeal'));
Cypress.Commands.add('addLoanToDeal', require('./portal/addLoanToDeal'));
Cypress.Commands.add('createADeal', require('./portal/createADeal'));
Cypress.Commands.add('createNewSubmission', require('./portal/createNewSubmission'));
Cypress.Commands.add('login', require('./portal/logIn'));
Cypress.Commands.add('loginGoToDealPage', require('./portal/loginGoToDealPage'));
Cypress.Commands.add('passRedLine', require('./portal/passRedLine'));
Cypress.Commands.add('renameDeal', require('./portal/renameDeal'));
