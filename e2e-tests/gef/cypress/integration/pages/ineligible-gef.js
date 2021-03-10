/* eslint-disable no-undef */
const ineligibleGef = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  content: () => cy.get('[data-cy="content"]'),
  backButton: () => cy.get('[data-cy="back-button"]'),
};

export default ineligibleGef;
