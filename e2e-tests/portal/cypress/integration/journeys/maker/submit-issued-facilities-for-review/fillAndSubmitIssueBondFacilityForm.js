const moment = require('moment');
const pages = require('../../../pages');

export const ISSUED_BOND_DATE_VALUE = moment();

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.format('DD'));
  pages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.format('MM'));
  pages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.format('YYYY'));

  const coverEndDate = moment().add(1, 'month');
  pages.bondIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
  pages.bondIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
  pages.bondIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

  pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');

  pages.bondIssueFacility.submit().click();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.format('DD'));
  pages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.format('MM'));
  pages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.format('YYYY'));

  const requestedCoverStartDate = moment().add(2, 'day');
  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateDayInput().type(requestedCoverStartDate.format('DD'));

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateMonthInput().type(requestedCoverStartDate.format('MM'));

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateYearInput().type(requestedCoverStartDate.format('YYYY'));

  const coverEndDate = moment().add(1, 'month');
  pages.bondIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
  pages.bondIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
  pages.bondIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

  pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');

  pages.bondIssueFacility.submit().click();
};
