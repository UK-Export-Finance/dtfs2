const checkFeeRecordCorrectionRequestPage = {
  clickReasonsChangeLink: () => cy.get(`a[data-cy="change-record-correction-reason-link"]`).click(),
  clickAdditionalInfoChangeLink: () => cy.get(`a[data-cy="change-record-correction-additional-info-link"]`).click(),
};

module.exports = { checkFeeRecordCorrectionRequestPage };
