const pages = require('../../../pages');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_LOAN_DATE_VALUE = dateConstants.today;
export const COVER_START_DATE_VALUE = dateConstants.twoDays;
export const COVER_END_DATE_VALUE = dateConstants.oneMonth;
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
  pages.loanIssueFacility.issuedDateMonthInput().type(dateConstants.todayMonth);
  pages.loanIssueFacility.issuedDateYearInput().type(dateConstants.todayYear);

  pages.loanIssueFacility.coverEndDateDayInput().type(dateConstants.oneMonthDay);
  pages.loanIssueFacility.coverEndDateMonthInput().type(dateConstants.oneMonthMonth);
  pages.loanIssueFacility.coverEndDateYearInput().type(dateConstants.oneMonthYear);

  pages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  pages.loanIssueFacility.name().type('5678');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
  pages.loanIssueFacility.issuedDateMonthInput().type(dateConstants.todayMonth);
  pages.loanIssueFacility.issuedDateYearInput().type(dateConstants.todayYear);

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateDayInput().type(dateConstants.twoDaysDay);

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateMonthInput().type(dateConstants.twoDaysMonth);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateYearInput().type(dateConstants.twoDaysYear);

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  pages.loanIssueFacility.coverEndDateDayInput().type(dateConstants.oneMonthDay);

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  pages.loanIssueFacility.coverEndDateMonthInput().type(dateConstants.oneMonthMonth);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  pages.loanIssueFacility.coverEndDateYearInput().type(dateConstants.oneMonthYear);

  pages.loanIssueFacility.disbursementAmount().clear();
  pages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  pages.loanIssueFacility.name().type('5678');

  cy.clickSubmitButton();
};
