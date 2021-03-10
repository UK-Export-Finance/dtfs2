/* eslint-disable no-undef */
const ineligibleGef = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  content: () => cy.get('[data-cy="content"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
};

export default ineligibleGef;
