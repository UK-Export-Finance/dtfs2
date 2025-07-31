const contact = {
  visit: () => cy.visit('/contact'),
  heading: () => cy.get('[data-cy="contact-us-heading"]'),
  emailHeading: () => cy.get('[data-cy="contact-us-email-heading"]'),
  email: () => cy.get('[data-cy="contact-us-email"]'),
  timeframe: () => cy.get('[data-cy="contact-us-timeframe"]'),
};

module.exports = contact;
