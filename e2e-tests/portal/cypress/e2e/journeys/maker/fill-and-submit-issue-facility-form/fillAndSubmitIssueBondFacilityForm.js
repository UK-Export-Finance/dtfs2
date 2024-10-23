const pages = require('../../../pages');
const { oneMonth, today, twoDays } = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_BOND_DATE_VALUE = today.date;
export const COVER_START_DATE_VALUE = twoDays.date;
export const COVER_END_DATE_VALUE = oneMonth.date;

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.completeDateFormFields({ idPrefix: 'issuedDate' });

  cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: COVER_END_DATE_VALUE });

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  cy.completeDateFormFields({ idPrefix: 'issuedDate' });

  cy.completeDateFormFields({ idPrefix: 'requestedCoverStartDate', date: COVER_START_DATE_VALUE });

  cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: COVER_END_DATE_VALUE });

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};
