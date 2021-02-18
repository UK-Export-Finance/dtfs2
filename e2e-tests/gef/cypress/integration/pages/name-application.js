/* eslint-disable no-undef */
const nameApplication = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  internalRef: () => cy.get('[data-cy="internal-ref"]'),
  additionalRef: () => cy.get('[data-cy="additional-ref"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel"]'),
};

export default nameApplication;
