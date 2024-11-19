import './click-events';
import './trade-finance-manager-api';
import './ui';

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./utils/saveSession'));

Cypress.Commands.add('keyboardInput', require('./utils/keyboardInput'));

// Assert an element has some exact text
Cypress.Commands.add('assertText', require('./utils/assertText'));

Cypress.Commands.add('getInputByLabelText', require('./utils/getInputByLabelText'));

Cypress.Commands.add('completeDateFormFields', require('./trade-finance-manager-ui/completeDateFormFields'));

// commands used to interact directly with Deal API
// NOTE: this will eventually become TFM API, that calls Deal API.
// right now we only have TFM API that can find a deal, Portal API does the rest.
Cypress.Commands.add('overridePortalUserSignInTokenWithValidTokenByUsername', require('./portal-api/overridePortalUserSignInTokenWithValidTokenByUsername'));
Cypress.Commands.add('getUserByUsername', require('./portal-api/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./portal-api/resetPortalUserStatusAndNumberOfSignInLinks'));

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

Cypress.Commands.add('submitDealCancellation', require('./trade-finance-manager-ui/submit-deal-cancellation'));
