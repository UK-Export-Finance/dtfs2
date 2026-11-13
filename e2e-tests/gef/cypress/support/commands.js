import * as api from './commands/api';
import { createApplicationAndSetStatus } from './commands/createApplicationAndSetStatus';
import { clearSessionCookies } from './utils/clearSessionCookies';
import { createFullApplication } from './commands/createFullApplication';
import { createFacility } from './commands/create-facility';
import { completeAboutExporterSection } from './commands/completeAboutExporterSection';
import { createApplicationFirstSteps } from './commands/createApplicationFirstSteps';
import { saveSession } from './utils/saveSession';
import { keyboardInput } from './utils/keyboardInput';
import { loginOTP } from './commands/portal/loginOTP';
import { completeDateFormFields } from './commands/completeDateFormFields';
import { automaticEligibilityCriteria } from './commands/automaticEligibilityCriteria';
import { checkClonedDealBannerAndDeal } from './commands/clone/check-cloned-deal-banner-and-deal';
import { cloneDeal } from './commands/clone/clone-deal';
import { completeManualInclusionSupportingInfoSections } from './commands/complete-manual-inclusion-supporting-info-sections';
import { loadData } from './commands/loadData';
import { getDealIdFromUrl } from './commands/portal/getDealIdFromUrl';
import { getFacilityIdFromUrl } from './commands/portal/getFacilityIdFromUrl';
import { checkCloneDealLink } from './commands/clone/check-clone-deal-link';
import { manualEligibilityCriteria } from './commands/manualEligibilityCriteria';
import { submitMockDataLoaderDealToChecker } from './commands/submit-mock-data-loader-deal-to-checker';
import { submitMockDataLoaderDealToUkef } from './commands/submit-mock-data-loader-deal-to-ukef';
import { uploadFile } from './commands/uploadFile';
import { login } from './commands/portal/login';

import './commands/click-events';

Cypress.Commands.add('clearSessionCookies', clearSessionCookies);
Cypress.Commands.add('saveSession', saveSession);

Cypress.Commands.add('keyboardInput', keyboardInput);

Cypress.Commands.add('assertText', require('./utils/assertText'));

Cypress.Commands.add('login', login);
Cypress.Commands.add('loginOTP', loginOTP);

Cypress.Commands.add(
  'overridePortalUserSignInTokenWithValidTokenByUsername',
  require('./commands/portal/overridePortalUserSignInTokenWithValidTokenByUsername'),
);
Cypress.Commands.add('overridePortalUserSignInOTPWithValidTokenByUsername', require('./commands/portal/overridePortalUserSignInOTPWithValidTokenByUsername'));
Cypress.Commands.add('getUserByUsername', require('./commands/portal/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./commands/portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInOTPs', require('./commands/portal/resetPortalUserStatusAndNumberOfSignInOTPs'));
Cypress.Commands.add('enterUsernameAndPassword', require('./commands/portal/enterUsernameAndPassword'));
Cypress.Commands.add('getDealIdFromUrl', getDealIdFromUrl);
Cypress.Commands.add('getFacilityIdFromUrl', getFacilityIdFromUrl);

Cypress.Commands.add('uploadFile', uploadFile);
Cypress.Commands.add('insertElement', require('./commands/insertElement'));
Cypress.Commands.add('getApplicationById', require('./commands/getApplicationById'));
Cypress.Commands.add('loadData', loadData);
Cypress.Commands.add('automaticEligibilityCriteria', automaticEligibilityCriteria);
Cypress.Commands.add('manualEligibilityCriteria', manualEligibilityCriteria);
Cypress.Commands.add('completeDateFormFields', completeDateFormFields);
Cypress.Commands.add('submitMockDataLoaderDealToChecker', submitMockDataLoaderDealToChecker);
Cypress.Commands.add('submitMockDataLoaderDealToUkef', submitMockDataLoaderDealToUkef);
Cypress.Commands.add('completeManualInclusionSupportingInfoSections', completeManualInclusionSupportingInfoSections);

Cypress.Commands.add('checkCloneDealLink', checkCloneDealLink);
Cypress.Commands.add('cloneDeal', cloneDeal);
Cypress.Commands.add('checkClonedDealBannerAndDeal', checkClonedDealBannerAndDeal);

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
