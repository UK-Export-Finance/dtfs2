import 'cypress-file-upload';
import './click-events';

import './commands/click-events';

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./utils/saveSession'));

// Assert an element has some exact text
Cypress.Commands.add('assertText', require('./utils/assertText'));

// commands used to interact directly with portal-api
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));

Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('login', require('./portal/logIn'));
Cypress.Commands.add('overridePortalUserSignInTokenWithValidTokenByUsername', require('./portal/overridePortalUserSignInTokenWithValidTokenByUsername'));
Cypress.Commands.add('getUserByUsername', require('./portal/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('enterUsernameAndPassword', require('./portal/enterUsernameAndPassword'));

Cypress.Commands.add('forceVisit', (url) => {
  cy.window().then((win) => win.open(url, '_self'));
});

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));
Cypress.Commands.add('submitManyDeals', require('./trade-finance-manager-api/submitManyDeals'));

// shared commands for TFM
Cypress.Commands.add('tfmLogin', require('../../../support/trade-finance-manager/login'));
Cypress.Commands.add('getTfmUserByUsername', require('../../../support/trade-finance-manager/getTfmUserByUsername'));
Cypress.Commands.add('overrideTfmUserSessionId', require('../../../support/trade-finance-manager/overrideTfmUserSessionId'));
Cypress.Commands.add('overrideRedisUserSession', require('../../../support/trade-finance-manager/overrideRedisUserSession'));
Cypress.Commands.add('setSessionCookie', require('../../../support/trade-finance-manager/setSessionCookie'));
