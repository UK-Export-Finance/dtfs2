/* eslint-disable no-undef */
const ineligibleGef = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  content: () => cy.get('[data-cy="content"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
};

export default ineligibleGef;
