const signInLink = {
  visit: ({ token, userId }, { failOnStatusCode = true } = {}) => cy.visit(`/login/sign-in-link?t=${token}&u=${userId}`, { failOnStatusCode }),
  shouldDisplayProblemWithServiceError: () => cy.get('[data-cy="problem-with-service-heading"]').should('exist'),
};

module.exports = signInLink;
