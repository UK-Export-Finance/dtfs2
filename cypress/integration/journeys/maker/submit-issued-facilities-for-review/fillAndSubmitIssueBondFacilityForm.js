const moment = require('moment');
const pages = require('../../../pages');

const fillAndSubmitIssueBondFacilityForm = () => {
  const issuedDate = moment().add(1, 'day');
  pages.bondIssueFacility.issuedDateDayInput().type(issuedDate.format('DD'));
  pages.bondIssueFacility.issuedDateMonthInput().type(issuedDate.format('MM'));
  pages.bondIssueFacility.issuedDateYearInput().type(issuedDate.format('YYYY'));

  const requestedCoverStartDate = moment().add(2, 'day');
  pages.bondIssueFacility.requestedCoverStartDateDayInput().type(requestedCoverStartDate.format('DD'));
  pages.bondIssueFacility.requestedCoverStartDateMonthInput().type(requestedCoverStartDate.format('MM'));
  pages.bondIssueFacility.requestedCoverStartDateYearInput().type(requestedCoverStartDate.format('YYYY'));

  const coverEndDate = moment().add(1, 'month');
  pages.bondIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
  pages.bondIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
  pages.bondIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

  pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');

  pages.bondIssueFacility.submit().click();
};

export default fillAndSubmitIssueBondFacilityForm;
