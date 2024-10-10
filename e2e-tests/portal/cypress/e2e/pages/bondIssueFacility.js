const page = {
  requestedCoverStartDateError: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),
  coverEndDateError: () => cy.get('[data-cy="coverEndDate-error-message"]'),

  name: () => cy.get('[data-cy="name"]'),
};

module.exports = page;
