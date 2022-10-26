const pages = require('../../../pages');
const { nowPlusDays, nowPlusMonths } = require('../../../../support/utils/dateFuncs');

export const ISSUED_BOND_DATE_VALUE = new Date();
export const COVER_START_DATE_VALUE = nowPlusDays(2);
export const COVER_END_DATE_VALUE = nowPlusMonths(1);

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.getDate());
  pages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.getMonth() + 1);
  pages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.getFullYear());

  pages.bondIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.getDate());
  pages.bondIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.getMonth() + 1);
  pages.bondIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.getFullYear());

  pages.bondIssueFacility.name().type('1234');

  pages.bondIssueFacility.submit().click();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.getDate());
  pages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.getMonth() + 1);
  pages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.getFullYear());

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateDayInput().type(COVER_START_DATE_VALUE.getDate());

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateMonthInput().type(COVER_START_DATE_VALUE.getMonth() + 1);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateYearInput().type(COVER_START_DATE_VALUE.getFullYear());

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  pages.bondIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.getDate());

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  pages.bondIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.getMonth() + 1);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  pages.bondIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.getFullYear());

  pages.bondIssueFacility.name().type('1234');

  pages.bondIssueFacility.submit().click();
};
