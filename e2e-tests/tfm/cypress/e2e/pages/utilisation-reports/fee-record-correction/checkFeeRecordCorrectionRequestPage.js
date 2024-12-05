const checkFeeRecordCorrectionRequestPage = {
  clickReasonsChangeLink: () => cy.get(`a[data-cy="change-record-correction-reason"]`).click(),
  clickAdditionalInfoChangeLink: () => cy.get(`a[data-cy="change-record-correction-additional-info"]`).click(),
};

module.exports = { checkFeeRecordCorrectionRequestPage };
