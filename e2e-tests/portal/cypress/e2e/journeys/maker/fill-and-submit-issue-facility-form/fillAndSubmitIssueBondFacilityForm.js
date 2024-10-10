const pages = require('../../../pages');
const { oneMonth, today, twoDays } = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_BOND_DATE_VALUE = today;
export const COVER_START_DATE_VALUE = twoDays;
export const COVER_END_DATE_VALUE = oneMonth;

export const fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.completeDateFormFields({ idPrefix: 'issuedDate' });

  cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: oneMonth.date });

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueBondFacilityForm = () => {
  cy.completeDateFormFields({ idPrefix: 'issuedDate' });

  cy.completeDateFormFields({ idPrefix: 'requestedCoverStartDate', date: twoDays.date });

  cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: oneMonth.date });

  cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

  cy.clickSubmitButton();
};
