import { oneMonth, today, twoDays } from '../../../../../../e2e-fixtures/dateConstants';

const pages = require('../../../pages');

export const ISSUED_LOAN_DATE_VALUE = today.date;
export const COVER_START_DATE_VALUE = twoDays.date;
export const COVER_END_DATE_VALUE = oneMonth.date;
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.keyboardInput(pages.loanIssueFacility.issuedDateDayInput(), today.day);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateMonthInput(), today.month);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateYearInput(), today.year);

  cy.keyboardInput(pages.loanIssueFacility.coverEndDateDayInput(), oneMonth.day);
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateMonthInput(), oneMonth.month);
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateYearInput(), oneMonth.year);

  cy.keyboardInput(pages.loanIssueFacility.disbursementAmount(), DISBURSEMENT_AMOUNT_VALUE);
  cy.keyboardInput(pages.loanIssueFacility.name(), '5678');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  cy.keyboardInput(pages.loanIssueFacility.issuedDateDayInput(), today.day);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateMonthInput(), today.month);
  cy.keyboardInput(pages.loanIssueFacility.issuedDateYearInput(), today.year);

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.requestedCoverStartDateDayInput(), twoDays.day);

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.requestedCoverStartDateMonthInput(), twoDays.month);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.requestedCoverStartDateYearInput(), twoDays.year);

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateDayInput(), oneMonth.day);

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateMonthInput(), oneMonth.month);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  cy.keyboardInput(pages.loanIssueFacility.coverEndDateYearInput(), oneMonth.year);

  pages.loanIssueFacility.disbursementAmount().clear();
  cy.keyboardInput(pages.loanIssueFacility.disbursementAmount(), DISBURSEMENT_AMOUNT_VALUE);
  cy.keyboardInput(pages.loanIssueFacility.name(), '5678');

  cy.clickSubmitButton();
};
