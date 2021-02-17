/* eslint-disable no-undef */
const mandatoryCriteria = {
  captionHead: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  mandatoryCriteriaText: () => cy.get('[data-cy="mandatory-criteria"]'),
  form: () => cy.get('[data-cy="form"]'),
  formError: () => cy.get('[data-cy="mandatory-criteria-error"]'),
  falseRadio: () => cy.get('[data-cy="mandatory-criteria-false"]'),
  trueRadio: () => cy.get('[data-cy="mandatory-criteria-true"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
};

export default mandatoryCriteria;
