const page = {
  // Footer
  footer: () => cy.get('[data-cy="footer"]'),
  crown: () => cy.get('.govuk-footer__crown'),
  coa: () => cy.get('.govuk-footer__meta-item'),
  navigation: () => cy.get('.govuk-footer__inline-list'),
  ogl: () => cy.get('.govuk-footer__licence-description'),

  // Links
  contact: () => cy.get('[data-cy="footer-contact-link"]'),
  feedback: () => cy.get('[data-cy="footer-feedback-link"]'),
  cookies: () => cy.get('[data-cy="footer-cookies-link"]'),
  accessibility: () => cy.get('[data-cy="footer-accessibility-statement-link"]'),
  vulnerability: () => cy.get('[data-cy="footer-report-vulnerability-link"]'),
};

module.exports = page;
