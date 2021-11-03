import 'cypress-file-upload';

// Lighthouse audit
import 'cypress-audit/commands';

// commands used to interact directly with portal-api
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));

Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));
Cypress.Commands.add('deleteTfmDeals', require('./central-api/deleteTfmDeals'));

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('login', require('./portal/logIn'));

Cypress.Commands.add('forceVisit', (url) => {
  cy.window().then((win) => win.open(url, '_self'));
});

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));
Cypress.Commands.add('submitManyDeals', require('./trade-finance-manager-api/submitManyDeals'));
