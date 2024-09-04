// This file is used to create a GEF application that is ready for check
const applicationDetails = require('../../../../gef/cypress/e2e/pages/application-details');
const automaticCover = require('../../../../gef/cypress/e2e/pages/automatic-cover');
const applicationSubmission = require('../../../../gef/cypress/e2e/pages/application-submission');
const dashboardPage = require('../../../../gef/cypress/e2e/pages/dashboard-page');
const companiesHouse = require('../../../../gef/cypress/e2e/pages/companies-house');
const exporterAddress = require('../../../../gef/cypress/e2e/pages/exporters-address');
const eligibleAutomaticCover = require('../../../../gef/cypress/e2e/pages/eligible-automatic-cover');
const aboutExporter = require('../../../../gef/cypress/e2e/pages/about-exporter');
const facilities = require('../../../../gef/cypress/e2e/pages/facilities');
const aboutFacility = require('../../../../gef/cypress/e2e/pages/about-facility');
const facilityValue = require('../../../../gef/cypress/e2e/pages/facility-value');
const facilityGuranatees = require('../../../../gef/cypress/e2e/pages/facility-guarantee');
const providedFacility = require('../../../../gef/cypress/e2e/pages/provided-facility');
const facilityCurrency = require('../../../../gef/cypress/e2e/pages/facility-currency');
const submitToUkef = require('../../../../gef/cypress/e2e/pages/submit-to-ukef');
const login = require('../../../../gef/cypress/support/commands/portal/login');
const MOCK_USERS = require('../../../../e2e-fixtures/index');

const { BANK1_MAKER1 } = MOCK_USERS;

const createGefApplicationReadyForCheck = () => {
  login(BANK1_MAKER1);

  // Navigate to create a new GEF submission
  dashboardPage.createNewSubmission().click();
  dashboardPage.gefSubmission().click();
  dashboardPage.continueButton().click();
  dashboardPage.mandatoryCriteriaYes().click();
  dashboardPage.continueButton().click();
  dashboardPage.internalRefName().type('12345678', { delay: 0 });
  dashboardPage.continueButton().click();

  applicationDetails.exporterDetailsLink().click();

  // Enter Company Registration and search
  companiesHouse.regNumberField().type('12345678', { delay: 0 });
  companiesHouse.continueButton().click();

  // Select Exporter address
  exporterAddress.noRadioButton().click();
  exporterAddress.continueButton().click();

  // Fill in details about the exporter
  aboutExporter.smallRadioButton().click();
  aboutExporter.probabilityOfDefaultInput().type('1.25', { delay: 0 });
  aboutExporter.isFinancingIncreasingRadioNo().click();
  aboutExporter.doneButton().click();

  applicationDetails.automaticCoverDetailsLink().click();

  // Select automatic cover details
  automaticCover.trueRadioButton(12).click();
  automaticCover.trueRadioButton(13).click();
  automaticCover.trueRadioButton(14).click();
  automaticCover.trueRadioButton(15).click();
  automaticCover.trueRadioButton(16).click();
  automaticCover.trueRadioButton(17).click();
  automaticCover.trueRadioButton(18).click();
  automaticCover.trueRadioButton(19).click();
  automaticCover.trueRadioButton(20).click();
  automaticCover.trueRadioButton(21).click();
  automaticCover.continueButton().click();

  // Continue with eligibility for automatic cover
  eligibleAutomaticCover.continueButton().click();

  applicationDetails.addCashFacilityButton().click();

  // Add a cash facility
  facilities.hasBeenIssuedRadioNoRadioButton().click();
  facilities.continueButton().click();

  // Fill in details about the facility
  aboutFacility.facilityName().type('Test Facility', { delay: 0 });
  aboutFacility.monthsOfCover().type('12', { delay: 0 });
  aboutFacility.continueButton().click();

  // Provide additional details about the facility
  providedFacility.otherCheckbox().click();
  providedFacility.detailsOther().type('Test details', { delay: 0 });
  providedFacility.continueButton().click();

  // Select the facility currency
  facilityCurrency.yenCheckbox().click();
  facilityCurrency.continueButton().click();

  // Fill in the facility value and cover details
  facilityValue.value().type('1000000', { delay: 0 });
  facilityValue.percentageCover().type('80', { delay: 0 });
  facilityValue.interestPercentage().type('1.29', { delay: 0 });
  facilityValue.continueButton().click();

  // Fill in facility guarantees details
  facilityGuranatees.feeTypeAtMaturityInput().click();
  facilityGuranatees.dayCountBasis360Input().click();
  facilityGuranatees.doneButton().click();

  // Submit the application to UKEF
  submitToUkef.submitButton().click();
  submitToUkef.submitButton().click();

  // Navigate back to the dashboard
  applicationSubmission.backToDashboardLink().click();
};

module.exports = createGefApplicationReadyForCheck;
