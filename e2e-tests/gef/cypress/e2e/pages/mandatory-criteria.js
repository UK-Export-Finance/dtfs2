/* eslint-disable no-undef */
const mandatoryCriteria = {
  captionHeading: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  mandatoryCriteriaText: () => cy.get('[data-cy="mandatory-criteria"]'),
  form: () => cy.get('[data-cy="form"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  firstErrorLink: () => cy.get('[data-cy="error-summary"]').first('a'),
  formError: () => cy.get('[data-cy="mandatory-criteria-error"]'),
  falseRadio: () => cy.get('[data-cy="mandatory-criteria-no"]'),
  trueRadio: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
  problemWithService: () => cy.get('[data-cy="problem-with-service"]'),
};

export default mandatoryCriteria;
