const page = {
  // Header
  header: () => cy.get('[data-cy="header"]').find('.govuk-header__link--homepage'),
  crown: () => cy.get('.govuk-header__logo'),

  // Service navigation
  navigation: () => cy.get('[data-cy="serviceName-header"]'),
  navigationLink: () => cy.get('.govuk-service-navigation__link'),

  // Links
  dashboard: () => cy.get('[data-cy="header-dashboard-link"]'),
  reports: () => cy.get('[data-cy="header-reports-links"]'),
  uploadReport: () => cy.get('[data-cy="header-upload-report-link"]'),
  previousReport: () => cy.get('[data-cy="header-previous-reports-link"]'),
  recordCorrectionLog: () => cy.get('[data-cy="header-record-correction-log-link"]'),
  users: () => cy.get('[data-cy="header-users-link"]'),
  profile: () => cy.get('[data-cy="header-profile-link"]'),
  logout: () => cy.get('[data-cy="header-logout-link"]'),

  // Beta
  betaBanner: () => cy.get('[data-cy="beta-banner"]'),
  betaBannerTag: () => cy.get('[data-cy="beta-banner"] strong'),
  betaBannerHref: () => cy.get('[data-cy="beta-feedback-link"]'),
};

module.exports = page;
