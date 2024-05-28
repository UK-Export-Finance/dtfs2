const signInLink = {
  visit: ({ token }, { failOnStatusCode = true } = {}) => cy.visit(`/login/sign-in-link?t=${token}`, { failOnStatusCode }),
  shouldDisplayProblemWithServiceError: () => cy.get('[data-cy="problem-with-service-heading"]').should('exist'),
};

module.exports = signInLink;
