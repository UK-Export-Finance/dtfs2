const createFeeRecordCorrectionRequestPage = {
  reasonCheckbox: (reasonId) => cy.get(`input[data-cy="reason-${reasonId}"]`),
  reasonsInputError: () => cy.get(`[data-cy="reasons-error"]`),
  additionalInfoInput: () => cy.get(`textarea[data-cy="additional-info"]`),
  additionalInfoInputError: () => cy.get(`[data-cy="additional-info-error"]`),
  errorSummaryErrors: () => cy.get('[data-cy="error-summary"] a'),
};

module.exports = { createFeeRecordCorrectionRequestPage };
