/* eslint-disable no-undef */
const submitToUkef = {
  mainText: () => cy.get('[data-cy="main-text"]'),
  confirmSubmission: () => cy.get('[data-cy="confirm-submit-ukef"]'),
  confirmSubmissionCheckbox: () => cy.get('[data-cy="confirm-submit-ukef-checkbox"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
};

export default submitToUkef;
