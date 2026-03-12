const signInOTP = {
  shouldDisplayProblemWithServiceError: () => cy.get('[data-cy="problem-with-service-heading"]').should('exist'),
};

module.exports = signInOTP;
