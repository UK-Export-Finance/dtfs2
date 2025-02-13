const partial = {
  userLink: () => cy.get('[data-cy="header-user-name"]'),
  signOutLink: () => cy.get('[data-cy="header-sign-out-link"]'),
  ukefLogo: () => cy.get('[data-cy="header-ukef-logo"]'),
  headerName: () => cy.get('[data-cy="header-TFM-header-name"]'),
  betaBanner: () => cy.get('[data-cy="beta-banner"]'),
  betaBannerTag: () => cy.get('[data-cy="beta-banner"] strong'),
  betaBannerHref: () => cy.get('[data-cy="beta-feedback-link"]'),
};

module.exports = partial;
