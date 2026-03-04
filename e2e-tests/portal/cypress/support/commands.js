import 'cypress-file-upload';
import * as api from '../../../gef/cypress/support/commands/api';
import * as createBssEwcsDealandFillDealFields from './portal/createBssEwcsDeal';
import { fillEligibilityCriteria } from './portal/completeEligibilityCriteria';
import { fillUnissuedBondDetails } from './portal/completeUnissuedBondDetails';
import { fillIssuedBondDetails } from './portal/completeIssuedBondDetails';
import { fillBondFinancialDetails } from './portal/completeBondFinancialDetails';
import { fillBondFeeDetails } from './portal/completeBondFeeDetails';
import { addBondDetails } from './portal/addBondDetails';
import { proceedToReviewAndApproval } from './portal/proceedToReviewAndApproval';
import { fillBankDetails } from './portal/fillBankDetails';
import { startNewSubmission } from './portal/startNewSubmission';
import { completeAboutSupplierSection } from './portal/completeAboutSupplierSection';
import { completeAboutBuyerSection } from './portal/completeAboutBuyerSection';
import { completeAboutFinancialSection } from './portal/completeAboutFinancialSection';
import { inCompleteAboutSupplierSection } from './portal/inCompleteAboutSupplierSection';
import { assertPrintDialogue } from './utils/assertPrintDialogue';
import { assertRiskMarginValidationError } from './portal/assertRiskMarginValidationError';

const { downloadFile } = require('./portal-api/fileshare');

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./utils/saveSession'));

Cypress.Commands.add('keyboardInput', require('./utils/keyboardInput'));

// Assert an element has some exact text
Cypress.Commands.add('assertText', require('./utils/assertText'));

// create an element in a div
Cypress.Commands.add('insertElement', require('./utils/insertElement'));

// Mock data loader
Cypress.Commands.add('loadData', require('../../../gef/cypress/support/commands/loadData'));

// Assert that the print dialogue is shown
Cypress.Commands.add('assertPrintDialogue', assertPrintDialogue);

// commands used to interact directly with portal-api
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('getDeal', require('./portal-api/getDeal'));
Cypress.Commands.add('getAllDeals', require('./portal-api/getAllDeals'));
Cypress.Commands.add('getFacility', require('./portal-api/getBSSFacility'));
Cypress.Commands.add('updateDeal', require('./portal-api/updateDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));

Cypress.Commands.add('getAllFeedback', require('./portal-api/getAllFeedback'));

// commands used to interact with GEF (via portal-api)
Cypress.Commands.add('deleteGefApplications', require('./portal-api/deleteGefApplications'));
Cypress.Commands.add('insertOneGefApplication', require('./portal-api/insertOneGefApplication'));
Cypress.Commands.add('insertManyGefApplications', require('./portal-api/insertManyGefApplications'));
Cypress.Commands.add('updateGefApplication', require('./portal-api/updateGefApplication'));
Cypress.Commands.add('setGefApplicationStatus', require('./portal-api/setGefApplicationStatus'));
Cypress.Commands.add('deleteGefFacilities', require('./portal-api/deleteGefFacilities'));
Cypress.Commands.add('insertOneGefFacility', require('./portal-api/insertOneGefFacility'));
Cypress.Commands.add('insertManyGefFacilities', require('./portal-api/insertManyGefFacilities'));
Cypress.Commands.add('updateGefFacility', require('./portal-api/updateGefFacility'));

Cypress.Commands.add('downloadFile', downloadFile);
Cypress.Commands.add('removeUserIfPresent', require('./portal-api/removeUserIfPresent'));
Cypress.Commands.add('listAllUsers', require('./portal-api/listAllUsers'));

Cypress.Commands.add('updateBond', require('./portal-api/updateBond'));
Cypress.Commands.add('updateLoan', require('./portal-api/updateLoan'));
Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));
Cypress.Commands.add('setupPortalSession', require('./portal-api/setupPortalSession'));

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('clickAddBondButton', require('./portal/click-events/click-add-bond-button'));
Cypress.Commands.add('clickAddLoanButton', require('./portal/click-events/click-add-loan-button'));
Cypress.Commands.add('clickBackLink', require('./portal/click-events/click-back-link'));
Cypress.Commands.add('clickCancelButton', require('./portal/click-events/click-cancel-button'));
Cypress.Commands.add('clickContinueButton', require('./portal/click-events/click-continue-button'));
Cypress.Commands.add('clickReturnToMakerButton', require('./portal/click-events/click-return-to-maker-button'));
Cypress.Commands.add('clickProceedToReviewButton', require('./portal/click-events/click-proceed-to-review-button'));
Cypress.Commands.add('clickProceedToSubmitButton', require('./portal/click-events/click-proceed-to-submit-button'));
Cypress.Commands.add('clickSaveGoBackButton', require('./portal/click-events/click-save-go-back-button'));
Cypress.Commands.add('clickSubmitButton', require('./portal/click-events/click-submit-button'));
Cypress.Commands.add('clickDashboardDealLinkByIndex', require('./portal/click-events/click-dashboard-deal-link-by-index'));
Cypress.Commands.add('completeDateFormFields', require('./portal/completeDateFormFields'));

