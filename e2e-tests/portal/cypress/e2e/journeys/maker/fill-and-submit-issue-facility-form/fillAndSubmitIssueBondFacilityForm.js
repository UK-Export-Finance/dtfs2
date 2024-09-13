const pages = require('../../../pages');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_BOND_DATE_VALUE = dateConstants.today;
export const COVER_START_DATE_VALUE = dateConstants.twoDays;
export const COVER_END_DATE_VALUE = dateConstants.oneMonth;

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  pages.bondIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
  pages.bondIssueFacility.issuedDateMonthInput().type(dateConstants.todayMonth);
  pages.bondIssueFacility.issuedDateYearInput().type(dateConstants.todayYear);

  pages.bondIssueFacility.coverEndDateDayInput().type(dateConstants.oneMonthDay);
  pages.bondIssueFacility.coverEndDateMonthInput().type(dateConstants.oneMonthMonth);
  pages.bondIssueFacility.coverEndDateYearInput().type(dateConstants.oneMonthYear);

  pages.bondIssueFacility.name().type('1234');

  cy.clickSubmitButton();
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

  cy.clickSubmitButton();
};
