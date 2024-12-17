const checkFeeRecordCorrectionRequestPage = {
  reasonsChangeLink: () => cy.get(`a[data-cy="change-record-correction-reason-link"]`),
  additionalInfoChangeLink: () => cy.get(`a[data-cy="change-record-correction-additional-info-link"]`),
};

module.exports = { checkFeeRecordCorrectionRequestPage };
