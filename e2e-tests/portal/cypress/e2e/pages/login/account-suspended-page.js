const relative = require('../../relativeURL');

const accountSuspendedPage = {
  visit: () => cy.visit(relative('/login/temporarily-suspended-access-code')),
  heading: () => cy.get('[data-cy="account-temporarily-suspended-heading"]'),
  bodyText: () => cy.get('[data-cy="account-temporarily-suspended-message"]'),
  contactLink: () => cy.get('[data-cy="contact-us-email"]'),
};

module.exports = accountSuspendedPage;
