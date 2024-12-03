const page = {
  requestedCoverStartDateError: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),
  coverEndDateError: () => cy.get('[data-cy="coverEndDate-error-message"]'),
  disbursementAmount: () => cy.get('[data-cy="disbursement-amount"]'),
  name: () => cy.get('[data-cy="name"]'),
};

module.exports = page;
