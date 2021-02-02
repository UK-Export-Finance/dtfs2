// commands used to interact directly with TFM UI
Cypress.Commands.add('login', require('./ui/logIn'));


// commands used to interact directly with Deal API
// NOTE: this will eventually become TFM API, that calls Deal API.
// right now we only have TFM API that can find a deal, Portal API does the rest.
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));

Cypress.Commands.add('createFacility', require('./central-api/createFacility'));
Cypress.Commands.add('updateFacility', require('./central-api/updateFacility'));
Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));
