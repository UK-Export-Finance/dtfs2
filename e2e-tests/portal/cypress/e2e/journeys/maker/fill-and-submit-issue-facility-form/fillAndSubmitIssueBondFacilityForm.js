const pages = require('../../../pages');
const { nowPlusDays, nowPlusMonths } = require('../../../../support/utils/dateFuncs');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_BOND_DATE_VALUE = new Date();
export const COVER_START_DATE_VALUE = nowPlusDays(2);
export const COVER_END_DATE_VALUE = nowPlusMonths(1);

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
  pages.bondIssueFacility.issuedDateMonthInput().type(dateConstants.todayMonth);
  pages.bondIssueFacility.issuedDateYearInput().type(dateConstants.todayYear);

  pages.bondIssueFacility.coverEndDateDayInput().type(dateConstants.oneMonthDay);
  pages.bondIssueFacility.coverEndDateMonthInput().type(dateConstants.oneMonthMonth);
  pages.bondIssueFacility.coverEndDateYearInput().type(dateConstants.oneMonthYear);

  pages.bondIssueFacility.name().type('1234');

  pages.bondIssueFacility.submit().click();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
  pages.bondIssueFacility.issuedDateMonthInput().type(dateConstants.todayMonth);
  pages.bondIssueFacility.issuedDateYearInput().type(dateConstants.todayYear);

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateDayInput().type(dateConstants.twoDaysDay);

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateMonthInput().type(dateConstants.twoDaysMonth);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  pages.bondIssueFacility.requestedCoverStartDateYearInput().type(dateConstants.twoDaysYear);

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  pages.bondIssueFacility.coverEndDateDayInput().type(dateConstants.oneMonthDay);

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  pages.bondIssueFacility.coverEndDateMonthInput().type(dateConstants.oneMonthMonth);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  pages.bondIssueFacility.coverEndDateYearInput().type(dateConstants.oneMonthYear);

  pages.bondIssueFacility.name().type('1234');

  pages.bondIssueFacility.submit().click();
};
