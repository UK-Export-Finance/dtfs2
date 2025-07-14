const page = {
  home: () => cy.get('[data-cy="header"]').find('.govuk-header__link--homepage'),
  serviceName: () => cy.get('[data-cy="header"]').find('.govuk-header__link--service-name'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
  reports: () => cy.get('[data-cy="reports"]'),
  users: () => cy.get('[data-cy="users"]'),

  profile: () => cy.get('.govuk-header__link').contains('Profile'),
  logOut: () => cy.get('.govuk-header__link').contains('Sign out'),

  homeLink: () => cy.get('[data-cy="gov-home-link-header"]'),
  crownLogo: () => cy.get('[data-cy="gov-crown-svg-header"]'),
  crownLogoTitle: () => cy.get('[data-cy="gov-crown-svg-title-header"]'),
  serviceNameLink: () => cy.get('[data-cy="serviceName-header"]'),
  navigation: () => cy.get('[data-cy="navigation-header"]'),
  userNameLink: () => cy.get('[data-cy="username-header"]'),
  profileLink: () => cy.get('[data-cy="header-profile-link"]'),
  logoutLink: () => cy.get('[data-cy="header-logout-link"]'),

  betaBanner: () => cy.get('[data-cy="beta-banner"]'),
  betaBannerTag: () => cy.get('[data-cy="beta-banner"] strong'),
  betaBannerHref: () => cy.get('[data-cy="beta-feedback-link"]'),
};

module.exports = page;
