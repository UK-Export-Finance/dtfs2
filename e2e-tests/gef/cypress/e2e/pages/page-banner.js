const pageBanner = {
  header: () => cy.get('[data-cy="header"]'),
  homeLink: () => cy.get('[data-cy="gov-home-link-header"]'),
  crownLogo: () => cy.get('[data-cy="gov-crown-svg-header"]'),
  crownLogoTitle: () => cy.get('[data-cy="gov-crown-svg-title-header"]'),
  serviceName: () => cy.get('[data-cy="serviceName-header"]'),
  navigation: () => cy.get('[data-cy="navigation-header"]'),
  userName: () => cy.get('[data-cy="username-header"]'),
  profile: () => cy.get('[data-cy="header-profile-link"]'),
  betaBanner: () => cy.get('[data-cy="beta-banner"]'),
  betaBannerTag: () => cy.get('[data-cy="beta-banner"] strong'),
  betaBannerHref: () => cy.get('[data-cy="beta-feedback-link"]'),
  logout: () => cy.get('[data-cy="header-logout-link"]'),
};

module.exports = pageBanner;
