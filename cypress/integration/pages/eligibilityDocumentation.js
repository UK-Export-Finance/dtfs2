const page = {
  questionnaireFileInput: () => cy.get('[data-cy="exporterQuestionnaire"]'),
  fieldErrorMessage: (fieldname) => cy.get(`[data-cy="${fieldname}"] .govuk-error-message`),
  saveButton: () => cy.get('[data-cy="save-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