Cypress.Commands.add('addBondToDeal', require('./portal/addBondToDeal'));
Cypress.Commands.add('addLoanToDeal', require('./portal/addLoanToDeal'));
Cypress.Commands.add('createADeal', require('./portal/createADeal'));
Cypress.Commands.add('createBSSSubmission', require('./portal/createBSSSubmission'));
Cypress.Commands.add('enterUsernameAndPassword', require('./portal/enterUsernameAndPassword'));
Cypress.Commands.add('getUserByUsername', require('./portal/getUserByUsername'));
Cypress.Commands.add('login', require('./portal/login'));
Cypress.Commands.add('loginGoToDealPage', require('./portal/loginGoToDealPage'));
Cypress.Commands.add('overridePortalUserSignInTokenWithValidTokenByUsername', require('./portal/overridePortalUserSignInTokenWithValidTokenByUsername'));
Cypress.Commands.add('overridePortalUserSignInTokensByUsername', require('./portal/overridePortalUserSignInTokensByUsername'));
Cypress.Commands.add('passRedLine', require('./portal/passRedLine'));
Cypress.Commands.add('renameDeal', require('./portal/renameDeal'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('userSetPassword', require('./portal/userSetPassword'));
Cypress.Commands.add('disablePortalUserByUsername', require('./portal/disablePortalUserByUsername'));

// command to assert row contents in the utilisation report upload journey
Cypress.Commands.add('assertValidationErrorTableRowContains', require('./portal/utilisation-reports/assertUploadReportValidationErrorTableRowContains'));

Cypress.Commands.add('createBssEwcsDeal', createBssEwcsDealandFillDealFields.createBssEwcsDeal);
Cypress.Commands.add('completeBssEwcsDealFields', createBssEwcsDealandFillDealFields.completeBssEwcsDealFields);
Cypress.Commands.add('completeEligibilityCriteria', fillEligibilityCriteria);
Cypress.Commands.add('completeUnissuedBondDetails', fillUnissuedBondDetails);
Cypress.Commands.add('completeIssuedBondDetails', fillIssuedBondDetails);
Cypress.Commands.add('completeBondFinancialDetails', fillBondFinancialDetails);
Cypress.Commands.add('completeBondFeeDetails', fillBondFeeDetails);
Cypress.Commands.add('addBondDetails', addBondDetails);
Cypress.Commands.add('proceedToReviewAndApproval', proceedToReviewAndApproval);
Cypress.Commands.add('fillBankDetails', fillBankDetails);
Cypress.Commands.add('startNewSubmission', startNewSubmission);
Cypress.Commands.add('completeAboutSupplierSection', completeAboutSupplierSection);
Cypress.Commands.add('completeAboutBuyerSection', completeAboutBuyerSection);
Cypress.Commands.add('completeAboutFinancialSection', completeAboutFinancialSection);
Cypress.Commands.add('inCompleteAboutSupplierSection', inCompleteAboutSupplierSection);
Cypress.Commands.add('assertRiskMarginValidationError', assertRiskMarginValidationError);

Cypress.Commands.add('getDealIdFromUrl', require('./portal/getDealIdFromUrl'));

// commands that add/edit facilities directly in central API
Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));

// API calls
Cypress.Commands.add('apiLogin', api.login);
Cypress.Commands.add('apiFetchAllApplications', api.fetchAllApplications);
