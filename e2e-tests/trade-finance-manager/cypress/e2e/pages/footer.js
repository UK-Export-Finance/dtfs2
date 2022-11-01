const footer = {
  contactUs: () => cy.get('[data-cy="contact-us-footer"]'),
  cookiesLink: () => cy.get('[data-cy="cookies-link"]'),
  accessiblityLink: () => cy.get('[data-cy="accessibility-statement-link"]'),
  footer: () => cy.get('[data-cy="footer"]'),
};

module.exports = footer;
