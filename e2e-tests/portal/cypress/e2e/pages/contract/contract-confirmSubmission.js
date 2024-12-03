const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/confirm-submission`),
  confirmSubmit: () => cy.get('[data-cy="confirmSubmit"]').get('#confirmSubmit'),
  acceptAndSubmit: () => ({
    // eslint-disable-next-line consistent-return
    click: (deal) => {
      cy.get('[data-cy="AcceptAndSubmit"]').click();
      cy.wrap(deal).then((dealToSubmit) => {
        if (dealToSubmit) {
          cy.submitDeal(dealToSubmit._id, dealToSubmit.dealType);
        }
      });
    },
  }),
  cancel: () => cy.get('[data-cy="Cancel"]'),

  expectError: (text) => cy.get('.govuk-error-summary').contains(text),
};

module.exports = page;
