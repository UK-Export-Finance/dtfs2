import * as api from './commands/api';
import { fillInBankReviewDate } from './commands/fillInBankReviewDate';

import './commands/click-events';

Cypress.Commands.add('saveSession', require('./commands/saveSession'));

Cypress.Commands.add('login', require('./commands/portal/login'));
Cypress.Commands.add(
  'overridePortalUserSignInTokenWithValidTokenByUsername',
  require('./commands/portal/overridePortalUserSignInTokenWithValidTokenByUsername'),
);
Cypress.Commands.add('getUserByUsername', require('./commands/portal/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./commands/portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('enterUsernameAndPassword', require('./commands/portal/enterUsernameAndPassword'));

Cypress.Commands.add('uploadFile', require('./commands/uploadFile'));
Cypress.Commands.add('insertElement', require('./commands/insertElement'));
Cypress.Commands.add('submitDealAfterUkefIds', require('./commands/submitDealAfterUkefIds'));
Cypress.Commands.add('getApplicationById', require('./commands/getApplicationById'));
Cypress.Commands.add('loadData', require('./commands/loadData'));
Cypress.Commands.add('automaticEligibilityCriteria', require('./commands/automaticEligibilityCriteria'));
Cypress.Commands.add('manualEligibilityCriteria', require('./commands/manualEligibilityCriteria'));

Cypress.Commands.add('apiLogin', api.login);
Cypress.Commands.add('apiFetchAllApplications', api.fetchAllApplications);
Cypress.Commands.add('apiFetchAllGefApplications', api.fetchAllGefApplications);
Cypress.Commands.add('apiFetchAllFacilities', api.fetchAllFacilities);
Cypress.Commands.add('apiUpdateApplication', api.updateApplication);
Cypress.Commands.add('apiSetApplicationStatus', api.setApplicationStatus);
Cypress.Commands.add('apiCreateApplication', api.createApplication);
Cypress.Commands.add('apiCreateFacility', api.createFacility);
Cypress.Commands.add('apiUpdateFacility', api.updateFacility);
Cypress.Commands.add('addCommentObjToDeal', api.addCommentObjToDeal);
Cypress.Commands.add('submitDealToTfm', api.submitDealToTfm);
Cypress.Commands.add('addUnderwriterCommentToTfm', api.addUnderwriterCommentToTfm);
Cypress.Commands.add('insertVersion0Deal', require('./commands/insertVersion0Deal'));
Cypress.Commands.add('insertVersion0Facility', require('./commands/insertVersion0Facility'));

Cypress.Commands.add('fillInBankReviewDate', fillInBankReviewDate);
