const moment = require('moment');
const pages = require('../../../pages');

const fillAndSubmitIssueLoanFacilityForm = () => {
  const issuedDate = moment().add(1, 'day');
  pages.loanIssueFacility.issuedDateDayInput().type(issuedDate.format('DD'));
  pages.loanIssueFacility.issuedDateMonthInput().type(issuedDate.format('MM'));
  pages.loanIssueFacility.issuedDateYearInput().type(issuedDate.format('YYYY'));

  const requestedCoverStartDate = moment().add(2, 'day');
  pages.loanIssueFacility.requestedCoverStartDateDayInput().type(requestedCoverStartDate.format('DD'));
  pages.loanIssueFacility.requestedCoverStartDateMonthInput().type(requestedCoverStartDate.format('MM'));
  pages.loanIssueFacility.requestedCoverStartDateYearInput().type(requestedCoverStartDate.format('YYYY'));

  const coverEndDate = moment().add(1, 'month');
  pages.loanIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
  pages.loanIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
  pages.loanIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

  pages.loanIssueFacility.disbursementAmount().type('1234');
  pages.loanIssueFacility.bankReferenceNumber().type('5678');

  pages.loanIssueFacility.submit().click();
};

export default fillAndSubmitIssueLoanFacilityForm;
