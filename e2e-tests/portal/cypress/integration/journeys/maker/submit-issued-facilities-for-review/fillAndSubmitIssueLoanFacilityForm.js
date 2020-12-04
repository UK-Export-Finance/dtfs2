const moment = require('moment');
const pages = require('../../../pages');

export const ISSUED_LOAN_DATE_VALUE = moment();

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.format('DD'));
  pages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.format('MM'));
  pages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.format('YYYY'));

  const coverEndDate = moment().add(1, 'month');
  pages.loanIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
  pages.loanIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
  pages.loanIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

  pages.loanIssueFacility.disbursementAmount().type('1234');
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  pages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.format('DD'));
  pages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.format('MM'));
  pages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.format('YYYY'));

  const requestedCoverStartDate = moment().add(2, 'day');
  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateDayInput().type(requestedCoverStartDate.format('DD'));

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateMonthInput().type(requestedCoverStartDate.format('MM'));

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.loanIssueFacility.requestedCoverStartDateYearInput().type(requestedCoverStartDate.format('YYYY'));

  const coverEndDate = moment().add(1, 'month');
  pages.loanIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
  pages.loanIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
  pages.loanIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

  pages.loanIssueFacility.disbursementAmount().type('1234');
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};
