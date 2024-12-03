const landingPage = {
  visit: () => cy.visit('/'),
  email: () => cy.get('[data-cy="email"]'),
  password: () => cy.get('[data-cy="password"]'),
  signInHeading: () => cy.get('[data-cy="sign-in-heading"]'),
  emailHeading: () => cy.get('[data-cy="email-heading"]'),
  passwordHeading: () => cy.get('[data-cy="password-heading"]'),
};

module.exports = landingPage;
