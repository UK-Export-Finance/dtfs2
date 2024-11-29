import 'cypress-file-upload';
import './click-events';
import { submitDealCancellation } from './trade-finance-manager-ui/submit-deal-cancellation';
import { makerSubmitGefDealForReview } from './portal/makerSubmitGefDealForReview';
import { checkerSubmitGefDealToUkef } from './portal/checkerSubmitGefDealToUkef';

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./utils/saveSession'));

Cypress.Commands.add('keyboardInput', require('./utils/keyboardInput'));

// Assert an element has some exact text
Cypress.Commands.add('assertText', require('./utils/assertText'));

// commands used to interact directly with portal-api
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('insertManyGefDeals', require('./portal-api/insertManyGefDeals'));
Cypress.Commands.add('insertOneGefDeal', require('./portal-api/insertOneGefDeal'));

Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));

Cypress.Commands.add('createGefFacilities', require('./portal-api/createGefFacilities'));
Cypress.Commands.add('updateGefDeal', require('./portal-api/updateGefDeal'));
// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('login', require('./portal/logIn'));
Cypress.Commands.add('tfmLogin', require('./trade-finance-manager-ui/login'));
Cypress.Commands.add('overridePortalUserSignInTokenWithValidTokenByUsername', require('./portal/overridePortalUserSignInTokenWithValidTokenByUsername'));
Cypress.Commands.add('getUserByUsername', require('./portal/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('enterUsernameAndPassword', require('./portal/enterUsernameAndPassword'));
Cypress.Commands.add('completeDateFormFields', require('./portal/completeDateFormFields'));

Cypress.Commands.add('makerSubmitGefDealForReview', makerSubmitGefDealForReview);
Cypress.Commands.add('checkerSubmitGefDealToUkef', checkerSubmitGefDealToUkef);

Cypress.Commands.add('submitDealCancellation', submitDealCancellation);

Cypress.Commands.add('forceVisit', (url) => {
  cy.window().then((win) => win.open(url, '_self'));
});

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));
Cypress.Commands.add('submitManyDeals', require('./trade-finance-manager-api/submitManyDeals'));
