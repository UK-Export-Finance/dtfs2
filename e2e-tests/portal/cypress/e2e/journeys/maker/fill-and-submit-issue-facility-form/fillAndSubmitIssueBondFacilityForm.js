const pages = require('../../../pages');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_BOND_DATE_VALUE = dateConstants.today;
export const COVER_START_DATE_VALUE = dateConstants.twoDays;
export const COVER_END_DATE_VALUE = dateConstants.oneMonth;

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.keyboardInput(pages.bondIssueFacility.issuedDateDayInput(), dateConstants.todayDay);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateMonthInput(), dateConstants.todayMonth);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateYearInput(), dateConstants.todayYear);

  cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), dateConstants.oneMonthDay);
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), dateConstants.oneMonthMonth);
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), dateConstants.oneMonthYear);

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  cy.keyboardInput(pages.bondIssueFacility.issuedDateDayInput(), dateConstants.todayDay);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateMonthInput(), dateConstants.todayMonth);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateYearInput(), dateConstants.todayYear);

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateDayInput(), dateConstants.twoDaysDay);

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateMonthInput(), dateConstants.twoDaysMonth);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateYearInput(), dateConstants.twoDaysYear);

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), dateConstants.oneMonthDay);

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), dateConstants.oneMonthMonth);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), dateConstants.oneMonthYear);

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};
