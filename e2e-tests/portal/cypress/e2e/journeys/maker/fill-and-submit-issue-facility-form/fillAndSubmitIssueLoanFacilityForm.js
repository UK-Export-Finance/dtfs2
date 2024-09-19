const pages = require('../../../pages');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_LOAN_DATE_VALUE = dateConstants.today;
export const COVER_START_DATE_VALUE = dateConstants.twoDays;
export const COVER_END_DATE_VALUE = dateConstants.oneMonth;
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.keyboardInput(pages.loanIssueFacility.issuedDateDayInput(), dateConstants.todayDay);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateMonthInput(), dateConstants.todayMonth);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateYearInput(), dateConstants.todayYear);

  cy.keyboardInput(pages.loanIssueFacility.coverEndDateDayInput(), dateConstants.oneMonthDay);
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateMonthInput(), dateConstants.oneMonthMonth);
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateYearInput(), dateConstants.oneMonthYear);

  cy.keyboardInput(pages.loanIssueFacility.disbursementAmount(), DISBURSEMENT_AMOUNT_VALUE);
  cy.keyboardInput(pages.loanIssueFacility.name(), '5678');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  cy.keyboardInput(pages.loanIssueFacility.issuedDateDayInput(), dateConstants.todayDay);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateMonthInput(), dateConstants.todayMonth);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateYearInput(), dateConstants.todayYear);

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.requestedCoverStartDateDayInput(), dateConstants.twoDaysDay);

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.requestedCoverStartDateMonthInput(), dateConstants.twoDaysMonth);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.requestedCoverStartDateYearInput(), dateConstants.twoDaysYear);

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateDayInput(), dateConstants.oneMonthDay);

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateMonthInput(), dateConstants.oneMonthMonth);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateYearInput(), dateConstants.oneMonthYear);

  pages.loanIssueFacility.disbursementAmount().clear();
  cy.keyboardInput(pages.loanIssueFacility.disbursementAmount(), DISBURSEMENT_AMOUNT_VALUE);
  cy.keyboardInput(pages.loanIssueFacility.name(), '5678');

  cy.clickSubmitButton();
};
