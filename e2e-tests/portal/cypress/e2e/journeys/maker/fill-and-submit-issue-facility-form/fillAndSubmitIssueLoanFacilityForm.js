const pages = require('../../../pages');
const { oneMonth, today, twoDays } = require('../../../../../../e2e-fixtures/dateConstants');

export const ISSUED_LOAN_DATE_VALUE = today.date;
export const COVER_START_DATE_VALUE = twoDays.date;
export const COVER_END_DATE_VALUE = oneMonth.date;
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate = () => {
  cy.completeDateFormFields({ idPrefix: 'issuedDate' });

  cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: COVER_END_DATE_VALUE });

  cy.keyboardInput(pages.loanIssueFacility.disbursementAmount(), DISBURSEMENT_AMOUNT_VALUE);
  cy.keyboardInput(pages.loanIssueFacility.name(), '5678');

  cy.clickSubmitButton();
};

export const fillAndSubmitIssueLoanFacilityForm = () => {
  cy.completeDateFormFields({ idPrefix: 'issuedDate' });

  cy.completeDateFormFields({ idPrefix: 'requestedCoverStartDate', date: COVER_START_DATE_VALUE });

  cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: COVER_END_DATE_VALUE });

  cy.keyboardInput(pages.loanIssueFacility.disbursementAmount(), DISBURSEMENT_AMOUNT_VALUE);
  cy.keyboardInput(pages.loanIssueFacility.name(), '5678');

  cy.clickSubmitButton();
};
