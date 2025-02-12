const feeRecordCorrectionLogDetailsPage = {
  detailsSummaryList: {
    container: () => cy.get(`[data-cy="summary-list"]`),
    exporter: () => cy.get(`[data-cy="summary-list"] [data-cy="exporter"]`),
    facilityId: () => cy.get(`[data-cy="summary-list"] [data-cy="facility-id"]`),
    dateSent: () => cy.get(`[data-cy="summary-list"] [data-cy="date-sent"]`),
    contactName: () => cy.get(`[data-cy="summary-list"] [data-cy="contact-name"]`),
    contactEmailAddresses: () => cy.get(`[data-cy="summary-list"] [data-cy="contact-email-addresses"]`),
    requestedBy: () => cy.get(`[data-cy="summary-list"] [data-cy="requested-by"]`),
    reasons: () => cy.get(`[data-cy="summary-list"] [data-cy="reasons"]`),
    additionalInfo: () => cy.get(`[data-cy="summary-list"] [data-cy="additional-info"]`),
    oldValues: () => cy.get(`[data-cy="summary-list"] [data-cy="old-values"]`),
    newValues: () => cy.get(`[data-cy="summary-list"] [data-cy="new-values"]`),
    bankCommentary: () => cy.get(`[data-cy="summary-list"] [data-cy="bank-commentary"]`),
    dateReceived: () => cy.get(`[data-cy="summary-list"] [data-cy="date-received"]`),
  },
};

module.exports = { feeRecordCorrectionLogDetailsPage };
