const moment = require('moment');
const pages = require('../../../pages');

const ISSUED_BOND_DATE_VALUE = moment();
export const COVER_START_DATE_VALUE = moment().add(2, 'day');
export const COVER_END_DATE_VALUE = moment().add(1, 'month');

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.format('DD'));
  pages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.format('MM'));
  pages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.format('DD'));
  pages.bondIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.format('MM'));
  pages.bondIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');

  pages.bondIssueFacility.submit().click();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.format('DD'));
  pages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.format('MM'));
  pages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateDayInput().type(COVER_START_DATE_VALUE.format('DD'));

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateMonthInput().type(COVER_START_DATE_VALUE.format('MM'));

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateYearInput().type(COVER_START_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.format('DD'));
  pages.bondIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.format('MM'));
  pages.bondIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.format('YYYY'));

  pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');

  pages.bondIssueFacility.submit().click();
};
