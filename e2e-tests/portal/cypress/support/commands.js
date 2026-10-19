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
import { saveSession } from './utils/saveSession';
import { keyboardInput } from './utils/keyboardInput';
import { login } from './portal/login';
import { loginOTP } from './portal/loginOTP';
import { completeDateFormFields } from './portal/completeDateFormFields';
import { clickSubmitButton } from './portal/click-events/click-submit-button';
import { clickAddBondButton } from './portal/click-events/click-add-bond-button';
import { clickAddLoanButton } from './portal/click-events/click-add-loan-button';
import { clickBackLink } from './portal/click-events/click-back-link';
import { clickCancelButton } from './portal/click-events/click-cancel-button';
import { clickContinueButton } from './portal/click-events/click-continue-button';
import { clickReturnToMakerButton } from './portal/click-events/click-return-to-maker-button';
import { clickProceedToReviewButton } from './portal/click-events/click-proceed-to-review-button';
import { clickProceedToSubmitButton } from './portal/click-events/click-proceed-to-submit-button';
import { clickSaveGoBackButton } from './portal/click-events/click-save-go-back-button';
import { clickDashboardDealLinkByIndex } from './portal/click-events/click-dashboard-deal-link-by-index';
import { loadData } from '../../../gef/cypress/support/commands/loadData';
import { getDealIdFromUrl } from './portal/getDealIdFromUrl';
import { assertSelectOptionDoesNotExist } from './utils/assertSelectOptionDoesNotExist';
import { assertSelectOptionExists } from './utils/assertSelectOptionExists';

const { downloadFile } = require('./portal-api/fileshare');

// Preserve session cookie
Cypress.Commands.add('saveSession', saveSession);

// Resets the session
Cypress.Commands.add('clearSessionCookies', require('./utils/clearSessionCookies'));

Cypress.Commands.add('keyboardInput', keyboardInput);

// Assert an element has some exact text
Cypress.Commands.add('assertText', require('./utils/assertText'));

// create an element in a div
Cypress.Commands.add('insertElement', require('./utils/insertElement'));

// Assert that a select element has an option with the given text
Cypress.Commands.add('assertSelectOptionExists', assertSelectOptionExists);
// Assert that a select element does not have an option with the given text
Cypress.Commands.add('assertSelectOptionDoesNotExist', assertSelectOptionDoesNotExist);

// Mock data loader
Cypress.Commands.add('loadData', loadData);

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

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('clickAddBondButton', clickAddBondButton);
Cypress.Commands.add('clickAddLoanButton', clickAddLoanButton);
Cypress.Commands.add('clickBackLink', clickBackLink);
Cypress.Commands.add('clickCancelButton', clickCancelButton);
Cypress.Commands.add('clickContinueButton', clickContinueButton);
Cypress.Commands.add('clickReturnToMakerButton', clickReturnToMakerButton);
Cypress.Commands.add('clickProceedToReviewButton', clickProceedToReviewButton);
Cypress.Commands.add('clickProceedToSubmitButton', clickProceedToSubmitButton);
Cypress.Commands.add('clickSaveGoBackButton', clickSaveGoBackButton);
Cypress.Commands.add('clickSubmitButton', clickSubmitButton);
Cypress.Commands.add('clickDashboardDealLinkByIndex', clickDashboardDealLinkByIndex);
Cypress.Commands.add('completeDateFormFields', completeDateFormFields);

Cypress.Commands.add('addBondToDeal', require('./portal/addBondToDeal'));
Cypress.Commands.add('addLoanToDeal', require('./portal/addLoanToDeal'));
Cypress.Commands.add('createADeal', require('./portal/createADeal'));
Cypress.Commands.add('createBSSSubmission', require('./portal/createBSSSubmission'));
Cypress.Commands.add('enterUsernameAndPassword', require('./portal/enterUsernameAndPassword'));
Cypress.Commands.add('getUserByUsername', require('./portal/getUserByUsername'));
Cypress.Commands.add('login', login);
Cypress.Commands.add('loginOTP', loginOTP);
Cypress.Commands.add('loginGoToDealPage', require('./portal/loginGoToDealPage'));
Cypress.Commands.add('enterJourneyAtRequestCodeClicks', require('./portal/enterJourneyAtRequestCodeClicks'));
Cypress.Commands.add('submitValidAccessCode', require('./portal/submitValidAccessCode'));
Cypress.Commands.add('overridePortalUserSignInTokenWithValidTokenByUsername', require('./portal/overridePortalUserSignInTokenWithValidTokenByUsername'));
Cypress.Commands.add('overridePortalUserSignInTokensByUsername', require('./portal/overridePortalUserSignInTokensByUsername'));
Cypress.Commands.add('overridePortalUserSignInOTPWithValidTokenByUsername', require('./portal/overridePortalUserSignInOTPWithValidTokenByUsername'));
Cypress.Commands.add('overridePortalUserSignInOTPWithExpiredToken', require('./portal-api/overridePortalUserSignInOTPWithExpiredToken'));
Cypress.Commands.add('passRedLine', require('./portal/passRedLine'));
Cypress.Commands.add('renameDeal', require('./portal/renameDeal'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./portal/resetPortalUserStatusAndNumberOfSignInLinks'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInOTPs', require('./portal/resetPortalUserStatusAndNumberOfSignInOTPs'));
Cypress.Commands.add('userSetPassword', require('./portal/userSetPassword'));
Cypress.Commands.add('disablePortalUserByUsername', require('./portal/disablePortalUserByUsername'));
Cypress.Commands.add('overridePortalUserSignInOTPSendCount', require('./portal-api/overridePortalUserSignInOTPSendCount'));

// command to progress the resend journey and land on the suspended page.
Cypress.Commands.add('goToSuspendedPage', require('./portal/goToSuspendedPage'));

// command to submit an expired access code and land on the expired page.
Cypress.Commands.add('submitExpiredAccessCode', require('./portal/submitExpiredAccessCode'));

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

Cypress.Commands.add('getDealIdFromUrl', getDealIdFromUrl);

// commands that add/edit facilities directly in central API
Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));

// API calls
Cypress.Commands.add('apiLogin', api.login);
Cypress.Commands.add('apiFetchAllApplications', api.fetchAllApplications);
