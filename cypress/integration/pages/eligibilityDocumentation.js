const page = {
  fieldErrorMessage: (fieldname) => cy.get(`[data-cy="${fieldname}"] .govuk-error-message`),
  saveButton: () => cy.get('[data-cy="save-button"]'),
};

module.exports = page;
