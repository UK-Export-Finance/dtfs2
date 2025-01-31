const eligibility = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  criterionInlineError: (id) => cy.get(`[data-cy="inline-error-criterion-${id}"]`),
  allTrueRadioButtons: () => cy.get('[data-cy^="true-radio-criterion-"]'),
  allFalseRadioButtons: () => cy.get('[data-cy^="false-radio-criterion-"]'),
  criterionTrueRadioButton: (id) => cy.get(`[data-cy="true-radio-criterion-${id}"]`),
  criterionFalseRadioButton: (id) => cy.get(`[data-cy="false-radio-criterion-${id}"]`),
  criterionRadiosText: (id) => cy.get(`[data-cy="radio-wrapper-${id}"]`),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = eligibility;
