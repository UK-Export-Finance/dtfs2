const bankRequestDatePage = {
  bankRequestDateDay: () => cy.get('[data-cy="bank-request-date-day"]'),
  bankRequestDateMonth: () => cy.get('[data-cy="bank-request-date-month"]'),
  bankRequestDateYear: () => cy.get('[data-cy="bank-request-date-year"]'),
};

module.exports = bankRequestDatePage;
