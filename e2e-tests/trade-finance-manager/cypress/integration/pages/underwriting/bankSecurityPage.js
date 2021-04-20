const bankSecurityPage = {
  bankSecurityHeading: () => cy.get('[data-cy="bank-security-heading"]'),
  bankSecurityText: () => cy.get('[data-cy="bank-security-text"]'),
};

module.exports = bankSecurityPage;
