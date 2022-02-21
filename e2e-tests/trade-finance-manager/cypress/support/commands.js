// commands used to interact directly with TFM UI
Cypress.Commands.add('login', require('./ui/logIn'));

// commands used to interact directly with Deal API
// NOTE: this will eventually become TFM API, that calls Deal API.
// right now we only have TFM API that can find a deal, Portal API does the rest.
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('insertOneGefDeal', require('./portal-api/insertOneGefDeal'));
Cypress.Commands.add('insertManyGefDeals', require('./portal-api/insertManyGefDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));
Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));
Cypress.Commands.add('createGefFacilities', require('./portal-api/createGefFacility'));
Cypress.Commands.add('updateGefDeal', require('./portal-api/updateGefDeal'));

Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));
Cypress.Commands.add('deleteTfmDeals', require('./central-api/deleteTfmDeals'));

Cypress.Commands.add('updateTFMDeal', require('./central-api/updateTFMDeal'));

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));
Cypress.Commands.add('submitManyDeals', require('./trade-finance-manager-api/submitManyDeals'));
Cypress.Commands.add('getUser', require('./trade-finance-manager-api/getUser'));
