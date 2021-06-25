const moment = require('moment');
const pages = require('../../../pages');

export const ISSUED_LOAN_DATE_VALUE = moment();
export const COVER_START_DATE_VALUE = moment().add(2, 'day');
export const COVER_END_DATE_VALUE = moment().add(1, 'month');
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.format('DD'));
  pages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.format('MM'));
  pages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.format('YYYY'));

  pages.loanIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.format('DD'));
  pages.loanIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.format('MM'));
  pages.loanIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.format('YYYY'));

  pages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.format('DD'));
  pages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.format('MM'));
  pages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateDayInput().type(COVER_START_DATE_VALUE.format('DD'));

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateMonthInput().type(COVER_START_DATE_VALUE.format('MM'));

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateYearInput().type(COVER_START_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  pages.loanIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.format('DD'));

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  pages.loanIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.format('MM'));

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  pages.loanIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.format('YYYY'));

  pages.loanIssueFacility.disbursementAmount().clear();
  pages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};
