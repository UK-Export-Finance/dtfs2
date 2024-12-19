const applicationDetails = require('../../../../gef/cypress/e2e/pages/application-details');
const automaticCover = require('../../../../gef/cypress/e2e/pages/automatic-cover');
const applicationSubmission = require('../../../../gef/cypress/e2e/pages/application-submission');
const dashboardPage = require('../../../../gef/cypress/e2e/pages/dashboard-page');
const companiesHouse = require('../../../../gef/cypress/e2e/pages/companies-house');
const exporterAddress = require('../../../../gef/cypress/e2e/pages/exporters-address');
const aboutExporter = require('../../../../gef/cypress/e2e/pages/about-exporter');
const facilities = require('../../../../gef/cypress/e2e/pages/facilities');
const aboutFacility = require('../../../../gef/cypress/e2e/pages/about-facility');
const facilityValue = require('../../../../gef/cypress/e2e/pages/facility-value');
const facilityGuranatees = require('../../../../gef/cypress/e2e/pages/facility-guarantee');
const providedFacility = require('../../../../gef/cypress/e2e/pages/provided-facility');
const facilityCurrency = require('../../../../gef/cypress/e2e/pages/facility-currency');
const login = require('../../../../gef/cypress/support/commands/portal/login');
const MOCK_USERS = require('../../../../e2e-fixtures/index');

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Create a GEF deal via the UI.
 * @param {Boolean} readyForCheck: Conditionally complete all "maker" required forms
 */
const createGefDeal = ({ readyForCheck }) => {
  login(BANK1_MAKER1);

  // Navigate to create a new GEF submission
  dashboardPage.createNewSubmission().click();
  dashboardPage.gefSubmission().click();
  cy.clickContinueButton();
  dashboardPage.mandatoryCriteriaYes().click();
  cy.clickContinueButton();
  cy.keyboardInput(dashboardPage.internalRefName(), '12345678');
  cy.clickContinueButton();

  if (readyForCheck) {
    applicationDetails.exporterDetailsLink().click();

    // Enter Company Registration and search
    cy.keyboardInput(companiesHouse.regNumberField(), '12345678');
    cy.clickContinueButton();

    // Select Exporter address
    exporterAddress.noRadioButton().click();
    cy.clickContinueButton();

    // Fill in details about the exporter
    aboutExporter.smallRadioButton().click();
    cy.keyboardInput(aboutExporter.probabilityOfDefaultInput(), '1.25');
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
    cy.clickContinueButton();

    // Continue with eligibility for automatic cover
    cy.clickContinueButton();

    applicationDetails.addCashFacilityButton().click();

    // Add a cash facility
    facilities.hasBeenIssuedRadioNoRadioButton().click();
    cy.clickContinueButton();

    // Fill in details about the facility
    cy.keyboardInput(aboutFacility.facilityName(), 'Test Facility');
    cy.keyboardInput(aboutFacility.monthsOfCover(), '12');
    cy.clickContinueButton();

    // Provide additional details about the facility
    providedFacility.otherCheckbox().click();
    cy.keyboardInput(providedFacility.detailsOther(), 'Test details');
    cy.clickContinueButton();

    // Select the facility currency
    facilityCurrency.yenCheckbox().click();
    cy.clickContinueButton();

    // Fill in the facility value and cover details
    cy.keyboardInput(facilityValue.value(), '1000000');
    cy.keyboardInput(facilityValue.percentageCover(), '80');
    cy.keyboardInput(facilityValue.interestPercentage(), '1.29');
    cy.clickContinueButton();

    // Fill in facility guarantees details
    facilityGuranatees.feeTypeAtMaturityInput().click();
    facilityGuranatees.dayCountBasis360Input().click();
    facilityGuranatees.doneButton().click();

    // Submit the application to Checker
    // TODO: add comment as to why need to click two submit buttons.
    cy.clickSubmitButton();
    cy.clickSubmitButton();

    // Navigate back to the dashboard
    applicationSubmission.backToDashboardLink().click();
  }
};

module.exports = createGefDeal;
