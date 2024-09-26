import { oneMonth, today, twoDays } from '../../../../../../e2e-fixtures/dateConstants';

const pages = require('../../../pages');

export const ISSUED_BOND_DATE_VALUE = today.date;
export const COVER_START_DATE_VALUE = twoDays.date;
export const COVER_END_DATE_VALUE = oneMonth.date;

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.keyboardInput(pages.bondIssueFacility.issuedDateDayInput(), today.day);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateMonthInput(), today.month);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateYearInput(), today.year);

  cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), oneMonth.day);
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), oneMonth.month);
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), oneMonth.year);

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  cy.keyboardInput(pages.bondIssueFacility.issuedDateDayInput(), today.day);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateMonthInput(), today.month);
  cy.keyboardInput(pages.bondIssueFacility.issuedDateYearInput(), today.year);

  pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateDayInput(), twoDays.day);

  pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateMonthInput(), twoDays.month);

  pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateYearInput(), twoDays.year);

  pages.bondIssueFacility.coverEndDateDayInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), oneMonth.day);

  pages.bondIssueFacility.coverEndDateMonthInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), oneMonth.month);

  pages.bondIssueFacility.coverEndDateYearInput().clear();
  cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), oneMonth.year);

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};
