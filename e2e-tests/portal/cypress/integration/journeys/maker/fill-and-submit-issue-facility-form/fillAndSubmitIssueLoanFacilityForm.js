const pages = require('../../../pages');

export const ISSUED_LOAN_DATE_VALUE = new Date();
export const COVER_START_DATE_VALUE = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date;
};
export const COVER_END_DATE_VALUE = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
};
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.getDate());
  pages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.getMonth() + 1);
  pages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.getFullYear());

  pages.loanIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE().getDate());
  pages.loanIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE().getMonth() + 1);
  pages.loanIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE().getFullYear());

  pages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.getDate());
  pages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.getMonth() + 1);
  pages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.getFullYear());

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateDayInput().type(COVER_START_DATE_VALUE().getDate());

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateMonthInput().type(COVER_START_DATE_VALUE().getMonth() + 1);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateYearInput().type(COVER_START_DATE_VALUE().getFullYear());

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  pages.loanIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE().getDate());

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  pages.loanIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE().getMonth() + 1);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  pages.loanIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE().getFullYear());

  pages.loanIssueFacility.disbursementAmount().clear();
  pages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};
