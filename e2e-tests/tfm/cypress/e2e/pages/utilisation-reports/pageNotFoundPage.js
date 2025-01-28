const pageNotFoundPage = {
  reason: () => cy.get(`[data-cy="reason"]`),
  returnToPremiumPaymentsButton: () => cy.get(`[data-cy="return-to-premium-payments-button"]`),
};

export default pageNotFoundPage;
