/* eslint-disable no-undef */
const aboutExporter = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  industryTitle: () => cy.get('[data-cy="industry-title"]'),
  industry: () => cy.get('[data-cy="industry"]'),
  industries: () => cy.get('[data-cy="industries"]'),
  smeTypeError: () => cy.get('[data-cy="sme-type-error"]'),
  microRadioButton: () => cy.get('[data-cy="micro-radio-button"]'),
  smallRadioButton: () => cy.get('[data-cy="small-radio-button"]'),
  mediumRadioButton: () => cy.get('[data-cy="medium-radio-button"]'),
  notSMERadioButton: () => cy.get('[data-cy="not-sme-radio-button"]'),
  probabilityOfDefaultInput: () => cy.get('[data-cy="probability-of-default-input"]'),
  probabilityOfDefaultError: () => cy.get('[data-cy="probability-of-default-error"]'),
  isFinancingIncreasingRadioYes: () => cy.get('[data-cy="is-financing-increasing-radio-yes"]'),
  isFinancingIncreasingRadioNo: () => cy.get('[data-cy="is-financing-increasing-radio-no"]'),
  isFinancingIncreasingError: () => cy.get('[data-cy="is-financing-increasing-error"]'),
  doneButton: () => cy.get('[data-cy="done-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default aboutExporter;
