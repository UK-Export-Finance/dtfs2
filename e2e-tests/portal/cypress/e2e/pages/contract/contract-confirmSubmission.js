const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/confirm-submission`),
  confirmSubmit: () => cy.get('[data-cy="confirmSubmit"]').get('#confirmSubmit'),
  acceptAndSubmit: () => ({
    click: (deal) => cy.get('[data-cy="AcceptAndSubmit"]').click().then(() => {
      if (deal) {
        return cy.submitDeal(deal._id, deal.dealType);
      }
    }),
  }),
  cancel: () => cy.get('[data-cy="Cancel"]'),

  expectError: (text) => cy.get('.govuk-error-summary').contains(text),
};

module.exports = page;
