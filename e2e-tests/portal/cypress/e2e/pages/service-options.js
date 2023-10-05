const page = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  bodyText: () => cy.get('[data-cy="paragraph"]'),
  portalLink: () => cy.get('[data-cy="portal-link"]'),
  utilisationReportLink: () => cy.get('[data-cy="utilisation-report-link"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;
