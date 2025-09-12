import * as api from './commands/api';
import { createApplicationAndSetStatus } from './commands/createApplicationAndSetStatus';
import { clearSessionCookies } from './utils/clearSessionCookies';
import { createFullApplication } from './commands/createFullApplication';
import { createFacility } from './commands/create-facility';
import { completeAboutExporterSection } from './commands/completeAboutExporterSection';
import { createApplicationFirstSteps } from './commands/createApplicationFirstSteps';

import './commands/click-events';

Cypress.Commands.add('clearSessionCookies', clearSessionCookies);
Cypress.Commands.add('saveSession', require('./utils/saveSession'));

Cypress.Commands.add('keyboardInput', require('./utils/keyboardInput'));

Cypress.Commands.add('assertText', require('./utils/assertText'));

Cypress.Commands.add('login', require('./commands/portal/login'));

Cypress.Commands.add(
  'overridePortalUserSignInTokenWithValidTokenByUsername',
  require('./commands/portal/overridePortalUserSignInTokenWithValidTokenByUsername'),
);
Cypress.Commands.add('getUserByUsername', require('./commands/portal/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./commands/portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('enterUsernameAndPassword', require('./commands/portal/enterUsernameAndPassword'));
Cypress.Commands.add('getDealIdFromUrl', require('./commands/portal/getDealIdFromUrl'));
Cypress.Commands.add('getFacilityIdFromUrl', require('./commands/portal/getFacilityIdFromUrl'));

Cypress.Commands.add('uploadFile', require('./commands/uploadFile'));
Cypress.Commands.add('insertElement', require('./commands/insertElement'));
Cypress.Commands.add('getApplicationById', require('./commands/getApplicationById'));
Cypress.Commands.add('loadData', require('./commands/loadData'));
Cypress.Commands.add('automaticEligibilityCriteria', require('./commands/automaticEligibilityCriteria'));
Cypress.Commands.add('manualEligibilityCriteria', require('./commands/manualEligibilityCriteria'));
Cypress.Commands.add('completeDateFormFields', require('./commands/completeDateFormFields'));
Cypress.Commands.add('submitMockDataLoaderDealToChecker', require('./commands/submit-mock-data-loader-deal-to-checker'));
Cypress.Commands.add('submitMockDataLoaderDealToUkef', require('./commands/submit-mock-data-loader-deal-to-ukef'));
Cypress.Commands.add('completeManualInclusionSupportingInfoSections', require('./commands/complete-manual-inclusion-supporting-info-sections'));

Cypress.Commands.add('checkCloneDealLink', require('./commands/clone/check-clone-deal-link'));
Cypress.Commands.add('cloneDeal', require('./commands/clone/clone-deal'));
Cypress.Commands.add('checkClonedDealBannerAndDeal', require('./commands/clone/check-cloned-deal-banner-and-deal'));

Cypress.Commands.add('apiLogin', api.login);
Cypress.Commands.add('apiFetchAllApplications', api.fetchAllApplications);
Cypress.Commands.add('apiFetchAllGefApplications', api.fetchAllGefApplications);
Cypress.Commands.add('apiFetchAllFacilities', api.fetchAllFacilities);
Cypress.Commands.add('createApplicationAndSetStatus', createApplicationAndSetStatus);
Cypress.Commands.add('apiUpdateApplication', api.updateApplication);
Cypress.Commands.add('apiSetApplicationStatus', api.setApplicationStatus);
Cypress.Commands.add('apiCreateApplication', api.createApplication);
Cypress.Commands.add('apiCreateFacility', api.createFacility);
Cypress.Commands.add('apiUpdateFacility', api.updateFacility);
Cypress.Commands.add('addCommentObjToDeal', api.addCommentObjToDeal);
Cypress.Commands.add('submitDealToTfm', api.submitDealToTfm);
Cypress.Commands.add('addUnderwriterCommentToTfm', api.addUnderwriterCommentToTfm);
Cypress.Commands.add('putTfmDeal', require('./commands/update-tfm-deal'));
Cypress.Commands.add('insertVersion0Deal', require('./commands/insertVersion0Deal'));
Cypress.Commands.add('insertVersion0Facility', require('./commands/insertVersion0Facility'));

Cypress.Commands.add('createFullApplication', createFullApplication);
Cypress.Commands.add('createFacility', createFacility);
Cypress.Commands.add('completeAboutExporterSection', completeAboutExporterSection);
Cypress.Commands.add('createApplicationFirstSteps', createApplicationFirstSteps);
