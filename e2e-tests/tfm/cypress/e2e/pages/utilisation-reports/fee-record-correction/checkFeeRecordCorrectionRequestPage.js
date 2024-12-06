const checkFeeRecordCorrectionRequestPage = {
  reasonsChangeLink: () => cy.get(`a[data-cy="change-record-correction-reason-link"]`).click(),
  additionalInfoChangeLink: () => cy.get(`a[data-cy="change-record-correction-additional-info-link"]`).click(),
};

module.exports = { checkFeeRecordCorrectionRequestPage };
